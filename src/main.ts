import "@fortawesome/fontawesome-free/css/all.css";
import axios from "axios";
import ElementPlus, { ElMessage } from "element-plus";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import * as ElementIcons from "@element-plus/icons-vue";
import _ from "lodash";
import { createApp } from "vue";
import App from "./App.vue";
import "element-plus/dist/index.css";
import "./assets/reset.scss";
import router from "./router";
import store from "./store";
const app = createApp(App);
app.config.globalProperties._ = _;
app.config.globalProperties.axios = axios;
app.config.globalProperties.$axios = axios;
axios.defaults.baseURL = import.meta.env.VITE_API_BASE || "/api";
axios.defaults.timeout = 20000;
axios.interceptors.request.use((config) => {
	config.headers.Authorization = "Bearer " + (sessionStorage.getItem("facilityToken") || "");
	return config;
});
axios.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			sessionStorage.removeItem("facilityToken");
			if (router.currentRoute.value.path !== "/login") router.replace("/login");
		}
		ElMessage.error(error.response?.data?.message || "请求失败，请重试");
		return Promise.reject(error);
	},
);
for (const [name, icon] of Object.entries(ElementIcons)) app.component(name, icon);
app.use(ElementPlus, { locale: zhCn }).use(router).use(store).mount("#app");
