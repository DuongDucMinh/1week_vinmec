import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, expect, it, vi } from 'vitest';
import { RecordedSpeechProvider } from '../../src/server/recordedSpeech';
import { speechId } from '../../src/server/speechKey';
const directories: string[] = [];
afterEach(() => { for (const root of directories.splice(0)) rmSync(root, { recursive: true, force: true }); });
function fixture() {
  const root = mkdtempSync(path.join(os.tmpdir(), 'vinmec-recorded-test-'));directories.push(root);
  const text = 'Đi lên tầng 2.', id = speechId(text);mkdirSync(path.join(root, 'pack'));
  writeFileSync(path.join(root, `pack/${id}.wav`), Buffer.from('RIFF-test-fixture'));
  const manifest = { version: 1, voice: 'Nhật Phong', phrases: [{ id, text, file: `pack/${id}.wav` }] };
  writeFileSync(path.join(root, 'manifest.json'), JSON.stringify(manifest));
  return { root, manifest, text, id };
}
it('plays an installed recording without requiring an Azure key or calling a provider', async () => {
  const { root, text } = fixture(), synthesize = vi.fn();
  const provider = new RecordedSpeechProvider({ configured: false, synthesize }, root);
  expect(provider.configured).toBe(true);expect(provider.source).toBe('recorded-omnivoice');expect(provider.recordings).toBe(1);
  expect(await provider.synthesize(text)).toEqual({ data: Buffer.from('RIFF-test-fixture'), contentType: 'audio/wav' });
  expect(synthesize).not.toHaveBeenCalled();
});
it('matches spoken-equivalent text and falls back only for an absent sentence', async () => {
  const { root } = fixture(), synthesize = vi.fn().mockResolvedValue(Buffer.from('azure'));
  const provider = new RecordedSpeechProvider({ configured: true, synthesize }, root);
  await provider.synthesize('Đi lên tầng hai.');expect(synthesize).not.toHaveBeenCalled();
  expect(await provider.synthesize('Rẽ phải.')).toEqual(Buffer.from('azure'));expect(synthesize).toHaveBeenCalledOnce();
});
it('reports a missing recording separately when an installed pack has no sentence and Azure is unavailable',async()=>{
  const {root}=fixture(),synthesize=vi.fn();
  const provider=new RecordedSpeechProvider({configured:false,synthesize},root);
  await expect(provider.synthesize('Vào thang máy và lên tầng 4.')).rejects.toMatchObject({code:'SPEECH_RECORDING_MISSING'});
  expect(synthesize).not.toHaveBeenCalled();
});
it('does not allow a manifest to read files outside its audio directory', async () => {
  const { root, manifest, text } = fixture();manifest.phrases[0].file = '../private.wav';writeFileSync(path.join(root, 'manifest.json'), JSON.stringify(manifest));
  const synthesize = vi.fn().mockResolvedValue(Buffer.from('fallback'));
  const provider = new RecordedSpeechProvider({ configured: false, synthesize }, root);
  expect(provider.recordings).toBe(0);await provider.synthesize(text);expect(synthesize).toHaveBeenCalledOnce();
});
it('handles an uninstalled/corrupt pack and honors canceled speech', async () => {
  const { root } = fixture();writeFileSync(path.join(root, 'manifest.json'), '{bad');
  const synthesize = vi.fn();const provider = new RecordedSpeechProvider({ configured: false, synthesize }, root);
  expect(provider.configured).toBe(false);
  const controller = new AbortController();controller.abort();await expect(provider.synthesize('Rẽ phải', controller.signal)).rejects.toMatchObject({ name: 'AbortError' });
  expect(synthesize).not.toHaveBeenCalled();
});
