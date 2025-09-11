import { createApp } from "vue";
import App from "./App.vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import * as Icons from "@element-plus/icons-vue";
import { createI18n } from "vue-i18n";
import zh from "./locales/zh.json";
import en from "./locales/en.json";
import router from './router'
const saved =
  localStorage.getItem("lang") ||
  (navigator.language.startsWith("zh") ? "zh" : "en");
const i18n = createI18n({
  legacy: false, // 组合式 API
  locale: saved, // 当前语言
  fallbackLocale: "en",
  messages: { zh, en },
});

const app = createApp(App);
app.use(ElementPlus);
app.use(i18n);
app.use(router)
// 注册所有图标（可选）
for (const [key, component] of Object.entries(Icons)) {
  app.component(key, component);
}

app.mount("#app");
