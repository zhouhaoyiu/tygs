import "@fortawesome/fontawesome-free/css/all.css";
import axios from "axios";
import ElementUI from "element-ui";
import _ from "lodash";
import Vue from "vue";
import VueAxios from "vue-axios";
import Vuex from "vuex";
import App from "./App.vue";
import "./assets/element-variables.scss";
import "./assets/reset.scss";
import router from "./router";
import store from "./store";

Vue.config.productionTip = false;
Vue.prototype._ = _;
Vue.prototype.$axios = axios;
Vue.use(ElementUI);
// Vue.prototype.$axios.defaults.baseURL = "http://localhost:8090/";
Vue.prototype.$axios.defaults.baseURL = "http://192.168.88.109:8090/";
Vue.use(VueAxios, axios);
Vue.use(Vuex);

const app = new Vue({
  router,
  store,
  render: (h) => h(App),
});

app.$mount("#app");
