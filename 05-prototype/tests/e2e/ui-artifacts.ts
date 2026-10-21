import { mkdirSync } from 'node:fs';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import paths from '../../../00-luong-he-thong-qua-anh/danh-muc-anh.json' with { type: 'json' };

const gallery = fileURLToPath(new URL('../../../00-luong-he-thong-qua-anh/', import.meta.url));
const knownPaths: Record<string, string> = paths;

/** Save published UI captures in the root walkthrough, including newly added variants. */
export function uiArtifact(name: string): string {
  const destination = resolve(gallery, knownPaths[name] ?? `bo-sung/${name}`);
  const local = relative(gallery, destination);
  if (local === '..' || local.startsWith('../') || local.startsWith('..\\') || isAbsolute(local)) {
    throw new Error(`UI artifact must stay inside the walkthrough: ${name}`);
  }
  mkdirSync(dirname(destination), { recursive: true });
  return destination;
}
