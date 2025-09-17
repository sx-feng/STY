// src/utils/encrypt/Custom.js
import CryptoJS from 'crypto-js';

/* ===== 最小工具集合 ===== */
function strToBytes(s) { return new TextEncoder().encode(String(s)); }
function u8ToBase64(u8) { let bin=''; for (let i=0;i<u8.length;i++) bin+=String.fromCharCode(u8[i]); return btoa(bin); }
function base64ToU8(b64){ const bin=atob(b64); const out=new Uint8Array(bin.length); for(let i=0;i<bin.length;i++) out[i]=bin.charCodeAt(i); return out; }
function hexToU8(hex){ if(hex.length%2!==0) throw new Error('hex 长度必须为偶数'); const out=new Uint8Array(hex.length/2); for(let i=0;i<out.length;i++) out[i]=parseInt(hex.substr(i*2,2),16); return out; }
function randomHexDigits(nBytes){ let s=''; for(let i=0;i<nBytes;i++){ const v=1+Math.floor(Math.random()*9); s+=v.toString(16).padStart(2,'0'); } return s; }
function randomSeed(){ const chars='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_@#'; const len=16+Math.floor(Math.random()*9); let s=''; for(let i=0;i<len;i++) s+=chars[Math.floor(Math.random()*chars.length)]; return s; }
function randomText10to50(){ const chars='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; const len=10+Math.floor(Math.random()*41); let s=''; for(let i=0;i<len;i++) s+=chars[Math.floor(Math.random()*chars.length)]; return s; }
function pkcs7Pad(u8){ const block=16; const mod=u8.length%block; const padLen=mod===0?block:block-mod; const out=new Uint8Array(u8.length+padLen); out.set(u8); out.fill(padLen,u8.length); return out; }
function wordArrayToU8(wa){ const {words,sigBytes}=wa; const u8=new Uint8Array(sigBytes); let i=0,j=0; while(i<sigBytes){ const w=words[j++]; u8[i++]=(w>>>24)&0xff; if(i>=sigBytes) break; u8[i++]=(w>>>16)&0xff; if(i>=sigBytes) break; u8[i++]=(w>>>8)&0xff; if(i>=sigBytes) break; u8[i++]=w&0xff; } return u8; }
function md5Bytes(input){ return wordArrayToU8(CryptoJS.MD5(String(input))); }
function md5Hex(input){ return CryptoJS.MD5(String(input)).toString(CryptoJS.enc.Hex); }

/* ===== AES-CBC (WebCrypto) ===== */
function subtle(){ const c=(window.crypto||window.msCrypto); if(!c?.subtle) throw new Error('当前环境不支持 WebCrypto'); return c.subtle; }
async function aesCbcEncryptRaw(keyBytes16, iv16, plainBytes){
  const key = await subtle().importKey('raw', keyBytes16, { name:'AES-CBC' }, false, ['encrypt']);
  const buf = await subtle().encrypt({ name:'AES-CBC', iv: iv16 }, key, plainBytes);
  return new Uint8Array(buf);
}

/* ===== 封包：[4B prefix][00][16B iv][cipher][00][4B suffix] -> Base64 ===== */
function packEncryptedPayload({ ciphertextB64, igaisfbn }) {
  if (typeof ciphertextB64!=='string' || typeof igaisfbn!=='string') throw new Error('参数必须为 Base64 字符串');
  const prefixBytes = hexToU8(randomHexDigits(4));
  const suffixBytes = hexToU8(randomHexDigits(4));
  const ivBytes     = base64ToU8(igaisfbn);
  const cipherBytes = base64ToU8(ciphertextB64);

  const out = new Uint8Array(prefixBytes.length + 1 + ivBytes.length + cipherBytes.length + 1 + suffixBytes.length);
  let off = 0;
  out.set(prefixBytes, off); off += prefixBytes.length;
  out[off++] = 0x00;
  out.set(ivBytes, off);     off += ivBytes.length;
  out.set(cipherBytes, off); off += cipherBytes.length;
  out[off++] = 0x00;
  out.set(suffixBytes, off);
  return u8ToBase64(out);
}

/* ===== 业务加密（随机 IV） ===== */
async function encryptWithRandomIv(plaintext, keyText){
  const keyBytes = md5Bytes(String(keyText ?? ''));
  const ivBytes  = md5Bytes(randomSeed());
  const ptBytes  = plaintext instanceof Uint8Array ? plaintext : strToBytes(String(plaintext));
  const padded   = pkcs7Pad(ptBytes);
  const cipherBytes = await aesCbcEncryptRaw(keyBytes, ivBytes, padded);
  return { ciphertextB64: u8ToBase64(cipherBytes), igaisfbn: u8ToBase64(ivBytes) };
}

/* ===== KeyAPI 明文 + key/iv（UA+ts7） ===== */
async function genKeyApiPayload(){
  const ua  = navigator.userAgent || '';
  const ts7 = String(Date.now()).slice(0, 6);
  const seed = ua + ts7;
  const keyBytes = md5Bytes(seed);
  const ivBytes  = md5Bytes(randomSeed());
  const plaintext = JSON.stringify({ data: randomText10to50() });
  const padded    = pkcs7Pad(strToBytes(plaintext));
  const cipher    = await aesCbcEncryptRaw(keyBytes, ivBytes, padded);
  return { ciphertextB64: u8ToBase64(cipher), igaisfbn: u8ToBase64(ivBytes), seed };
}

/* ===== 签名：hex = MD5( signSeed + ciphertextB64 + igaisfbn ) ===== */
function computeSignHex(signSeed, ciphertextB64, igaisfbn){
  return md5Hex(String(signSeed) + String(ciphertextB64) + String(igaisfbn));
}

/* ===== 签名加密并封包（key=MD5(keyForSign)，iv 随机） ===== */
async function encryptSignHexAndPack(signHex, keyForSign){
  const keyBytes = md5Bytes(String(keyForSign ?? ''));
  const ivBytes  = md5Bytes(randomSeed());
  const ptBytes  = pkcs7Pad(strToBytes(signHex));      // 加密文本为 signHex（作为普通字符串）
  const cipher   = await aesCbcEncryptRaw(keyBytes, ivBytes, ptBytes);
  return packEncryptedPayload({ ciphertextB64: u8ToBase64(cipher), igaisfbn: u8ToBase64(ivBytes) });
}

/* ===== 仅导出两个方法（返回：密文 + 签名） ===== */

/**
 * 业务加密 + 签名
 * - 业务密文：随机 IV，加密明文后封包
 * - 签名密文：signHex=MD5(UA+ts7 + ciphertextB64 + igaisfbn)，使用(UA+ts7)派生 key 加密并封包
 * @returns {Promise<{payloadB64:string, signPayloadB64:string}>}
 */
export async function bizEncryptAndSign(plaintext, keyText){
  const { ciphertextB64, igaisfbn } = await encryptWithRandomIv(plaintext, keyText);
  const payloadB64 = packEncryptedPayload({ ciphertextB64, igaisfbn });

  const ua  = navigator.userAgent || '';
  const ts7 = String(Date.now()).slice(0, 6);
  const signSeed = ua + ts7;
  const signHex = computeSignHex(signSeed, ciphertextB64, igaisfbn);
  const signPayloadB64 = await encryptSignHexAndPack(signHex, signSeed);

  return { payloadB64, signPayloadB64 };
}

/**
 * KeyAPI 加密 + 签名
 * - KeyAPI 密文：key=iv=MD5(UA+ts7)，明文 {"data":"10..50位随机"}，封包
 * - 签名密文：同上公式，key 也用 (UA+ts7)
 * @returns {Promise<{payloadB64:string, signPayloadB64:string}>}
 */
export async function keyApiEncryptAndSign(){
  const { ciphertextB64, igaisfbn, seed } = await genKeyApiPayload();
  const payloadB64 = packEncryptedPayload({ ciphertextB64, igaisfbn });

  const signHex = computeSignHex(seed, ciphertextB64, igaisfbn);
  const signPayloadB64 = await encryptSignHexAndPack(signHex, seed);

  return { payloadB64, signPayloadB64};
}
