// Local, member-operated generator. Credentials are accepted only by this server and never persisted.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseCredentials, credentialEnv, redact, validateStart, classifyKaggleFailure, checkKaggleConnection } from './kaggle.mjs';
import { finalizeDownload, installedPackStatus, reusableRecordings } from './import.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const videoRoot = path.resolve(process.env.VIDEO_STUDIO_ROOT || path.join(root, '../../video-studio'));
const pack = path.join(root, 'voice/navigation-nhat-phong');
if (!fs.existsSync(path.join(pack, 'run.py'))) throw new Error('Chạy npm.cmd run voice:prepare trước.');
const catalog = JSON.parse(fs.readFileSync(path.join(pack, 'catalog.json'), 'utf8'));
const manifest = JSON.parse(fs.readFileSync(path.join(pack, 'voice-manifest.json'), 'utf8'));
const batchPlan = fs.existsSync(path.join(pack, 'batch-plan.json')) ? JSON.parse(fs.readFileSync(path.join(pack, 'batch-plan.json'), 'utf8')) : null;
const { kaggleStatus } = await import(pathToFileURL(path.join(videoRoot, 'tools/lib/kaggle.mjs')).href);
const cli = kaggleStatus();
if (!cli.installed) throw new Error('Chưa có Kaggle CLI. Cài trong video-studio bằng npm.cmd run setup:kaggle rồi chạy lại.');
const port = Number(process.env.VOICE_STUDIO_PORT || 3104), origin = `http://127.0.0.1:${port}`;
const token = randomBytes(24).toString('hex');
const workspace = path.join(root, '.prototype-runtime/voice-kaggle');
fs.mkdirSync(workspace, { recursive: true });
let state = { state: 'ready', phase: 'Chờ tải kaggle.json và bấm Bắt đầu sinh', voice: catalog.voice, phrases: catalog.stats.uniquePhrases, logs: [], ref: null, installed: 0, connection: null, errorCode: null };
const activePack = installedPackStatus();
if (activePack) state = { ...state, state: 'complete', installed: activePack.installed, warnings: activePack.warnings, phase: `Đã cài ${activePack.installed} câu vào ứng dụng. Nên nghe thử phát âm trước khi dùng thật.` };
let busy = false, child = null;
function save() { fs.writeFileSync(path.join(workspace, 'status.json'), JSON.stringify(state, null, 2) + '\n'); }
function phase(text) { state.phase = text; save(); }

async function run(args, credentials, env, { quiet = false } = {}) {
  return new Promise((resolve, reject) => {
    const lines = [];
    child = spawn(cli.bin, args, { cwd: root, env, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    for (const stream of [child.stdout, child.stderr]) {
      let pending = '';
      stream.setEncoding('utf8');
      const flush = (line) => {
        const clean = redact(line, credentials.key, credentials.username).replace(/\x1b\[[0-9;]*m/g, '').trim();
        if (!clean) return; lines.push(clean);
        if (!quiet) { state.logs.push(clean); state.logs = state.logs.slice(-80); save(); }
      };
      stream.on('data', text => { pending += text; const parts = pending.split(/[\r\n]+/); pending = parts.pop(); parts.forEach(flush); });
      stream.on('end', () => flush(pending));
    }
    child.on('error', () => reject(new Error('Không chạy được Kaggle CLI.')));
    child.on('close', code => { child = null; resolve({ code, text: lines.join('\n') }); });
  });
}

async function generate(credentials) {
  busy = true;
  state = { ...state, state: 'running', logs: [], installed: 0, ref: null, errorCode: null };
  try {
    phase('Kiểm tra kết nối tới Kaggle');
    const connection = await checkKaggleConnection();
    state.connection = connection;
    if (!connection.ok) {
      const error = new Error(connection.message);error.code = connection.code;throw error;
    }
    const configDir = fs.mkdtempSync(path.join(workspace, 'empty-config-'));
    const env = credentialEnv(credentials, configDir);
    const runDir = fs.mkdtempSync(path.join(workspace, 'run-'));
    const reusable = reusableRecordings(manifest);
    const useMissing = batchPlan?.sourceHash === manifest.sourceHash && batchPlan.reuse.length > 0 && batchPlan.generate.length > 0 && batchPlan.reuse.every(item => reusable.get(item.id)?.sha256 === item.sha256);
    phase(`Chuẩn bị kernel riêng tư · GPU T4 · Nhật Phong · sinh ${useMissing ? batchPlan.generate.length : manifest.phrases.length} câu, dùng lại ${useMissing ? batchPlan.reuse.length : 0} câu`);
    fs.copyFileSync(path.join(pack, useMissing ? 'run-missing.py' : 'run.py'), path.join(runDir, 'run.py'));
    const metadata = JSON.parse(fs.readFileSync(path.join(pack, 'kernel-metadata.template.json'), 'utf8'));
    metadata.id = `${credentials.username}/${metadata.title}`;
    state.ref = metadata.id;
    fs.writeFileSync(path.join(runDir, 'kernel-metadata.json'), JSON.stringify(metadata, null, 2));
    phase('Đẩy kernel lên Kaggle');
    const pushed = await run(['kernels', 'push', '-p', runDir, '--accelerator', 'NvidiaTeslaT4', '-t', '7200'], credentials, env);
    if (pushed.code !== 0 || /authentication required|kernel push error|forbidden|unauthorized/i.test(pushed.text)) {
      const failure = classifyKaggleFailure(pushed.text);
      const error = new Error(failure.message);error.code = failure.code;throw error;
    }
    const started = Date.now();
    let complete = false;
    while (Date.now() - started < 135 * 60_000) {
      await new Promise(resolve => setTimeout(resolve, 20_000));
      const status = await run(['kernels', 'status', metadata.id], credentials, env, { quiet: true });
      phase(`Kaggle đang xếp hàng / sinh giọng · ${Math.floor((Date.now() - started) / 60_000)} phút`);
      if (/\bcomplete\b/i.test(status.text)) { complete = true; break; }
      if (/\b(error|cancelled|canceled)\b/i.test(status.text)) throw new Error('Kernel Kaggle báo lỗi / bị hủy. Mở trang kernel để xem log.');
    }
    if (!complete) throw new Error('Hết thời gian theo dõi. Kiểm tra kernel trên Kaggle trước khi chạy lại.');
    const downloaded = path.join(runDir, 'downloads');
    fs.mkdirSync(downloaded, { recursive: true });
    phase('Tải các WAV về máy');
    const result = await run(['kernels', 'output', metadata.id, '-p', downloaded, '-o'], credentials, env);
    phase('Kiểm tra mã câu, nội dung manifest, WAV và thời lượng');
    const installed = finalizeDownload(downloaded, { downloadCode: result.code });
    if (installed.downloadWarning) { state.logs.push(installed.downloadWarning);save(); }
    state.installed = installed.installed; state.warnings = installed.warnings;
    state.state = 'complete'; phase(`Đã cài ${installed.installed} câu vào ứng dụng. Nên nghe thử phát âm trước khi dùng thật.`);
  } catch (error) {
    state.errorCode = error.code || 'GENERATION_FAILED';
    state.state = 'error'; phase(redact(error.message || 'Không sinh được giọng.', credentials.key, credentials.username));
  } finally { busy = false; credentials.key = ''; }
}

const html = `<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sinh giọng chỉ đường</title>
<style>body{font:16px/1.6 system-ui;max-width:900px;margin:32px auto;padding:0 20px;color:#193d32}section{border:1px solid #cad9d2;border-radius:12px;padding:20px;margin:18px 0}button{font:inherit;background:#146b5a;color:white;border:0;border-radius:8px;padding:12px 18px;cursor:pointer}button:disabled{opacity:.5}input{display:block;margin:12px 0}a{color:#146b5a}pre{white-space:pre-wrap;background:#f3f6f4;padding:16px;max-height:300px;overflow:auto}small{display:block}</style>
<h1>Sinh giọng chỉ đường</h1><p>Giọng <strong>Nhật Phong</strong> · ${catalog.stats.uniquePhrases} câu · 8 thứ tự thủ tục · thang máy và thang bộ.</p>
<p>Bao gồm mọi khoa và thủ tục trong ứng dụng. ${batchPlan?.sourceHash === manifest.sourceHash ? `Dự kiến sinh thêm ${batchPlan.generate.length} câu, dùng lại ${batchPlan.reuse.length} câu đã cài.` : ''}</p>
<section><h2>1. Bộ câu đã chuẩn bị</h2><a href="/review" target="_blank">Xem toàn bộ lời đọc</a> · <a href="/notebook">Tải notebook để chạy trực tiếp trên Kaggle</a><p>Tim mạch: sinh hóa máu và điện tim. Nội: sinh hóa máu, nước tiểu và siêu âm ổ bụng.</p></section>
<section><h2>2. Tài khoản Kaggle</h2><p id="connection">Đang kiểm tra kết nối tới Kaggle…</p><p>Chọn file kaggle.json tải từ tài khoản của bạn. Key chỉ được xử lý trong bộ nhớ của công cụ trên máy, không ghi vào bộ câu hoặc log.</p><input id="credentials" type="file" accept=".json,application/json"><button id="start">Bắt đầu sinh trên Kaggle</button><small>Thao tác này sử dụng quota GPU của tài khoản. Kernel riêng tư, GPU T4, giới hạn chạy 2 giờ.</small><p id="formMessage" role="status"></p></section>
<section><h2>3. Tiến độ</h2><p id="phase"></p><a id="kernel" target="_blank" rel="noreferrer"></a><pre id="logs"></pre></section>
<script>
const button=document.getElementById('start');
button.onclick=async()=>{const file=document.getElementById('credentials').files[0];if(!file){document.getElementById('formMessage').textContent='Chọn file kaggle.json trước.';return;}button.disabled=true;try{let kaggleJson=await file.text();const response=await fetch('/api/start',{method:'POST',headers:{'Content-Type':'application/json','X-Voice-Token':'${token}'},body:JSON.stringify({kaggleJson})});kaggleJson='';document.getElementById('credentials').value='';const result=await response.json();if(!response.ok)throw new Error(result.message);document.getElementById('formMessage').textContent='Đã nhận yêu cầu. Đang kiểm tra kết nối và gửi job lên Kaggle.';}catch(error){document.getElementById('formMessage').textContent=error.message;button.disabled=false;}};
async function update(){try{const response=await fetch('/api/status');const state=await response.json();document.getElementById('phase').textContent=state.phase;document.getElementById('logs').textContent=state.logs.join('\\n');document.getElementById('connection').textContent=state.connection?state.connection.message:'Đang kiểm tra kết nối tới Kaggle…';button.disabled=state.state==='running'||state.state==='complete';if(state.state==='complete')document.getElementById('formMessage').textContent='Bộ giọng đã sẵn sàng. Mở màn chỉ đường và bật loa để nghe thử.';if(state.ref){const link=document.getElementById('kernel');link.href='https://www.kaggle.com/code/'+state.ref;link.textContent='Mở kernel trên Kaggle';}else{document.getElementById('kernel').textContent='';}}catch{}}update();setInterval(update,3000);
</script></html>`;
function json(res, code, value) { res.writeHead(code, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(value)); }
const server = http.createServer(async (req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff'); res.setHeader('X-Frame-Options', 'DENY');
  if (req.headers.host !== `127.0.0.1:${port}`) { json(res, 403, { message: 'Chỉ dùng địa chỉ local.' }); return; }
  if (req.method === 'GET' && req.url === '/') { res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(html); return; }
  if (req.method === 'GET' && req.url === '/api/status') { json(res, 200, state); return; }
  if (req.method === 'GET' && req.url === '/review') { res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end(fs.readFileSync(path.join(pack, 'REVIEW.md'))); return; }
  if (req.method === 'GET' && req.url === '/notebook') { res.writeHead(200, { 'Content-Type': 'application/json', 'Content-Disposition': 'attachment; filename="vinmec-navigation.ipynb"' }); res.end(fs.readFileSync(path.join(pack, 'vinmec-navigation.ipynb'))); return; }
  if (req.method === 'POST' && req.url === '/api/start') {
    if (!validateStart(req.headers, origin, token)) { json(res, 403, { message: 'Mở công cụ trên chính địa chỉ local rồi thử lại.' }); return; }
    if (busy) { json(res, 409, { message: 'Đang có job sinh giọng.' }); return; }
    try {
      let raw = '';
      for await (const part of req) { raw += part.toString('utf8'); if (raw.length > 16_384) throw new Error('File quá lớn.'); }
      if (busy) { json(res, 409, { message: 'Đang có job sinh giọng.' }); return; }
      const credentials = parseCredentials(JSON.parse(raw).kaggleJson); raw = '';
      // No key is returned to the browser, logged, or saved. Starting requires a member's explicit click.
      void generate(credentials);
      json(res, 202, { started: true });
    } catch (error) { json(res, 400, { message: error.message === 'File quá lớn.' ? error.message : 'Không đọc được username/key hợp lệ từ kaggle.json.' }); }
    return;
  }
  json(res, 404, { message: 'Không có trang này.' });
});
server.listen(port, '127.0.0.1', () => {
  save(); console.log(`Voice generation ready: ${origin} · ${catalog.stats.uniquePhrases} phrases · Nhật Phong`);
  void checkKaggleConnection().then(connection => { state.connection = connection;save();console.log(`Kaggle connection: ${connection.ok ? 'reachable' : connection.code}`); });
});
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => {
  if (child) child.kill();
  if (busy) { state.state = 'interrupted'; phase('Công cụ đã dừng theo dõi. Kernel đã đẩy có thể vẫn chạy; kiểm tra trên Kaggle.'); }
  server.close(() => process.exit(0));
});
