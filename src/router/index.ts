import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import Home from "../views/Home.vue";

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: "/",
    name: "index",
    redirect: "/home",
  },
  {
    path: "/home",
    name: "Home",
    redirect: "/home/index",
    component: Home,
    children: [
      {
        path: "index",
        name: "homeIndex",
        component: () =>
          import(/* webpackChunkName: "index" */ "../views/index/index.vue"),
      },
      {
        path: "searchAll",
        name: "searchAll",
        component: () =>
          import(
            /* webpackChunkName: "searchAll" */ "../views/search/searchAll.vue"
          ),
      },
      {
        path: "searchWaterMeterWell",
        name: "searchWaterMeterWell",
        component: () =>
          import(
            /* webpackChunkName: "searchWaterMeterWell" */ "../views/search/searchWaterMeterWell.vue"
          ),
      },
      {
        path: "searchValueWell",
        name: "searchValueWell",
        component: () =>
          import(
            /* webpackChunkName: "searchValueWell" */ "../views/search/searchValueWell.vue"
          ),
      },
      {
        path: "searchFireHydrant",
        name: "searchFireHydrant",
        component: () =>
          import(
            /* webpackChunkName: "searchFireHydrant" */ "../views/search/searchFireHydrant.vue"
          ),
      },
      {
        path: "searchWaterMeterRoom",
        name: "searchWaterMeterRoom",
        component: () =>
          import(
            /* webpackChunkName: "searchWaterMeterRoom" */ "../views/search/searchWaterMeterRoom.vue"
          ),
      },
      {
        path: "card",
        name: "card",
        component: () =>
          import(/* webpackChunkName: "card" */ "../views/card/index.vue"),
      },
      {
        path: "InputInfor",
        name: "InputInfor",
        component: () =>
          import(
            /* webpackChunkName: "InputInfor" */ "../views/inputInfor/index.vue"
          ),
      },
    ],
  },
  // {
  //   path: '/about',
  //   name: 'About',
  //   // route level code-splitting
  //   // this generates a separate chunk (about.[hash].js) for this route
  //   // which is lazy-loaded when the route is visited.
  //   component: () =>
  //     import(/* webpackChunkName: "about" */ '../views/About.vue')
  // },
  {
    path: "/login",
    name: "Login",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "Login" */ "../views/Login.vue"),
  },
  {
    path: "/regis",
    name: "Regis",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "Regis" */ "../views/Regis.vue"),
  },
  // {
  //   path: "/404",
  //   name: "404",
  //   // route level code-splitting
  //   // this generates a separate chunk (about.[hash].js) for this route
  //   // which is lazy-loaded when the route is visited.
  //   component: () => import(/* webpackChunkName: "404" */ "../views/404.vue"),
  // },
  // {
  //   path: "*",
  //   redirect: "/404",
  // },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
