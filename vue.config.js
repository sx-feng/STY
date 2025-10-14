const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    host: '0.0.0.0',   // 监听所有网卡，保证外部能访问
    port: 8080,
    // 更安全：只允许特定域名（比如 ngrok 或 frp 的域名）
    // 如果只是临时调试，想一劳永逸：
     allowedHosts: 'all',
    hot: false,         // 关闭 HMR
    liveReload: false,  // 关闭自动刷新
    client: false       // ✅ 彻底禁用客户端脚本，不注入 WS
  },
  configureWebpack: (config) => {
    // 移除内置的 HMR 插件
    config.plugins = config.plugins.filter(
      (plugin) => plugin.constructor.name !== 'HotModuleReplacementPlugin'
    )
  }
})
