// ==== 代币合约清单 ====
const CONTRACTS = {
  USDT:  { address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', decimals: 6 },
  STYAI: { address: 'THqXUyubNgKfNnA1ahvMo62XHeBPLJCU5H', decimals: 18 },
};

// ==== WalletTP：TokenPocket 注入封装 + 查询/转账 ====
const WalletTP = {
  tronWeb: null,  // TokenPocket 注入的 tronWeb
  account: null,  // 当前钱包地址（Base58）

  // ---------- 工具 ----------
_getWin() {
  // 不写 globalThis，避免 eslint no-undef
  if (typeof window !== 'undefined') return window
  // eslint-disable-next-line no-new-func
  try { return Function('return this')() || {}; } catch { return {}; }
},
  _ok(data,msg='成功'){ return { code:1, msg, data }; },
  _err(msg){ return { code:-1, msg }; },

  _ensureConnected() {
    if (!this.tronWeb) return this._err('尚未连接钱包');
    if (!this.tronWeb.defaultAddress?.base58) return this._err('未获得默认地址');
    return this._ok(true);
  },

  _isValidAddress(base58) {
    try { return this.tronWeb.isAddress(base58); } catch { return false; }
  },

  // 人类金额 -> 最小单位 BigInt
  _toUnitsBigInt(amountStr, decimals) {
    const s = String(amountStr).trim();
    if (!/^\d+(\.\d+)?$/.test(s)) return this._err('金额格式不正确');
    const [intPart, fracRaw=''] = s.split('.');
    const frac = fracRaw.padEnd(decimals, '0').slice(0, decimals);
    const numStr = (intPart || '0') + (decimals>0 ? frac : '');
    // eslint-disable-next-line no-undef
    return this._ok(BigInt(numStr || '0'));
  },

  // 最小单位字符串 -> 人类可读（不丢精度）
  _formatUnitsString(rawStr, decimals) {
    const d = Number(decimals)||0;
    const s = String(rawStr||'0').replace(/^0+/, '') || '0';
    if (d===0) return s;
    const pad = s.padStart(d+1, '0');
    const int = pad.slice(0, -d);
    const frac = pad.slice(-d).replace(/0+$/, '');
    return frac ? `${int}.${frac}` : int;
  },

  // ---------- 连接 ----------
  async connect() {
    const w = this._getWin();
    const tp = w?.tokenpocket;
    if (!tp?.tronWeb) return this._err('请在 TokenPocket 内打开页面');

    this.tronWeb = tp.tronWeb;

    // 兼容请求账户授权：优先 tron_requestAccounts，退回 eth_requestAccounts
    try {
      if (tp?.tron?.request) {
        try {
          await tp.tron.request({ method: 'tron_requestAccounts' });
        } catch {
          await tp.tron.request({ method: 'eth_requestAccounts' });
        }
      }
    } catch (e) {
      return this._err('连接钱包失败：' + (e?.message || e));
    }

    // 保存当前地址（转为 base58）
    const addrB58 =
      this.tronWeb.defaultAddress?.base58
      || (this.tronWeb.defaultAddress?.hex
          ? this.tronWeb.address.fromHex(this.tronWeb.defaultAddress.hex)
          : null);

    if (!addrB58) return this._err('未能获取默认地址');

    this.account = addrB58;
    return this._ok(addrB58);
  },

  getAddress() {
    if (!this.tronWeb) return this._err('尚未连接钱包');
    const hex = this.tronWeb.defaultAddress?.hex;
    const b58 = this.tronWeb.defaultAddress?.base58 || (hex ? this.tronWeb.address.fromHex(hex) : null);
    if (!b58) return this._err('未能获取默认地址');
    return this._ok(b58);
  },

  // ---------- 基础查询 ----------
  /** 获取 TRX 余额（sun & TRX） */
  async getTrxBalance(addrBase58) {
    const ensure = this._ensureConnected(); if (ensure.code!==1) return ensure;
    const address = addrBase58 || this.tronWeb.defaultAddress.base58;
    try {
      const sun = await this.tronWeb.trx.getBalance(address);
      return this._ok({ sun, trx: this.tronWeb.fromSun(sun) });
    } catch (e) {
      return this._err('获取 TRX 余额失败：' + (e?.message || e));
    }
  },

  /** 获取账户对象（含权限/冻结/TRC10 等） */
  async getAccount(addrBase58) {
    const ensure = this._ensureConnected(); if (ensure.code!==1) return ensure;
    const address = addrBase58 || this.tronWeb.defaultAddress.base58;
    try {
      const account = await this.tronWeb.trx.getAccount(address);
      return this._ok(account);
    } catch (e) {
      return this._err('获取账户信息失败：' + (e?.message || e));
    }
  },

  /** 获取资源（带宽/能量） */
  async getResources(addrBase58) {
    const ensure = this._ensureConnected(); if (ensure.code!==1) return ensure;
    const address = addrBase58 || this.tronWeb.defaultAddress.base58;
    try {
      const resources = await this.tronWeb.trx.getAccountResources(address);
      return this._ok(resources);
    } catch (e) {
      return this._err('获取资源失败：' + (e?.message || e));
    }
  },

  /** 解析 TRC10 资产列表 */
  parseTrc10FromAccount(account) {
    const list = (account?.assetV2 || []).map(a => ({ id: a.key, amount: a.value }));
    return this._ok(list);
  },

  // ---------- TRC20 余额 ----------
  /**
   * 获取 TRC20 余额
   * @param {string} token  代币键（如 'USDT'）或合约地址（T 开头）
   * @param {string=} addrBase58 指定地址（默认当前地址）
   */
  async getTrc20Balance(token, addrBase58) {
    const ensure = this._ensureConnected(); if (ensure.code!==1) return ensure;
    const address = addrBase58 || this.tronWeb.defaultAddress.base58;

    let contractAddr = token;
    let knownDecimals = undefined;
    if (CONTRACTS[token]) {
      contractAddr = CONTRACTS[token].address;
      knownDecimals = CONTRACTS[token].decimals;
    }

    try {
      const c = await this.tronWeb.contract().at(contractAddr);
      const [raw, decimalsResp, symbolResp, nameResp] = await Promise.all([
        c.balanceOf(address).call(),
        knownDecimals!=null ? Promise.resolve(knownDecimals) : c.decimals().call(),
        c.symbol().call().catch(()=>''),
        c.name().call().catch(()=>''),
      ]);

      const rawStr = raw?.toString?.() ?? String(raw);
      const decimals = Number(decimalsResp?.toString?.() ?? decimalsResp ?? 0);
      const balance = this._formatUnitsString(rawStr, decimals);

      return this._ok({
        token: contractAddr,
        symbol: String(symbolResp || ''),
        name:   String(nameResp || ''),
        decimals,
        raw: rawStr,       // 最小单位整数（字符串）
        balance,           // 人类可读字符串
      });
    } catch (e) {
      return this._err('获取 TRC20 余额失败：' + (e?.message || e));
    }
  },

  // ---------- 钱包详情聚合 ----------
  /**
   * 获取钱包详情
   * @param {{address?:string, trc20?: string[]}} opts
   *  - trc20: 需要查询的 TRC20 代币键或合约地址数组，默认 ['USDT','STYAI']
   */
  async getWalletDetails(opts={}) {
    const ensure = this._ensureConnected(); if (ensure.code!==1) return ensure;
    const address = opts.address || this.tronWeb.defaultAddress.base58;
    const trc20List = Array.isArray(opts.trc20) && opts.trc20.length ? opts.trc20 : ['USDT','STYAI'];

    try {
      const [bal, acc, res] = await Promise.all([
        this.getTrxBalance(address),
        this.getAccount(address),
        this.getResources(address),
      ]);
      if (bal.code!==1) return bal;
      if (acc.code!==1) return acc;
      if (res.code!==1) return res;

      const trc10 = this.parseTrc10FromAccount(acc.data).data;

      const trc20 = [];
      for (const t of trc20List) {
        const r = await this.getTrc20Balance(t, address);
        trc20.push(r.code===1 ? r.data : { token:t, error:r.msg });
      }

      return this._ok({
        address: { base58: address, hex: this.tronWeb.address.toHex(address) },
        trx: bal.data,          // { sun, trx }
        account: acc.data,      // 原始账户对象
        resources: res.data,    // 带宽/能量
        trc10,                  // [{id, amount}]
        trc20,                  // 每个代币的余额对象
      });
    } catch (e) {
      return this._err('获取钱包详情失败：' + (e?.message || e));
    }
  },

  // ---------- TRC20 转账 ----------
  /**
   * @param {{to:string, tokenType:'USDT'|'STYAI'|string, amount:string|number, feeLimit?:number}} opts
   */
  async transfer(opts) {
    const ensure = this._ensureConnected(); if (ensure.code!==1) return ensure;
    const { to, tokenType, amount, feeLimit = 100_000_000 } = opts || {};

    const token = CONTRACTS[tokenType] || (this._isValidAddress(tokenType) ? { address: tokenType, decimals: undefined } : null);
    if (!token) return this._err('不支持的合约类型或地址：' + tokenType);

    const contract = token.address;
    let decimals = token.decimals;

    if (!to || !this._isValidAddress(to)) return this._err('接收地址非法：' + to);
    if (!amount || Number(amount) <= 0)   return this._err('请输入正确的金额（> 0）');

    // 若未预置精度，则从合约读
    if (decimals == null) {
      try {
        const c = await this.tronWeb.contract().at(contract);
        const d = await c.decimals().call();
        decimals = Number(d?.toString?.() ?? d ?? 0);
      } catch { decimals = 0; }
    }

    // 金额换算
    const unitsRes = this._toUnitsBigInt(String(amount), decimals);
    if (unitsRes.code !== 1) return unitsRes;
    const unitsStr = unitsRes.data.toString();

    // 构建参数
    const functionSelector = 'transfer(address,uint256)';
    const params = [
      { type: 'address',  value: to },
      { type: 'uint256',  value: unitsStr },
    ];
    const options = {
      feeLimit: Number(feeLimit) || 100_000_000,
      callValue: 0,
    };

    try {
      const tx = await this.tronWeb.transactionBuilder.triggerSmartContract(
        contract, functionSelector, options, params
      );
      if (!tx?.transaction) return this._err('构建交易失败');

      const signed = await this.tronWeb.trx.sign(tx.transaction);
      if (!signed?.signature) return this._err('签名失败或被取消');

      const res = await this.tronWeb.trx.sendRawTransaction(signed);
      return this._ok({ tx, signed, res });
    } catch (e) {
      return this._err('广播失败：' + (e?.message || e));
    }
  },
};

export default WalletTP;
