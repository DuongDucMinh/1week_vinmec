import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { parseCredentials, credentialEnv, redact, validateStart, classifyKaggleFailure, checkKaggleConnection } from './kaggle.mjs';
import { importPack, wavDuration, finalizeDownload, installedPackStatus, replaceManifest, reusableRecordings } from './import.mjs';

test('credentials stay in a per-process environment and override unrelated CLI authentication', () => {
  const credentials = parseCredentials(JSON.stringify({ username: 'example_user', key: 'a'.repeat(32) }));
  const env = credentialEnv(credentials, 'empty-config', { PATH: 'preserved', KAGGLE_API_TOKEN: 'unrelated', KAGGLE_API_V1_TOKEN: 'unrelated' });
  assert.equal(env.KAGGLE_KEY, credentials.key);assert.equal(env.KAGGLE_API_TOKEN, undefined);assert.equal(env.PATH, 'preserved');
  assert.equal(env.KAGGLE_CONFIG_DIR, 'empty-config');
  const token = credentialEnv({ username: 'example_user', key: 'KGAT_dummy_test_token' }, 'empty', { KAGGLE_KEY: 'unrelated', KAGGLE_USERNAME: 'unrelated' });
  assert.equal(token.KAGGLE_KEY, undefined);assert.equal(token.KAGGLE_USERNAME, undefined);assert.equal(token.KAGGLE_API_TOKEN, 'KGAT_dummy_test_token');
  assert.equal(redact(`secret=${credentials.key}`, credentials.key), 'secret=[KEY HIDDEN]');
  assert.equal(redact(Buffer.from(`${credentials.username}:${credentials.key}`).toString('base64'), credentials.key, credentials.username), '[AUTH HIDDEN]');
});
test('invalid files and cross-origin/unauthorized starts are rejected', () => {
  for (const raw of ['not json', '{}', '{"username":"bad space","key":"long-dummy-key"}']) assert.throws(() => parseCredentials(raw));
  const headers = { origin: 'http://127.0.0.1:3104', 'x-voice-token': 'test', 'content-type': 'application/json' };
  assert.equal(validateStart(headers, headers.origin, 'test'), true);
  assert.equal(validateStart({ ...headers, origin: 'https://unrelated.example' }, headers.origin, 'test'), false);
  assert.equal(validateStart(headers, headers.origin, 'wrong'), false);
});
test('blocked sockets and unavailable networks are not reported as a bad key', () => {
  const error = classifyKaggleFailure('HTTPSConnectionPool Max retries exceeded: [WinError 10013] socket access forbidden by permissions');
  assert.equal(error.code, 'NETWORK_BLOCKED');assert.match(error.message, /chưa xác định key sai/);
  assert.equal(classifyKaggleFailure('EACCES connect').code, 'NETWORK_BLOCKED');
  assert.equal(classifyKaggleFailure('NewConnectionError: Max retries exceeded').code, 'NETWORK_UNAVAILABLE');
  assert.equal(classifyKaggleFailure('401 Unauthorized').code, 'AUTHENTICATION_FAILED');
  assert.equal(classifyKaggleFailure('GPU quota exceeded').code, 'QUOTA_LIMIT');
});
test('connection preflight can run without credentials or a GPU operation', async () => {
  const result = await checkKaggleConnection({ transport: async () => ({ ok: true, message: 'reachable' }) });
  assert.equal(result.ok, true);
});
function wav(seconds = 2) {
  const bytes = Math.round(24_000 * 2 * seconds), buffer = Buffer.alloc(44 + bytes);
  buffer.write('RIFF');buffer.writeUInt32LE(buffer.length - 8, 4);buffer.write('WAVEfmt ', 8);buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);buffer.writeUInt16LE(1, 22);buffer.writeUInt32LE(24_000, 24);buffer.writeUInt32LE(48_000, 28);
  buffer.writeUInt16LE(2, 32);buffer.writeUInt16LE(16, 34);buffer.write('data', 36);buffer.writeUInt32LE(bytes, 40);return buffer;
}
function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'vinmec-voice-tools-'));
  const expectedDir = path.join(root, 'voice/navigation-nhat-phong'), source = path.join(root, 'download');
  fs.mkdirSync(expectedDir, { recursive: true });fs.mkdirSync(source);
  const manifest = { version: 1, voice: 'Nhật Phong', sourceHash: 'a'.repeat(64), phrases: [{ id: `vi-${'b'.repeat(20)}`, text: 'Mời bạn đi lên tầng hai.', file: `vi-${'b'.repeat(20)}.wav` }] };
  fs.writeFileSync(path.join(expectedDir, 'voice-manifest.json'), JSON.stringify(manifest));
  fs.writeFileSync(path.join(source, 'voice-manifest.json'), JSON.stringify(manifest));
  fs.writeFileSync(path.join(source, manifest.phrases[0].file), wav());
  const cleanup = () => { assert.ok(path.resolve(root).startsWith(path.resolve(os.tmpdir()) + path.sep));fs.rmSync(root, { recursive: true, force: true }); };
  return { root, source, manifest, cleanup };
}
test('validates WAV duration and installs the exact reviewed pack', () => {
  assert.equal(wavDuration(wav()), 2);assert.throws(() => wavDuration(Buffer.from('not a wav')));
  const data = fixture();try {
    const result = importPack(data.source, { projectRoot: data.root });assert.equal(result.installed, 1);
    const installed = JSON.parse(fs.readFileSync(result.manifest, 'utf8'));assert.equal(installed.phrases[0].seconds, 2);
    assert.ok(fs.existsSync(path.join(data.root, 'data/navigation-voice', installed.phrases[0].file)));
  } finally { data.cleanup(); }
});
test('accepts a fully validated download despite a nonzero Kaggle CLI exit code', () => {
  const data = fixture();try {
    const result = finalizeDownload(data.source, { downloadCode: 1, projectRoot: data.root });
    assert.equal(result.installed, 1);assert.match(result.downloadWarning, /WAV hợp lệ/);
    assert.equal(installedPackStatus({ projectRoot: data.root }).installed, 1);
  } finally { data.cleanup(); }
});
test('retries a temporary Windows lock without removing the active manifest', () => {
  const data=fixture();try {
    const target=path.join(data.root,'active.json'),temporary=path.join(data.root,'next.json');
    fs.writeFileSync(target,'old');fs.writeFileSync(temporary,'new');
    let attempts=0;const delays=[];
    replaceManifest(temporary,target,{wait:ms=>delays.push(ms),rename:(from,to)=>{
      assert.equal(fs.readFileSync(target,'utf8'),'old');
      if(++attempts<3)throw Object.assign(new Error('locked'),{code:'EPERM'});
      fs.renameSync(from,to);
    }});
    assert.equal(attempts,3);assert.deepEqual(delays,[30,100]);assert.equal(fs.readFileSync(target,'utf8'),'new');
  }finally{data.cleanup();}
});
test('preserves both manifests on a permanent Windows replacement denial', () => {
  const data=fixture();try {
    const target=path.join(data.root,'active.json'),temporary=path.join(data.root,'next.json');
    fs.writeFileSync(target,'old');fs.writeFileSync(temporary,'new');let attempts=0;
    assert.throws(()=>replaceManifest(temporary,target,{wait:()=>{},rename:()=>{attempts++;throw Object.assign(new Error('denied'),{code:'EPERM'});}}),error=>error.code==='EPERM');
    assert.equal(attempts,5);assert.equal(fs.readFileSync(target,'utf8'),'old');assert.equal(fs.readFileSync(temporary,'utf8'),'new');
  }finally{data.cleanup();}
});
test('reports a local installation failure separately from an incomplete download', () => {
  const data=fixture();try {
    fs.mkdirSync(path.join(data.root,'data'),{recursive:true});
    fs.writeFileSync(path.join(data.root,'data/navigation-voice'),'blocks-directory');
    assert.throws(()=>finalizeDownload(data.source,{projectRoot:data.root}),error=>error.code==='VOICE_INSTALL_FAILED'&&/đã kiểm tra hợp lệ/.test(error.message));
  }finally{data.cleanup();}
});
function expandPack(data) {
  const phrase={id:`vi-${'c'.repeat(20)}`,text:'Vào thang máy và lên tầng bốn.',file:`vi-${'c'.repeat(20)}.wav`};
  const expanded={...data.manifest,sourceHash:'d'.repeat(64),phrases:[...data.manifest.phrases,phrase]};
  fs.writeFileSync(path.join(data.root,'voice/navigation-nhat-phong/voice-manifest.json'),JSON.stringify(expanded));
  fs.writeFileSync(path.join(data.source,'voice-manifest.json'),JSON.stringify(expanded));
  fs.writeFileSync(path.join(data.source,phrase.file),wav());
  fs.unlinkSync(path.join(data.source,data.manifest.phrases[0].file));
  return expanded;
}
test('merges a missing-only download with verified cached recordings before activating the complete pack',()=>{
  const data=fixture();try{
    const old=importPack(data.source,{projectRoot:data.root});
    const original=JSON.parse(fs.readFileSync(old.manifest,'utf8'));
    const expanded=expandPack(data);
    assert.equal(reusableRecordings(expanded,{projectRoot:data.root}).size,1);
    assert.equal(importPack(data.source,{projectRoot:data.root}).installed,2);
    assert.equal(installedPackStatus({projectRoot:data.root}).installed,2);
    const active=JSON.parse(fs.readFileSync(old.manifest,'utf8'));
    assert.equal(active.phrases[0].sha256,original.phrases[0].sha256);
    // Importing the same partial output again must not copy a cached file onto itself.
    assert.equal(importPack(data.source,{projectRoot:data.root}).installed,2);
  }finally{data.cleanup();}
});
test('rejects damaged or mismatched cached recordings and preserves the active manifest',()=>{
  const data=fixture();try{
    const result=importPack(data.source,{projectRoot:data.root});
    const original=fs.readFileSync(result.manifest,'utf8'),active=JSON.parse(original);
    const expanded=expandPack(data);
    assert.equal(reusableRecordings({...expanded,voice:'another voice'},{projectRoot:data.root}).size,0);
    assert.equal(reusableRecordings({...expanded,model:'another model'},{projectRoot:data.root}).size,0);
    assert.equal(reusableRecordings({...expanded,phrases:expanded.phrases.map(p=>({...p,text:'different text'}))},{projectRoot:data.root}).size,0);
    fs.writeFileSync(path.join(data.root,'data/navigation-voice',active.phrases[0].file),wav(3));
    assert.equal(reusableRecordings(expanded,{projectRoot:data.root}).size,0);
    assert.throws(()=>importPack(data.source,{projectRoot:data.root}));
    assert.equal(fs.readFileSync(result.manifest,'utf8'),original);
  }finally{data.cleanup();}
});
test('rejects incomplete downloads even with exit code zero, and detects damaged installed files', () => {
  const data = fixture();try {
    const result = importPack(data.source, { projectRoot: data.root });
    const installed = JSON.parse(fs.readFileSync(result.manifest, 'utf8'));
    fs.writeFileSync(path.join(data.root, 'data/navigation-voice', installed.phrases[0].file), wav(3));
    assert.equal(installedPackStatus({ projectRoot: data.root }), null);
    fs.unlinkSync(path.join(data.source, data.manifest.phrases[0].file));
    assert.throws(() => finalizeDownload(data.source, { downloadCode: 0, projectRoot: data.root }), error => error.code === 'DOWNLOAD_INCOMPLETE');
  } finally { data.cleanup(); }
});
test('rejects another pack, an incomplete batch, or a very short recording before activation', () => {
  const data = fixture();try {
    fs.writeFileSync(path.join(data.source, 'voice-manifest.json'), JSON.stringify({ ...data.manifest, sourceHash: 'wrong' }));
    assert.throws(() => importPack(data.source, { projectRoot: data.root }), /không khớp/);
    fs.writeFileSync(path.join(data.source, 'voice-manifest.json'), JSON.stringify(data.manifest));
    fs.writeFileSync(path.join(data.source, data.manifest.phrases[0].file), wav(0.05));
    assert.throws(() => importPack(data.source, { projectRoot: data.root }), /Thời lượng/);
    fs.unlinkSync(path.join(data.source, data.manifest.phrases[0].file));
    assert.throws(() => importPack(data.source, { projectRoot: data.root }));
    assert.equal(fs.existsSync(path.join(data.root, 'data/navigation-voice/manifest.json')), false);
  } finally { data.cleanup(); }
});
