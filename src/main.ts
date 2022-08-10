import Vue from "vue";
import Vuex from "vuex";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import axios from "axios";
import VueAxios from "vue-axios";
import ElementUI from "element-ui";
import "./assets/reset.scss";
import "./assets/element-variables.scss";
import "@fortawesome/fontawesome-free/css/all.css";
import _ from "lodash";

Vue.config.productionTip = false;
Vue.prototype._ = _;
Vue.prototype.$axios = axios;
Vue.use(ElementUI);
Vue.prototype.$axios.defaults.baseURL = "http://localhost:8090/";
// Vue.prototype.$axios.defaults.baseURL = "http://192.168.88.111:8090/";
Vue.use(VueAxios, axios);
Vue.use(Vuex);

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
