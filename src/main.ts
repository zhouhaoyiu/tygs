import "@fortawesome/fontawesome-free/css/all.css";
import axios from "axios";
import ElementUI from "element-ui";
import _ from "lodash";
import Vue from "vue";
import VueAxios from "vue-axios";
import Vuex from "vuex";
import App from "./App.vue";
import "element-ui/lib/theme-chalk/index.css";
import "./assets/reset.scss";
import router from "./router";
import store from "./store";
Vue.config.productionTip = false;
Vue.prototype._ = _;
Vue.prototype.$axios = axios;
axios.defaults.baseURL = process.env.VUE_APP_API_BASE || "/api";
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
			if (router.currentRoute.path !== "/login") router.replace("/login");
		}
		ElementUI.Message.error(error.response?.data?.message || "请求失败，请重试");
		return Promise.reject(error);
	},
);
Vue.use(ElementUI);
Vue.use(VueAxios, axios);
Vue.use(Vuex);
new Vue({ router, store, render: (h) => h(App) }).$mount("#app");
