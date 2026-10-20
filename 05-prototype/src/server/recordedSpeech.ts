import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { speechId } from './speechKey';
import { normalizeSpeechText } from '../shared/navigationSpeech';
import { AzureSpeechProvider, SpeechError, type SpeechProvider } from './speech';

interface RecordedPhrase { id: string; text: string; file: string }
export class RecordedSpeechProvider implements SpeechProvider {
  private stamp = -1;
  private index = new Map<string, RecordedPhrase>();
  constructor(private fallback: SpeechProvider = new AzureSpeechProvider(), private root = path.resolve('data/navigation-voice')) {}
  private refresh() {
    const manifest = path.join(this.root, 'manifest.json');
    const stamp = existsSync(manifest) ? statSync(manifest).mtimeMs : 0;
    if (stamp === this.stamp) return;
    this.stamp = stamp; this.index.clear();
    if (!stamp) return;
    try {
      const parsed = JSON.parse(readFileSync(manifest, 'utf8'));
      if (parsed.version !== 1 || parsed.voice !== 'Nhật Phong' || !Array.isArray(parsed.phrases)) return;
      for (const phrase of parsed.phrases as RecordedPhrase[]) {
        if (typeof phrase.text !== 'string' || phrase.id !== speechId(phrase.text) || typeof phrase.file !== 'string') continue;
        const file = path.resolve(this.root, phrase.file);
        const relative = path.relative(this.root, file);
        if (relative.startsWith('..') || path.isAbsolute(relative) || !file.endsWith('.wav')) continue;
        this.index.set(phrase.id, { ...phrase, file });
      }
    } catch { this.index.clear(); }
  }
  get recordings() { this.refresh(); return this.index.size; }
  get configured() { return this.recordings > 0 || this.fallback.configured === true; }
  get source() { return this.recordings ? 'recorded-omnivoice' : this.fallback.configured ? 'azure' : 'not-configured'; }
  async synthesize(text: string, signal?: AbortSignal) {
    signal?.throwIfAborted(); this.refresh();
    const phrase = this.index.get(speechId(text));
    if (phrase && normalizeSpeechText(phrase.text) === normalizeSpeechText(text)) {
      try { return { data: readFileSync(phrase.file), contentType: 'audio/wav' as const }; }
      catch { /* An absent recording may use the explicitly configured Vietnamese provider. */ }
    }
    if (this.recordings > 0 && !this.fallback.configured) throw new SpeechError('SPEECH_RECORDING_MISSING');
    return this.fallback.synthesize(text, signal);
  }
}
