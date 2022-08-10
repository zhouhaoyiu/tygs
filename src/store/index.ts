import Vue from "vue";
import Vuex from "vuex";
import createVuexAlong from "vuex-along";

import { getAdminInfo, getInfo } from "./getters";
import { setAdminInfo, setInfo } from "./mutations";
import { adminInfo, info } from "./state";

import { GET_ADMIN_INFO, GET_INFO } from "./type/getter-type";
import { SET_ADMIN_INFO, SET_INFO } from "./type/mutation-type";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    adminInfo: adminInfo,
    info: info,
  },
  getters: {
    [GET_ADMIN_INFO]: getAdminInfo,
    [GET_INFO]: getInfo,
  },
  mutations: {
    [SET_ADMIN_INFO]: setAdminInfo,
    [SET_INFO]: setInfo,
  },
  actions: {},
  plugins: [createVuexAlong()],
});
