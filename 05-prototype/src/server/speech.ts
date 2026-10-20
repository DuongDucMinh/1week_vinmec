import { normalizeSpeechText } from '../shared/navigationSpeech';

export interface SpeechProvider {
  readonly configured?: boolean;
  readonly source?: string;
  readonly recordings?: number;
  synthesize(text: string, signal?: AbortSignal): Promise<Buffer | { data: Buffer; contentType: 'audio/wav' }>;
}

export class SpeechError extends Error {
  constructor(public code: 'SPEECH_NOT_CONFIGURED' | 'SPEECH_UNAVAILABLE' | 'SPEECH_RECORDING_MISSING') { super(code); }
}

const vietnameseVoices = ['vi-VN-HoaiMyNeural', 'vi-VN-NamMinhNeural'];
const escapeXml = (text: string) => text.replace(/[<>&"']/g, char => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[char]!);

export class AzureSpeechProvider implements SpeechProvider {
  readonly source = 'azure';
  private cache = new Map<string, Buffer>();
  constructor(
    private key = process.env.AZURE_SPEECH_KEY || '',
    private region = process.env.AZURE_SPEECH_REGION || '',
    private voice = process.env.AZURE_SPEECH_VOICE || 'vi-VN-HoaiMyNeural',
    private transport: typeof fetch = fetch,
    private timeoutMs = 12_000,
  ) {}

  get configured() {
    return Boolean(this.key && /^[a-z0-9]+$/.test(this.region) && vietnameseVoices.includes(this.voice));
  }

  async synthesize(text: string, signal?: AbortSignal): Promise<Buffer> {
    // Keep both the language and voice explicit. Never let a provider select an English default.
    if (!this.configured) {
      throw new SpeechError('SPEECH_NOT_CONFIGURED');
    }
    signal?.throwIfAborted();
    const cached = this.cache.get(text);
    if (cached) return cached;
    // Room identifiers are read digit by digit, using Vietnamese letter names.
    const spoken = normalizeSpeechText(text);
    const timeout = AbortSignal.timeout(this.timeoutMs);
    try {
      const response = await this.transport(`https://${this.region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': this.key,
          'Content-Type': 'application/ssml+xml; charset=utf-8',
          'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
          'User-Agent': 'OceanParkCareNavigation',
        },
        signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
        body: `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="vi-VN"><voice name="${this.voice}"><prosody rate="-8%">${escapeXml(spoken)}</prosody></voice></speak>`,
      });
      if (!response.ok || !response.headers.get('content-type')?.toLowerCase().startsWith('audio/')) {
        throw new SpeechError('SPEECH_UNAVAILABLE');
      }
      const audio = Buffer.from(await response.arrayBuffer());
      if (!audio.length) throw new SpeechError('SPEECH_UNAVAILABLE');
      signal?.throwIfAborted();
      // Bound memory and reuse repeated directions without another billable synthesis.
      if (this.cache.size >= 64) this.cache.delete(this.cache.keys().next().value!);
      this.cache.set(text, audio);
      return audio;
    } catch {
      if (signal?.aborted) throw signal.reason;
      throw new SpeechError('SPEECH_UNAVAILABLE');
    }
  }
}
