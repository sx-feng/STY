// cryptoPipeline.js —— 仅 CryptoJS 版（含自动 MD5→16B 派生）
// 使用前确保：npm i crypto-js
import CryptoJS from 'crypto-js';

/* ========== 小工具：仅用于打印预览，避免刷屏 ========== */
function bytesToHex(u8) {
  let out = '';
  for (let i = 0; i < u8.length; i++) out += u8[i].toString(16).padStart(2, '0');
  return out;
}
function hexPreview(u8, head = 8, tail = 8) {
  const arr = (u8 instanceof Uint8Array) ? u8 : new Uint8Array(u8 || []);
  const len = arr.length;
  if (len <= head + tail) return bytesToHex(arr);
  const a = bytesToHex(arr.slice(0, head));
  const b = bytesToHex(arr.slice(len - tail));
  return `${a}..(${len}B)..${b}`;
}
function maskKey(u8) {
  const arr = (u8 instanceof Uint8Array) ? u8 : new Uint8Array(u8 || []);
  return `len=${arr.length} [${hexPreview(arr)}]`;
}

/* ========== 工具：编码/解码 ========== */
export function strToU8(str) { return new TextEncoder().encode(str ?? ''); }
export function u8ToStr(u8) { return new TextDecoder().decode(u8); }

export function hexToU8(hex) {
  const clean = (hex || '').trim().replace(/\s+/g, '');
  if (!/^[0-9a-fA-F]*$/.test(clean) || clean.length % 2 !== 0) {
    throw new Error('hexToU8: 非法 HEX 字符串或长度不是偶数');
  }
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < clean.length; i += 2) out[i >> 1] = parseInt(clean.slice(i, i + 2), 16);
  return out;
}

export function u8ToBase64(u8) {
  let s = '';
  for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]);
  return btoa(s);
}

export function base64ToU8(b64) {
  const original = b64;
  let s = (b64 || '').trim();
  const pad = s.length % 4;
  if (pad) s += '='.repeat(4 - pad);
  // eslint-disable-next-line no-useless-catch
  try {
    const bin = atob(s);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  } catch (e) {
    throw e;
  }
}

/* ========== 1) 莫斯密码：o=., O=-, 0=分隔 ========== */
const MORSE_MAP = {
  '.-': 'A','-...':'B','-.-.':'C','-..':'D','.':'E','..-.':'F','--.':'G','....':'H','..':'I','.---':'J',
  '-.-':'K','.-..':'L','--':'M','-.':'N','---':'O','.--.':'P','--.-':'Q','.-.':'R','...':'S','-':'T',
  '..-':'U','...-':'V','.--':'W','-..-':'X','-.--':'Y','--..':'Z',
  '-----':'0','.----':'1','..---':'2','...--':'3','....-':'4','.....':'5','-....':'6','--...':'7','---..':'8','----.':'9',
};

export function morseDecode(morseStr, { upper = true } = {}) {
  if (typeof morseStr !== 'string') throw new Error('morseDecode: 需要字符串');
  const parts = morseStr.replace(/[^oO0]/g, '').split('0').filter(s => s.length > 0);
  let out = '';
  for (const seq of parts) {
    const dotsDashes = seq.replace(/o/g, '.').replace(/O/g, '-');
    const ch = MORSE_MAP[dotsDashes] || '?';
    out += ch;
  }
  return upper ? out.toUpperCase() : out;
}

export function morseToUpperHex(morseStr) {
  const raw = morseDecode(morseStr, { upper: true });
  const hex = (raw.match(/[0-9A-F]/g) || []).join('');
  return hex;
}

/* ========== 2) HEX → 文本 (UTF-8) ========== */
export function hexTextToUtf8String(upperHexStr) {
  const hex = (upperHexStr || '').toUpperCase().replace(/[^0-9A-F]/g, '');
  if (hex.length % 2 !== 0) {
    throw new Error('hexTextToUtf8String: HEX 长度必须为偶数');
  }
  const text = u8ToStr(hexToU8(hex));
  return text;
}

/* ========== 3) Base64 → 字节 ========== */
export function base64TextToBytes(b64Text) {
  return base64ToU8((b64Text || '').trim());
}

/* ========== 4) 解包：[prefix][00][16B iv][cipher][00][suffix] ========== */
export function unpackEncryptedPayload(packedBytes) {
  const buf = (packedBytes instanceof Uint8Array) ? packedBytes : new Uint8Array(packedBytes || []);

  const firstZero = buf.indexOf(0x00);
  if (firstZero < 0) throw new Error('解包失败：找不到第一个 0x00 分隔符');

  const ivStart = firstZero + 1;
  const ivEnd = ivStart + 16;
  if (ivEnd > buf.length) throw new Error('解包失败：IV 越界');

  let lastZero = -1;
  for (let i = buf.length - 1; i >= ivEnd; i--) {
    if (buf[i] === 0x00) { lastZero = i; break; }
  }
  if (lastZero < 0) throw new Error('解包失败：找不到末尾 0x00 分隔符');
  if (lastZero < ivEnd) throw new Error('解包失败：cipher 区域无效');

  const iv = buf.slice(ivStart, ivEnd);
  const cipher = buf.slice(ivEnd, lastZero);

  if (iv.length !== 16) throw new Error('IV 长度应为 16 字节');
  if (cipher.length === 0) throw new Error('cipher 为空');

  // 非 16 倍数不强制报错（由解密阶段决定）
  return { iv, cipher };
}

/* ========== 5) AES-CBC(PKCS7) 解密（仅 CryptoJS） ========== */
function wordArrayFromU8(u8) {
  const words = [];
  for (let i = 0; i < u8.length; i += 4) {
    words.push(((u8[i] << 24) | ((u8[i + 1] || 0) << 16) | ((u8[i + 2] || 0) << 8) | ((u8[i + 3] || 0))) >>> 0);
  }
  return CryptoJS.lib.WordArray.create(words, u8.length);
}
function u8FromWordArray(wa) {
  const { words, sigBytes } = wa;
  const u8 = new Uint8Array(sigBytes);
  let i = 0;
  for (let w = 0; w < words.length; w++) {
    const word = words[w];
    for (let b = 3; b >= 0 && i < sigBytes; b--, i++) u8[i] = (word >>> (b * 8)) & 0xff;
  }
  return u8;
}

/** 将任意 key 归一化为 16/24/32 字节；若长度不合规且 autoDeriveMd5=true，则对原始输入做 MD5 并取前 16B。 */
function ensureAesKeyBytes(key, { autoDeriveMd5 = true, keyIsHex = false } = {}) {
  if (key instanceof Uint8Array) {
    if ([16, 24, 32].includes(key.length)) return key;
    if (!autoDeriveMd5) throw new Error('key 字节长度必须是 16/24/32');
    const md5 = CryptoJS.MD5(u8ToStr(key));
    const u8 = u8FromWordArray(md5);
    return u8.slice(0, 16);
  }

  if (typeof key === 'string') {
    if (keyIsHex) {
      const raw = hexToU8(key);
      if ([16, 24, 32].includes(raw.length)) return raw;
      if (!autoDeriveMd5) throw new Error('hex key 长度必须是 16/24/32 字节');
      const md5 = CryptoJS.MD5(key.toLowerCase());
      const u8 = u8FromWordArray(md5);
      return u8.slice(0, 16);
    } else {
      const md5 = CryptoJS.MD5(key);
      const u8 = u8FromWordArray(md5);
      return u8.slice(0, 16);
    }
  }

  throw new Error('aesCbcDecrypt: 不支持的 key 类型');
}

async function aesCbcDecrypt({ key, iv, cipher, autoDeriveMd5 = true, keyIsHex = false }) {
  if (!CryptoJS) throw new Error('需要依赖 crypto-js，请先安装并正确导入');

  const keyBytes = ensureAesKeyBytes(key, { autoDeriveMd5, keyIsHex });
  const ivBytes  = (iv instanceof Uint8Array) ? iv : new Uint8Array(iv);
  const ctBytes  = (cipher instanceof Uint8Array) ? cipher : new Uint8Array(cipher);

  const keyWA = wordArrayFromU8(keyBytes);
  const ivWA  = wordArrayFromU8(ivBytes);
  const ctWA  = wordArrayFromU8(ctBytes);

  // eslint-disable-next-line no-useless-catch
  try {
    const params = CryptoJS.lib.CipherParams.create({ ciphertext: ctWA });
    const decryptedWA = CryptoJS.AES.decrypt(params, keyWA, {
      iv: ivWA,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    const ptU8 = u8FromWordArray(decryptedWA);
    return u8ToStr(ptU8);
  } catch (e) {
    throw e;
  }
}

/* ========== 6) 一键管道：莫斯→HEX→文本→Base64→解包→AES 解密 ========== */
export async function decodeAll(morseCipher, key, { autoDeriveMd5 = true } = {}) {
  let upperHex, b64Text, packedBytes, iv, cipher;

  // 1) 莫斯 → 大写 HEX
  upperHex = morseToUpperHex(morseCipher);
  if (upperHex.length === 0) {
    throw new Error('decodeAll: 莫斯解码后未得到有效 HEX');
  }

  // 2) HEX → 文本（应为 Base64）
  b64Text = hexTextToUtf8String(upperHex);

  // 3) Base64 → 字节（整体打包）
  packedBytes = base64TextToBytes(b64Text);

  // 4) 解包
  const res = unpackEncryptedPayload(packedBytes);
  iv = res.iv; cipher = res.cipher;

  // 5) AES-CBC 解密（CryptoJS）
  const plaintext = await aesCbcDecrypt({ key, iv, cipher, autoDeriveMd5 });
  return plaintext;
}
