import Vue from "vue";
import VueRouter, { RawLocation, RouteConfig } from "vue-router";
import Home from "../views/Home.vue";

Vue.use(VueRouter);

const originalPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location: RawLocation) {
	return (originalPush as Function).call(this, location).catch((err: Error) => err);
};

const routes: Array<RouteConfig> = [
	{
		path: "/",
		name: "index",
		redirect: "/home",
	},
	{
		path: "/screenSaver",
		name: "screenSaver",
		component: () => import(/* webpackChunkName: "index" */ "../components/screenSaver.vue"),
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
				component: () => import(/* webpackChunkName: "index" */ "../views/index/index.vue"),
			},
			{
				path: "searchAll",
				name: "searchAll",
				component: () =>
					import(/* webpackChunkName: "searchAll" */ "../views/search/searchAll.vue"),
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
				path: "searchWell",
				name: "searchWell",
				component: () =>
					import(/* webpackChunkName: "searchWell" */ "../views/search/searchWell.vue"),
			},
			{
				path: "addWaterMeterWell",
				name: "addWaterMeterWell",
				component: () =>
					import(
						/* webpackChunkName: "addWaterMeterWell" */ "../views/add/addWaterMeterWell.vue"
					),
			},
			{
				path: "addValueWell",
				name: "addValueWell",
				component: () =>
					import(/* webpackChunkName: "addValueWell" */ "../views/add/addValueWell.vue"),
			},
			{
				path: "addFireHydrant",
				name: "addFireHydrant",
				component: () =>
					import(
						/* webpackChunkName: "addFireHydrant" */ "../views/add/addFireHydrant.vue"
					),
			},
			{
				path: "addWaterMeterRoom",
				name: "addWaterMeterRoom",
				component: () =>
					import(
						/* webpackChunkName: "addWaterMeterRoom" */ "../views/add/addWaterMeterRoom.vue"
					),
			},
			{
				path: "addWell",
				name: "addWell",
				component: () =>
					import(/* webpackChunkName: "addWell" */ "../views/add/addWell.vue"),
			},
			{
				path: "card",
				name: "card",
				component: () => import(/* webpackChunkName: "card" */ "../views/card/index.vue"),
			},
			{
				path: "InputInfor",
				name: "InputInfor",
				component: () =>
					import(/* webpackChunkName: "InputInfor" */ "../views/inputInfor/index.vue"),
			},
			{
				path: "map",
				name: "map",
				component: () => import(/* webpackChunkName: "map" */ "../views/map/index.vue"),
			},
			{
				path: "threeSupply",
				name: "threeSupply",
				component: () =>
					import(/* webpackChunkName: "threeSupply" */ "../views/threeSupply/index.vue"),
			}
		],
	},
	// {
	//   path: '/about',
	//   name: 'About',
	//   component: () =>
	//     import(/* webpackChunkName: "about" */ '../views/About.vue')
	// },
	{
		path: "/login",
		name: "Login",
		component: () => import(/* webpackChunkName: "Login" */ "../views/Login.vue"),
	},
	{
		path: "/regis",
		name: "Regis",
		component: () => import(/* webpackChunkName: "Regis" */ "../views/Regis.vue"),
	},
	{
		path: "/404",
		name: "404",
		component: () => import(/* webpackChunkName: "404" */ "../views/404.vue"),
	},
	{
		path: "*",
		redirect: "/404",
	},
];

const router = new VueRouter({
	mode: "history",
	base: process.env.BASE_URL,
	routes,
});

export default router;
