// request.js
// const baseURL = 'http://110.40.42.207:8088/';
const baseURL = 'https://tronApi.steadyai.vip/';
//  const baseURL = 'http://192.168.110.101:8065/';
/** 本地存储键位 */
const LS_KEYS = {
  TOKEN: 'Account-token',      // 服务器下发（响应头/明文JSON里）
  KEY_ENC: '89qw',  // 新：加密后的 Key（JSON：{igaisfbn, ysdbkjf}）
};

/** 头字段名 */
const HDR = {                                                                                           
  CONTENT_TYPE: 'Content-Type',
  ACCOUNT_TOKEN: 'Account-token',
  ACCOUNT_SIGN: 'Account-sign',
};

/** 本地存储 */
const getLocal = (k) => { try { return localStorage.getItem(k); } catch { return null; } }; 
const setLocal = (k, v) => { try { localStorage.setItem(k, v); } catch {""} };

/** 加密模块与管道 */
async function getEncryptFns() {
  const m = await import('@/utils/encrypt/Custom');                
  const useEncryptFns = m.useEncryptFns || m.default || (() => m);
  return await useEncryptFns();
}
async function getCryptoPipeline() {
  return await import('@/utils/encrypt/cryptoPipeline'); 
}
/** 安全 Key 仓库 */
async function getKeyStore() {
  return await import('@/utils/encrypt/secureKeyStore');
}

/** crypto-js */
function requireCryptoJS() {
  if (typeof window !== 'undefined' && window.CryptoJS) return window.CryptoJS;
  try { return require('crypto-js'); } catch {""}
  throw new Error('缺少 crypto-js，请先安装或全局注入');
}
function md5Hex(s) {
  const CryptoJS = requireCryptoJS();
  return CryptoJS.MD5(String(s)).toString(CryptoJS.enc.Hex);
}

/** 统一返回 */
const ok = (data) => ({ ok: true, data });
const netErr = () => ({ ok: false, code: 'NETWORK_ERR', message: '网络异常，请稍后重试' });
const authErr = () => ({ ok: false, code: 'AUTH_REQUIRED', message: '请先初始化' });

/** URL 构造 */
function buildUrl(url, queryObj) {
  let finalUrl = baseURL + url.replace(/^\//, '');
  if (queryObj && Object.keys(queryObj).length > 0) {
    const q = Object.entries(queryObj)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
    finalUrl += (finalUrl.includes('?') ? '&' : '?') + q;
  }
  return finalUrl;
}

/** 解密响应（init: md5(token + 当前时间戳前6位)；业务：用动态 KeyMd5） */
async function decryptResponseText(resp, bodyText, isInit) {
  try {
    const { decodeAll } = await getCryptoPipeline();
    let decKey = null;

    if (isInit) {
      // 先把响应头 token 落盘，确保首次 init 能构造密钥
      const headerToken = resp.headers.get(HDR.ACCOUNT_TOKEN);
      if (headerToken) setLocal(LS_KEYS.TOKEN, headerToken);
      const token = headerToken || getLocal(LS_KEYS.TOKEN);
      if (!token) return null;
      // 你当前实现：token + 当前时间戳前6位
      decKey = md5Hex(token + String(Date.now()).slice(0, 6));
    } else {
      // 业务响应解密由服务端方案决定（如无需解密可直接返回）
      // 如果你的服务端业务响应也用 KeyMd5 解密，可在这里使用
      // 但你前面的描述是业务响应同样是莫斯密文 → 使用“存量 KeyMd5”
      // 我们统一走 decodeAll，密钥就是“业务时的 KeyMd5”，在这里临时算
      const { loadPlainKey,getToken } = await getKeyStore();
      const keyPlain = loadPlainKey();
      const token = getToken();
      if (!keyPlain) return null;
      decKey = md5Hex(keyPlain+token);
    }

    const plaintext = await decodeAll(bodyText, decKey);
    
    return plaintext || null;
  } catch {
    return null;
  }
}

/**
 * 通用请求
 * @param {0|1} methodFlag 0=GET, 1=POST
 * @param {string} url
 * @param {object} jsonData
 * @param {boolean} isquery
 */
export async function request(methodFlag, url, jsonData = {}, isquery = false) {
  jsonData=JSON.stringify(jsonData)
  const isGet = methodFlag === 0;
  const isInit = !isGet && /^\/?api\/user\/init$/i.test(url);

  // Content-Type
  let contentType = 'application/custom-json';
  if (isGet) contentType = 'application/data';
  if (isInit) contentType = 'application/key-json';

  // 头
  const headers = new Headers();
  headers.set(HDR.CONTENT_TYPE, contentType);

  // token（init 不带）
  const token = getLocal(LS_KEYS.TOKEN);
  console.log(token);
  
  if (!isInit) {
    if (!token) return authErr();
    headers.set(HDR.ACCOUNT_TOKEN, token);
  }

  let bodyToSend = null;
  let finalUrl = baseURL + url.replace(/^\//, '');

  try {
    if (isGet) {
      // GET：生成签名但不发 body
      const { loadPlainKey } = await getKeyStore();
      const keyPlain = loadPlainKey();
      if (!keyPlain) return authErr();
      const keyMd5 = md5Hex(keyPlain);

      const { bizEncryptAndSign } = await getEncryptFns();
      const { signPayloadB64 } = await bizEncryptAndSign(jsonData || {}, keyMd5);

      headers.set(HDR.ACCOUNT_SIGN, String(signPayloadB64 || ''));
      finalUrl = buildUrl(url, jsonData || {});
    } else if (isInit) {
      // INIT：KeyAPI 加密；Account-sign = signPayloadB64；body 只发 payloadB64（按你当前实现）
      const { keyApiEncryptAndSign } = await getEncryptFns();
      const { payloadB64, signPayloadB64 } = await keyApiEncryptAndSign(jsonData || {});
      headers.set(HDR.ACCOUNT_SIGN, String(signPayloadB64 || ''));
      if (isquery && jsonData && Object.keys(jsonData).length > 0) {
        finalUrl = buildUrl(url, jsonData);
      } else {
        bodyToSend = payloadB64;
      }
    } else {
      // 业务 POST：用“动态 KeyMd5”
      const { loadPlainKey } = await getKeyStore();
      const keyPlain = loadPlainKey();
      if (!keyPlain) return authErr();
      const key = keyPlain;
      const { bizEncryptAndSign } = await getEncryptFns();
      const { payloadB64, signPayloadB64 } = await bizEncryptAndSign(jsonData || {}, key);

      headers.set(HDR.ACCOUNT_SIGN, String(signPayloadB64 || ''));
      if (isquery && jsonData && Object.keys(jsonData).length > 0) {
        finalUrl = buildUrl(url, jsonData);
      } else {
        bodyToSend = payloadB64;
      }
    }
  } catch {
    return netErr();
  }

  const opts = { method: isGet ? 'GET' : 'POST', headers };
  if (!isGet) opts.body = bodyToSend || JSON.stringify({});

  try {
    const resp = await fetch(finalUrl, opts);
    if (!resp.ok) return netErr();
    
    // 先把响应头 token 落盘（首次 init 必须）
    const headerToken = resp.headers.get(HDR.ACCOUNT_TOKEN);
    if (headerToken) setLocal(LS_KEYS.TOKEN, headerToken);

    const text = await resp.text();
    if (!text) return ok(null);

    const plain = await decryptResponseText(resp, text, isInit);
    if (!plain) return netErr();

    let data = null;
    try { data = JSON.parse(plain); } catch { return netErr(); }

    // init：保存 token + 加密后的 Key（不再持久化 KeyMd5/Key 明文）
    if (isInit) {
      if (data?.token) setLocal(LS_KEYS.TOKEN, String(data.token));
      if (data?.Key) {
        const { saveEncryptedKey } = await getKeyStore();
        try { saveEncryptedKey(String(data.Key)); } catch { return netErr(); }
      }
    }
    console.log({'请求':url,'参数':jsonData,'响应':data});
    
    return ok(data);
  } catch {
    return netErr();
  }
}
