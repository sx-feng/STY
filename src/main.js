import { createApp } from "vue";
import App from "./App.vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import * as Icons from "@element-plus/icons-vue";
import { createI18n } from "vue-i18n";
import zh from "./locales/zh.json";
import en from "./locales/en.json";
import router from './router'
import 'element-plus/dist/index.css'
const saved =
  localStorage.getItem("lang") ||
  (navigator.language.startsWith("zh") ? "zh" : "en");
const i18n = createI18n({
  legacy: false,
  locale: saved, 
  fallbackLocale: "en",
  messages: { zh, en },
});

const app = createApp(App);
app.use(ElementPlus);
app.use(i18n);
app.use(router)

for (const [key, component] of Object.entries(Icons)) {
  app.component(key, component);
}

app.mount("#app");
