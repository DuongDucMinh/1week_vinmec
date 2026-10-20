export function parseCredentials(raw) {
  let data;
  try { data = JSON.parse(raw); } catch { throw new Error('File kaggle.json không hợp lệ.'); }
  const username = String(data?.username || '').trim(), key = String(data?.key || '').trim();
  if (!/^[A-Za-z0-9_-]{2,64}$/.test(username) || key.length < 10 || /\s/.test(key)) throw new Error('File cần có username và key hợp lệ.');
  return { username, key };
}
export function credentialEnv(credentials, configDir, inherited = process.env) {
  const env = { ...inherited, KAGGLE_CONFIG_DIR: configDir };
  for (const key of ['KAGGLE_USERNAME', 'KAGGLE_KEY', 'KAGGLE_API_TOKEN', 'KAGGLE_API_V1_TOKEN']) delete env[key];
  if (/^[a-f0-9]{32}$/i.test(credentials.key)) { env.KAGGLE_USERNAME = credentials.username; env.KAGGLE_KEY = credentials.key; }
  else env.KAGGLE_API_TOKEN = credentials.key;
  return env;
}
export const redact = (line, key, username = '') => {
  let clean = String(line).split(key).join('[KEY HIDDEN]');
  if (username) clean = clean.split(Buffer.from(`${username}:${key}`).toString('base64')).join('[AUTH HIDDEN]');
  return clean.replace(/(authorization\s*[:=]\s*(?:basic|bearer)\s+)[^\s"']+/gi, '$1[AUTH HIDDEN]');
};

export function validateStart(headers, expectedOrigin, token) {
  return headers.origin === expectedOrigin && headers['x-voice-token'] === token && String(headers['content-type'] || '').startsWith('application/json');
}

export function classifyKaggleFailure(output) {
  const text = String(output);
  if (/WinError\s*10013|EACCES|EPERM|socket.*(?:forbidden|permission)/i.test(text)) {
    return { code: 'NETWORK_BLOCKED', message: 'Công cụ bị chặn quyền kết nối tới Kaggle. Chạy công cụ ngoài sandbox hoặc trong PowerShell thông thường rồi thử lại; lỗi này chưa xác định key sai.' };
  }
  if (/Max retries exceeded|NewConnectionError|ConnectionError|timed?\s*out|ENOTFOUND|ECONNREFUSED|ENETUNREACH/i.test(text)) {
    return { code: 'NETWORK_UNAVAILABLE', message: 'Chưa kết nối được tới Kaggle. Kiểm tra mạng hoặc proxy rồi thử lại; job chưa được xác nhận.' };
  }
  if (/authentication required|unauthori[sz]ed|\b401\b|invalid.*(?:key|token)/i.test(text)) {
    return { code: 'AUTHENTICATION_FAILED', message: 'Kaggle không chấp nhận thông tin đăng nhập. Kiểm tra lại file kaggle.json của tài khoản.' };
  }
  if (/quota|resource.*exhaust|\b429\b/i.test(text)) {
    return { code: 'QUOTA_LIMIT', message: 'Kaggle báo giới hạn tài nguyên / tần suất. Kiểm tra quota GPU và các job đang chạy trong tài khoản.' };
  }
  return { code: 'KAGGLE_PUSH_FAILED', message: 'Kaggle chưa xác nhận job. Xem log và kiểm tra quyền GPU / Internet của tài khoản.' };
}

export async function checkKaggleConnection({ transport, timeoutMs = 10_000 } = {}) {
  if (transport) return transport();
  const https = await import('node:https');
  return new Promise(resolve => {
    const request = https.get('https://api.kaggle.com/', { timeout: timeoutMs }, response => {
      // Any HTTP response proves the public host is reachable. No credentials or GPU request is sent.
      response.resume();resolve({ ok: true, message: 'Đã kết nối tới Kaggle.' });
    });
    request.on('timeout', () => request.destroy(new Error('Connection timed out')));
    request.on('error', error => resolve({ ok: false, ...classifyKaggleFailure(`${error.code || ''} ${error.message}`) }));
  });
}
