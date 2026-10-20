import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import { reusableRecordings } from './import.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const arg = (name, fallback) => { const i = process.argv.indexOf(`--${name}`); return i < 0 ? fallback : process.argv[i + 1]; };
const videoRoot = path.resolve(arg('video-studio', path.join(root, '../../video-studio')));
const out = path.join(root, 'voice/navigation-nhat-phong');
fs.mkdirSync(path.join(root, '.prototype-runtime'), { recursive: true });
const bundle = path.join(root, '.prototype-runtime/voice-catalog.mjs');
await build({ entryPoints: [path.join(root, 'tools/voice/catalog.ts')], outfile: bundle, platform: 'node', format: 'esm', bundle: true, packages: 'external', logLevel: 'silent' });
const { buildCatalog } = await import(`${pathToFileURL(bundle).href}?t=${Date.now()}`);
const catalog = buildCatalog();
const voices = JSON.parse(fs.readFileSync(path.join(videoRoot, 'voices.json'), 'utf8'));
const voice = voices.voices.find(voice => voice.name === 'Nhật Phong');
const media = JSON.parse(fs.readFileSync(path.join(videoRoot, 'media/manifest.json'), 'utf8'));
if (!voice?.sample || !media.base || !media.assets?.[voice.sample]) throw new Error('Không tìm thấy mẫu Nhật Phong trong video-studio.');
const refUrl = `${media.base.replace(/\/+$/, '')}/${voice.sample.split('/').map(encodeURIComponent).join('/')}`;
const { buildRunPy } = await import(pathToFileURL(path.join(videoRoot, 'tools/lib/kaggle.mjs')).href);
const rows = catalog.phrases.map(phrase => ({ id: phrase.id, text: phrase.text, ref: 'nhat-phong', ref_text: voices.sampleText, language_id: 'vi', speed: 0.95 }));
const sourceHash = crypto.createHash('sha256').update(JSON.stringify({ voice: voice.name, model: catalog.model, sample: media.assets[voice.sample].sha256, rows })).digest('hex');
const manifest = { version: 1, sourceHash, voice: voice.name, model: catalog.model, phrases: catalog.phrases.map(({ id, text }) => ({ id, text, file: `${id}.wav` })) };
const reusable = reusableRecordings(manifest, { projectRoot: root });
const missingRows = rows.filter(row => !reusable.has(row.id));
const batchPlan = { sourceHash, total: rows.length, generate: missingRows.map(row => row.id), reuse: [...reusable.values()].map(item => ({ id: item.id, sha256: item.sha256 })) };
const makeRun = generationRows => buildRunPy({ refs: { 'nhat-phong': { url: refUrl } }, rows: generationRows, batchSize: 8 }) + `
# Bind every audio file to the reviewed text. No patient identifiers are included.
with open("out/voice-manifest.json", "w", encoding="utf-8") as f:
    json.dump(json.loads(${JSON.stringify(JSON.stringify(manifest))}), f, ensure_ascii=False, indent=2)
import importlib.metadata, datetime
with open("out/generation.json", "w", encoding="utf-8") as f:
    json.dump({"model": "k2-fsa/OmniVoice", "package": importlib.metadata.version("omnivoice"), "generatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat()}, f)
shutil.make_archive("vinmec-navigation-voice", "zip", "out")
print("READY: vinmec-navigation-voice.zip", flush=True)
`;
const run = makeRun(rows);
fs.mkdirSync(out, { recursive: true });
const writeJson = (name, data) => fs.writeFileSync(path.join(out, name), JSON.stringify(data, null, 2) + '\n');
writeJson('catalog.json', { ...catalog, sourceHash });
writeJson('voice-manifest.json', manifest);
writeJson('reference.json', { name: voice.name, sampleUrl: refUrl, sampleSha256: media.assets[voice.sample].sha256, transcript: voices.sampleText, speed: 0.95, videoStudio: videoRoot });
fs.writeFileSync(path.join(out, 'run.py'), run);
fs.writeFileSync(path.join(out, 'run-missing.py'), makeRun(missingRows));
writeJson('batch-plan.json', batchPlan);
fs.writeFileSync(path.join(out, 'voice-batch.jsonl'), rows.map(row => JSON.stringify({ id: row.id, text: row.text, ref_audio: 'refs/nhat-phong.wav', ref_text: row.ref_text, language_id: 'vi', speed: row.speed })).join('\n') + '\n');
const slug = `vinmec-nav-nhat-phong-${sourceHash.slice(0, 10)}`;
writeJson('kernel-metadata.template.json', { id: `YOUR_KAGGLE_USERNAME/${slug}`, title: slug, code_file: 'run.py', language: 'python', kernel_type: 'script', is_private: true, enable_gpu: true, enable_internet: true, dataset_sources: [], competition_sources: [], kernel_sources: [] });
writeJson('vinmec-navigation.ipynb', {
  cells: [{ cell_type: 'markdown', metadata: {}, source: [`# Giọng chỉ đường Vinmec · Nhật Phong\n${catalog.stats.uniquePhrases} câu. Bật GPU T4 và Internet rồi Run All. Kết quả: vinmec-navigation-voice.zip.\nKhông cần kaggle.json khi chạy trực tiếp trong tài khoản Kaggle của bạn.`] }, { cell_type: 'code', execution_count: null, metadata: {}, outputs: [], source: run.split(/(?<=\n)/) }],
  metadata: { kernelspec: { display_name: 'Python 3', language: 'python', name: 'python3' }, language_info: { name: 'python' }, kaggle: { accelerator: 'gpu', isInternetEnabled: true } }, nbformat: 4, nbformat_minor: 5,
});
const room = id => { const names = { 'DEMO-RECEPTION': 'Quầy tiếp nhận', 'DEMO-TIMMACH': 'Tim mạch A301', 'DEMO-NOI': 'Nội A201', 'DEMO-SINHHOA': 'Sinh hóa máu A205', 'DEMO-DIENTIM': 'Điện tim A601', 'DEMO-NUOCTIEU': 'Nước tiểu A501', 'DEMO-SIEUAM': 'Siêu âm ổ bụng B105' }; return names[id] || id; };
const readme = [
  '# Bộ giọng chỉ đường · Nhật Phong', '',
  `Đã xuất ${catalog.stats.uniquePhrases} câu riêng biệt cho ${catalog.stats.journeys} thứ tự thủ tục, ${catalog.stats.mixedTransportCombinations} tổ hợp chọn thang theo từng chặng.`,
  `Bao phủ ${catalog.stats.routeCases} trường hợp từ ${catalog.stats.origins} vị trí trong đồ thị tới ${catalog.stats.destinations} điểm đến, cả thang máy / thang bộ, đến nơi và cập nhật tuyến.`, '',
  `Bao gồm tất cả khoa khám, phòng thủ tục, tiếp nhận và cổng vào trong ứng dụng. Công cụ local chỉ cần sinh ${missingRows.length} câu còn thiếu, dùng lại ${reusable.size} WAV đã kiểm tra; notebook vẫn sinh bộ đầy đủ để chạy độc lập.`, '',
  '## Các hành trình', '', '| Mã | Thứ tự đầy đủ |', '|---|---|',
  ...catalog.journeys.map(journey => `| ${journey.id} | ${journey.stops.map(room).join(' → ')} |`), '',
  '## Giả định', '', ...catalog.assumptions.map(text => `- ${text}`), '',
  '## Sinh giọng', '',
  'Chạy `npm.cmd run voice:studio` trong thư mục 05-prototype rồi mở trang được in ra. Tải kaggle.json trực tiếp vào trang local và bấm Bắt đầu sinh. Key chỉ đi qua bộ nhớ; không gửi file key vào chat.',
  'Hoặc tạo notebook riêng tư trên Kaggle, chọn File → Import Notebook và tải vinmec-navigation.ipynb; bật Internet, GPU T4 rồi Run All. Cách này không cần kaggle.json.', '',
  'Kaggle chạy theo lô, dùng quota GPU của tài khoản. Sau khi xong, tải vinmec-navigation-voice.zip và giải nén. Chạy `npm.cmd run voice:import -- --from <thư-mục-giải-nén>` để kiểm tra và cài vào app.', '',
  'Trước khi dùng thật, nghe các WAV ở cả 8 hành trình; việc kiểm tra file / thời lượng không thay thế kiểm tra phát âm. Các câu hành trình / chờ / kết quả là kho câu bổ sung; nút loa hiện phát những câu navigation/reroute theo đúng UI.', '',
  'Danh sách đọc: REVIEW.md. Tất cả mã phòng và chữ số trong lời đọc đã chuyển sang cách đọc tiếng Việt. Sinh lại bộ câu bằng `npm.cmd run voice:prepare` khi sửa bản đồ hoặc câu chỉ dẫn.',
];
fs.writeFileSync(path.join(out, 'README.md'), readme.join('\n') + '\n');
fs.writeFileSync(path.join(out, 'REVIEW.md'), ['# Các câu sẽ gửi tới OmniVoice', '', '| STT | Mã file | Loại | Lời đọc |', '|---|---|---|---|', ...catalog.phrases.map((phrase, i) => `| ${i + 1} | ${phrase.id}.wav | ${phrase.categories.join(', ')} | ${phrase.text.replaceAll('|', '\\|')} |`)].join('\n') + '\n');
console.log(JSON.stringify({ directory: out, voice: voice.name, sourceHash, ...catalog.stats, toGenerate: missingRows.length, reuse: reusable.size }, null, 2));
