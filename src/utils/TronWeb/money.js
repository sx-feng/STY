
/**
 * TokenPocket + TronWeb 封装工具
 * 用于在 TokenPocket DApp 浏览器中进行 TRC-20 代币操作
 *
 * 提供方法：
 * - WalletTP.connect()      连接钱包，并保存全局 tronWeb 实例和账户地址
 * - WalletTP.getAddress()   获取当前钱包地址（Base58）
 * - WalletTP.transfer(opts) 执行 TRC-20 代币转账
 *
 * 支持的代币：
 * - USDT  (6 位小数，合约：TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t)
 * - STYAI (18 位小数，合约：THqXUyubNgKfNnA1ahvMo62XHeBPLJCU5H)
 */
(function (global) {
    /** 已知代币合约配置 */
    const CONTRACTS = {
        USDT: {
            address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
            decimals: 6,
        },
        STYAI: {
            address: 'THqXUyubNgKfNnA1ahvMo62XHeBPLJCU5H',
            decimals: 18,
        },
    };

    const WalletTP = {
        tronWeb: null,   // TokenPocket 注入的 tronWeb 实例
        account: null,   // 当前钱包地址（Base58）

        /**
         * 连接 TokenPocket 钱包
         * - 会调用 TP 注入的 window.tokenpocket.tron.request 方法
         * - 授权成功后保存 tronWeb 实例和默认地址
         * @returns {Promise<string>} 返回当前地址（Base58 格式）
         */
        async connect() {
            if (!global?.tokenpocket?.tronWeb) {
                throw new Error('TokenPocket tronWeb 未注入，请在 TP DApp 浏览器中打开本页');
            }
            this.tronWeb = global.tokenpocket.tronWeb;

            // 请求授权（TIP 风格）
            try {
                await global.tokenpocket.tron.request({ method: 'eth_requestAccounts' });
            } catch (e) {
                throw new Error('连接钱包失败：' + (e?.message || e));
            }

            // 保存当前地址
            this.account =
                this.tronWeb.defaultAddress?.base58 ||
                this.tronWeb.defaultAddress?.hex ||
                null;

            if (!this.account) {
                throw new Error('未能获取默认地址');
            }
            return this.account;
        },

        /**
         * 获取当前连接的钱包地址
         * @returns {string|null} Base58 地址（T 开头），未连接则返回 null
         */
        getAddress() {
            if (!this.tronWeb) throw new Error('尚未连接钱包');
            return (
                this.tronWeb.defaultAddress?.base58 ||
                this.tronWeb.defaultAddress?.hex ||
                null
            );
        },

        /**
         * 校验地址是否合法
         * @param {string} base58 Tron 地址（Base58 格式，T 开头）
         * @returns {boolean}
         */
        _isValidAddress(base58) {
            try {
                return this.tronWeb.isAddress(base58);
            } catch {
                return false;
            }
        },

        /**
         * 将人类可读金额转换为最小单位（BigInt）
         * 例如：
         * - decimals = 6:  "1" → 1000000
         * - decimals = 18: "1" → 1000000000000000000
         * @param {string} amountStr 金额（字符串）
         * @param {number} decimals  代币精度
         * @returns {BigInt}
         */
        _toUnitsBigInt(amountStr, decimals) {
            const [intPart, fracRaw = ''] = String(amountStr).trim().split('.');
            const frac = fracRaw.padEnd(decimals, '0').slice(0, decimals);
            const numStr = (intPart || '0') + (decimals > 0 ? frac : '');
            if (!/^\d+$/.test(numStr)) {
                throw new Error('金额格式不正确');
            }
            // eslint-disable-next-line no-undef
            return BigInt(numStr || '0');
        },

        /**
         * 执行 TRC-20 代币转账
         * @param {{
         *   to: string,                 // 接收方地址（T 开头）
         *   tokenType: 'USDT' | 'STYAI',// 代币类型
         *   amount: string | number,    // 转账金额（人类可读格式）
         *   feeLimit?: number           // 手续费上限（sun），默认 100_000_000 (100 TRX)
         * }} opts
         * @returns {Promise<{tx:any, signed:any, res:any}>}
         * - tx:     构建的原始交易对象
         * - signed: 签名后的交易对象
         * - res:    广播结果（包含 result, txid 等）
         */
        async transfer(opts) {
            // 1. 校验环境
            if (!this.tronWeb) throw new Error('尚未连接钱包');
            const { to, tokenType, amount, feeLimit = 100_000_000 } = opts || {};

            // 2. 根据代币类型选择合约与精度
            const token = CONTRACTS[tokenType];
            if (!token) {
                throw new Error('不支持的合约类型：' + tokenType);
            }
            const contract = token.address;
            const decimals = token.decimals;

            // 3. 基本参数校验
            if (!to || !this._isValidAddress(to)) {
                throw new Error('接收地址非法：' + to);
            }
            if (!amount || Number(amount) <= 0) {
                throw new Error('请输入正确的金额（> 0）');
            }

            // 4. 金额换算（人类可读金额 → 最小单位整数）
            const units = this._toUnitsBigInt(String(amount), decimals);

            // 5. 组装调用参数：调用 TRC20 的 transfer(address,uint256)
            const functionSelector = 'transfer(address,uint256)';
            const params = [
                { type: 'address', value: to },                // 接收方地址
                { type: 'uint256', value: units.toString() }, // 转账金额（最小单位）
            ];
            const options = {
                feeLimit: Number(feeLimit) || 100_000_000, // 手续费上限
                callValue: 0,                              // 调用合约时不转 TRX
            };

            // 6. 构建交易
            const tx = await this.tronWeb.transactionBuilder.triggerSmartContract(
                contract,
                functionSelector,
                options,
                params
            );
            if (!tx?.transaction) throw new Error('构建交易失败');

            // 7. 请求签名（TokenPocket 会弹窗确认）
            const signed = await this.tronWeb.trx.sign(tx.transaction);
            if (!signed?.signature) throw new Error('签名失败或被取消');

            // 8. 广播交易到 TRON 网络
            const res = await this.tronWeb.trx.sendRawTransaction(signed);

            // 返回完整过程结果
            return { tx, signed, res };
        },
    };

    // 挂载到全局
    global.WalletTP = WalletTP;
})(window);

// eslint-disable-next-line vue/comment-directive
