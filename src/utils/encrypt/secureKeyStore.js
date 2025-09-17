// utils/secureKeyStore.js
// 负责：把服务端下发的 Key 用 AES 加密后本地存储；按需动态解密取回。
// 口令：MD5( Account-token + navigator.userAgent )

const LS_KEYS = {
  TOKEN: 'Account-token',
  KEY_ENC: '89qw', // 加密后 Key 的存储键（JSON：{igaisfbn, ysdbkjf}）
};

// 读取/写入 localStorage（容错）
const getLocal = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const setLocal = (k, v) => { try { localStorage.setItem(k, v); } catch {""} };
const delLocal = (k) => { try { localStorage.removeItem(k); } catch {""} };

// 加载 crypto-js（用于 MD5/AES）
function requireCryptoJS() {
  if (typeof window !== 'undefined' && window.CryptoJS) return window.CryptoJS;
  try { return require('crypto-js'); } catch {""}
  throw new Error('缺少 crypto-js，请先安装或在全局注入 CryptoJS');
}
function md5Hex(s) {
  const CryptoJS = requireCryptoJS();
  return CryptoJS.MD5(String(s)).toString(CryptoJS.enc.Hex);
}
function ua() {
  try { return navigator.userAgent || ''; } catch { return ''; }
}

// === AES 工具（CryptoJS AES/CBC/PKCS7） ===
function aesEncryptToB64(plain, keyHex) {
  const CryptoJS = requireCryptoJS();
  const keyWA = CryptoJS.enc.Hex.parse(keyHex);
  const ivWA  = CryptoJS.lib.WordArray.random(16);
  const ptWA  = CryptoJS.enc.Utf8.parse(String(plain));
  const enc   = CryptoJS.AES.encrypt(ptWA, keyWA, {
    iv: ivWA, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7,
  });
  const ysdbkjf = CryptoJS.enc.Base64.stringify(enc.ciphertext);
  const igaisfbn = CryptoJS.enc.Base64.stringify(ivWA);
  return { igaisfbn, ysdbkjf };
}
function aesDecryptFromB64({ igaisfbn, ysdbkjf }, keyHex) {
  const CryptoJS = requireCryptoJS();
  const keyWA = CryptoJS.enc.Hex.parse(keyHex);
  const ivWA  = CryptoJS.enc.Base64.parse(igaisfbn);
  const ctWA  = CryptoJS.enc.Base64.parse(ysdbkjf);
  const params = CryptoJS.lib.CipherParams.create({ ciphertext: ctWA });
  const decWA = CryptoJS.AES.decrypt(params, keyWA, {
    iv: ivWA, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7,
  });
  return CryptoJS.enc.Utf8.stringify(decWA);
}

// === 对外 API ===

/** 保存明文 Key（加密后落盘） */
export function saveEncryptedKey(keyPlain) {
  const token = getLocal(LS_KEYS.TOKEN) || '';
  if (!token) throw new Error('缺少 Account-token，无法加密保存 Key');
  const secretHex = md5Hex(token + ua()); // 口令：MD5(token + UA)
  const payload = aesEncryptToB64(String(keyPlain), secretHex);
  setLocal(LS_KEYS.KEY_ENC, JSON.stringify(payload));
}

/** 读取明文 Key（从本地解密拿到）；失败返回 null */
export function loadPlainKey() {
  try {
    const token = getLocal(LS_KEYS.TOKEN) || '';
    if (!token) return null;
    const encStr = getLocal(LS_KEYS.KEY_ENC);
    if (!encStr) return null;
    const payload = JSON.parse(encStr);
    const secretHex = md5Hex(token + ua());
    const keyPlain = aesDecryptFromB64(payload, secretHex);
    return keyPlain || null;
  } catch {
    return null;
  }
}

/** 清除本地保存的加密 Key */
export function clearEncryptedKey() {
  delLocal(LS_KEYS.KEY_ENC);
}

export const SecureKeyStore = {
  saveEncryptedKey,
  loadPlainKey,
  clearEncryptedKey,
};
