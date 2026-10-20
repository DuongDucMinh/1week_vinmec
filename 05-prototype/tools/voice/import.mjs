import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
// Windows scanners/readers can briefly deny replacement. Never unlink the active
// manifest or write over it in place: a failed replacement must preserve it.
export function replaceManifest(temporary, target, { rename = fs.renameSync, wait = ms => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms) } = {}) {
  const delays = [30, 100, 250, 500];
  for (let attempt = 0; ; attempt++) {
    try { rename(temporary, target); return; }
    catch (error) {
      if (!['EPERM', 'EACCES', 'EBUSY'].includes(error.code) || attempt === delays.length) throw error;
      wait(delays[attempt]);
    }
  }
}
export function wavDuration(buffer) {
  if (buffer.length < 44 || buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WAVE') throw new Error('Tệp không phải WAV hợp lệ.');
  let bytesPerSecond = 0, dataLength = 0;
  for (let offset = 12; offset + 8 <= buffer.length;) {
    const type = buffer.toString('ascii', offset, offset + 4), size = buffer.readUInt32LE(offset + 4);
    if (offset + 8 + size > buffer.length) throw new Error('WAV bị thiếu dữ liệu.');
    if (type === 'fmt ' && size >= 16) bytesPerSecond = buffer.readUInt32LE(offset + 16);
    if (type === 'data') dataLength += size;
    offset += 8 + size + size % 2;
  }
  if (!bytesPerSecond || !dataLength) throw new Error('WAV không có âm thanh.');
  return dataLength / bytesPerSecond;
}

// Reuse only the exact reviewed text/voice/model and a verified local WAV.
export function reusableRecordings(expected, { projectRoot = root } = {}) {
  const folder = path.join(projectRoot, 'data/navigation-voice'), reusable = new Map();
  try {
    const installed = JSON.parse(fs.readFileSync(path.join(folder, 'manifest.json'), 'utf8'));
    if (installed.voice !== expected.voice || installed.model !== expected.model) return reusable;
    for (const phrase of expected.phrases) {
      const item = installed.phrases.find(item => item.id === phrase.id && item.text === phrase.text);
      if (!item || typeof item.file !== 'string' || !item.sha256) continue;
      const source = path.resolve(folder, item.file), relative = path.relative(folder, source);
      if (relative.startsWith('..') || path.isAbsolute(relative) || !source.endsWith('.wav')) continue;
      try {
        const audio = fs.readFileSync(source);wavDuration(audio);
        if (crypto.createHash('sha256').update(audio).digest('hex') === item.sha256) reusable.set(phrase.id, { ...item, source });
      } catch { /* A missing/damaged cache entry must be generated again. */ }
    }
  } catch { /* No installed pack yet. */ }
  return reusable;
}

export function importPack(from, { projectRoot = root } = {}) {
  let source = path.resolve(from);
  if (!fs.existsSync(path.join(source, 'voice-manifest.json')) && fs.existsSync(path.join(source, 'out/voice-manifest.json'))) source = path.join(source, 'out');
  const expected = JSON.parse(fs.readFileSync(path.join(projectRoot, 'voice/navigation-nhat-phong/voice-manifest.json'), 'utf8'));
  const received = JSON.parse(fs.readFileSync(path.join(source, 'voice-manifest.json'), 'utf8'));
  if (received.sourceHash !== expected.sourceHash || received.voice !== expected.voice || received.phrases.length !== expected.phrases.length) throw new Error('Bộ âm thanh không khớp bộ câu hiện tại. Chưa cài giọng.');
  const target = path.join(projectRoot, 'data/navigation-voice'), generation = expected.sourceHash;
  const reusable = reusableRecordings(expected, { projectRoot });
  const items = [], warnings = [];
  // Validate every item before publishing a new manifest. The old pack remains active on any failure.
  for (const phrase of expected.phrases) {
    const found = received.phrases.find(item => item.id === phrase.id);
    if (!/^vi-[a-f0-9]{20}$/.test(phrase.id) || found?.text !== phrase.text || found?.file !== `${phrase.id}.wav`) throw new Error(`Sai nội dung / mã câu: ${phrase.id}`);
    const downloaded = path.join(source, found.file);
    const file = fs.existsSync(downloaded) ? downloaded : reusable.get(phrase.id)?.source || downloaded;
    const audio = fs.readFileSync(file), seconds = wavDuration(audio);
    const words = phrase.text.split(/\s+/).length;
    if (seconds < Math.max(0.3, words * 0.12) || seconds > Math.max(60, words * 2)) throw new Error(`Thời lượng bất thường: ${phrase.id} (${seconds.toFixed(1)} giây). Cần nghe / sinh lại.`);
    if (seconds < words * 0.18) warnings.push(`${phrase.id}: ngắn hơn dự kiến, nên nghe lại.`);
    items.push({ ...phrase, file: `${generation}/${found.file}`, seconds, sha256: crypto.createHash('sha256').update(audio).digest('hex'), source: file });
  }
  try {
    const destination = path.join(target, generation);
    fs.mkdirSync(destination, { recursive: true });
    for (const item of items) if (path.resolve(item.source) !== path.resolve(target, item.file)) fs.copyFileSync(item.source, path.join(target, item.file));
    const manifest = { ...expected, phrases: items.map(({ source: _source, ...item }) => item), importedAt: new Date().toISOString(), warnings };
    const temporary = path.join(target, 'manifest.json.tmp');
    fs.writeFileSync(temporary, JSON.stringify(manifest, null, 2) + '\n');
    replaceManifest(temporary, path.join(target, 'manifest.json'));
  } catch (cause) {
    const error = new Error(`Bộ âm thanh đã kiểm tra hợp lệ nhưng chưa cài được trên máy. ${cause.message} Kiểm tra quyền ghi / thay file hoặc ứng dụng đang khóa file, rồi nhập lại bản đã tải; không cần sinh lại trên Kaggle.`, { cause });
    error.code = 'VOICE_INSTALL_FAILED';
    throw error;
  }
  return { installed: items.length, warnings, manifest: path.join(target, 'manifest.json') };
}

// The CLI can return a nonzero code after downloading all required output files.
// The reviewed manifest and WAV validation decide whether the result is usable.
export function finalizeDownload(from, { downloadCode = 0, projectRoot = root } = {}) {
  try {
    const installed = importPack(from, { projectRoot });
    return { ...installed, downloadWarning: downloadCode === 0 ? null : 'Kaggle CLI trả mã lỗi, nhưng đã kiểm tra đủ manifest và toàn bộ WAV hợp lệ.' };
  } catch (cause) {
    if (cause.code === 'VOICE_INSTALL_FAILED') throw cause;
    const error = new Error(`Chưa đủ bộ âm thanh hợp lệ để cài. ${cause.message} Giữ lại kết quả trên Kaggle; không cần sinh lại toàn bộ.`);
    error.code = 'DOWNLOAD_INCOMPLETE';
    throw error;
  }
}

export function installedPackStatus({ projectRoot = root } = {}) {
  try {
    const expected = JSON.parse(fs.readFileSync(path.join(projectRoot, 'voice/navigation-nhat-phong/voice-manifest.json'), 'utf8'));
    const folder = path.join(projectRoot, 'data/navigation-voice');
    const installed = JSON.parse(fs.readFileSync(path.join(folder, 'manifest.json'), 'utf8'));
    if (installed.sourceHash !== expected.sourceHash || installed.voice !== expected.voice || installed.phrases.length !== expected.phrases.length) return null;
    for (const phrase of expected.phrases) {
      const item = installed.phrases.find(item => item.id === phrase.id);
      if (!item || item.text !== phrase.text || item.file !== `${expected.sourceHash}/${phrase.id}.wav`) return null;
      const audio = fs.readFileSync(path.join(folder, item.file));
      wavDuration(audio);
      if (crypto.createHash('sha256').update(audio).digest('hex') !== item.sha256) return null;
    }
    return { installed: installed.phrases.length, warnings: installed.warnings || [], sourceHash: installed.sourceHash };
  } catch { return null; }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const index = process.argv.indexOf('--from');
  if (index < 0 || !process.argv[index + 1]) { console.error('Dùng: npm.cmd run voice:import -- --from <thư-mục-WAV>'); process.exitCode = 1; }
  else { try { console.log(JSON.stringify(importPack(process.argv[index + 1]), null, 2)); } catch (error) { console.error(error.message); process.exitCode = 1; } }
}
