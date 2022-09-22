<template>
	<div>
		<Title>地图</Title>
		<div id="info"></div>
		<div id="container"></div>
	</div>
</template>

<script lang="ts">
import Title from "@/components/title.vue";
import Vue from "vue";
import Component from "vue-class-component";
import AMapLoader from "@amap/amap-jsapi-loader";
@Component({
	components: { Title },
})
export default class Map extends Vue {
	// data
	// computed
	// methods
	public async initMap(): Promise<void> {
		const AMap = await AMapLoader.load({
			key: "c58e505bf432a2eacadec27b90c3f5fa", // 申请好的Web端开发者Key，首次调用 load 时必填
			version: "2.0", // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
			// 添加指南针插件
			plugins: ["AMap.CitySearch", "AMap.Scale", "AMap.ToolBar", "AMap.MapType"],
		});
		// 初始化地图
		const map = await new AMap.Map("container", {
			resizeEnable: true,
			zoom: 10,
		});
		map.plugin(["AMap.CitySearch"], function () {
			var citySearch = new AMap.CitySearch();

			citySearch.getLocalCity(function (
				status: string,
				result: { info: string; city: any; bounds: any },
			) {
				if (status === "complete" && result.info === "OK") {
					if (result && result.city && result.bounds) {
						var cityinfo = result.city;
						var citybounds = result.bounds;
						// document.getElementById("info").innerHTML =
						//   "您当前所在城市：" + cityinfo;
						//地图显示当前城市
						map.setBounds(citybounds);
					}
				} else {
					// document.getElementById("info").innerHTML = result.info;
				}
			});
		});
		// 添加地图类型切换插件
		map.plugin(["AMap.MapType"], function () {
			//地图类型切换
			var type = new AMap.MapType({
				defaultType: 0, //使用2D地图
			});
			map.addControl(type);
		});
		// 添加比例尺插件
		map.plugin(["AMap.Scale"], function () {
			var scale = new AMap.Scale();
			map.addControl(scale);
		});
		// 添加定位插件

		// map.plugin(["AMap.Geolocation"], function () {
		//   let geolocation = new AMap.Geolocation({
		//     // 是否使用高精度定位，默认：true
		//     enableHighAccuracy: true,
		//     // 设置定位超时时间，默认：无穷大
		//     timeout: 10000,
		//     // 定位按钮的停靠位置的偏移量
		//     offset: [10, 20],
		//     //  定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
		//     zoomToAccuracy: true,
		//     //  定位按钮的排放位置,  RB表示右下
		//     position: "RB",
		//   });

		//   geolocation.getCurrentPosition(function (status: string, result: any) {
		//     if (status == "complete") {
		//       onComplete(result);
		//     } else {
		//       onError(result);
		//     }
		//   });

		//   function onComplete(data: any) {
		//     console.log("定位成功", data);
		//     // data是具体的定位信息
		//   }

		//   function onError(data: any) {
		//     // 定位出错
		//     alert(JSON.stringify(data));
		//   }
		// });
		// 添加工具条插件
		map.plugin(["AMap.ToolBar"], function () {
			var toolBar = new AMap.ToolBar();
			map.addControl(toolBar);
		});
	}
	// lifecycle
	public async mounted(): Promise<void> {
		await this.initMap();
	}
	// watch
}
</script>

<style lang="scss" scoped>
#container {
	width: 100%;
	height: 80%;
}
</style>
