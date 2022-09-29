<template>
	<div class="top-bar">
		<div class="logo-box">
			<img class="logo" @click="goHome()" :src="require('../assets/tygs.png')" alt="logo" />
		</div>
		<!-- <div class="banner-box"> -->
		<!-- <img class="banner" :src="require('../assets/banner.jpg')" alt=""> -->
		<!-- </div> -->
		<div @click="screenSaver()" class="sitename-box">城北<!-- 营销分公司 表井 -->信息数据库</div>
	</div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
@Component({})
export default class TopBar extends Vue {
	public goHome(): void {
		this.$router.push("/");
	}

	public screenSaver(): void {
		this.$router.push("/screenSaver");
	}
}
</script>

<style lang="scss">
.top-bar {
	width: 100%;
	height: 110px;
	background-color: rgba(220, 220, 220, 0.705);
	padding: 0;
	margin: 0;
	display: flex;
	line-height: 50px;
	font-size: 20px;
	font-weight: bold;
	color: #000;
	text-align: center;
	box-shadow: 0px 0px 8px 0px rgba(29, 35, 41, 0.05);
	.logo-box {
		display: flex;
		justify-content: center;
		align-items: center;
		min-width: 208px;
		height: 100%;
		// border-right: 1px solid #ccc;
		.logo {
			width: 100px;
			height: 100px;
			object-fit: cover;
			cursor: pointer;
		}
	}
	.banner-box {
		display: flex;
		// justify-content: center;
		align-items: center;
		width: 800px;
		height: 100%;
		.banner {
			width: 800px;
			height: 100%;
			object-fit: cover;
		}
	}
	.sitename-box {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		height: 100%;
		font-size: 48px;
		font-weight: bold;
		color: #000;
		text-align: center;
		font-family: "楷体", "Microsoft YaHei", "微软雅黑", sans-serif;
	}
}
</style>
