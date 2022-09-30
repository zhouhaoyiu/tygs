<template>
	<div class="page">
		<!-- 123 -->
		<div>
			<img
				class="logo"
				@click="$router.replace('/')"
				:src="require('../assets/tygs.png')"
				alt="logo"
			/>
		</div>
		<div class="name">太原供水集团</div>
		<div class="eName" @click="infoMessageBox()">TAIYUAN WATER SUPPLY GROUP CO,.LTD</div>
	</div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";

@Component({})
export default class ScreenSaver extends Vue {
	public async mounted(): Promise<void> {}
	public infoMessageBox(): void {
		this.$alert(
			"太原供水集团有限公司成立于1998年03月28日,注册地位于太原市杏花岭区北大街109号,法定代表人为杨怀军。经营范围包括城市自来水产、供、销；机械设备租赁；供水设施建、修、造等综合经营；水源开发工程；供水工程施工；机械加工修理；水表产销；房屋租赁；污水处理及其再生利用；水环境污染防治服务。（依法须经批准的项目，经相关部门批准后方可开展经营活动）",
			"太原供水",
			{ center: true },
		);
	}
}
</script>

<style lang="scss" scoped>
@keyframes logo-spin {
	from {
		transform: rotate(0deg);
	}
	to {
		transform: rotate(360deg);
	}
}

@keyframes name-color {
	0% {
		color: rgb(53, 28, 117);
	}
	50% {
		color: rgb(186, 47, 128);
	}
	100% {
		color: rgb(53, 28, 117);
	}
}
.page {
	width: 100%;
	height: 100%;
	background-color: #fce5cd;
	display: flex;
	flex-direction: column;
	place-items: center center;
	justify-content: center;
	align-items: center;
	user-select: none !important;

	.logo {
		width: 300px;
		height: 300px;
		object-fit: cover;
		cursor: pointer;
		animation: logo-spin infinite 20s linear;
	}

	.name {
		font-size: 56px;
		font-weight: 700;
		margin-top: 20px;
		// color: rgb(53, 28, 117);
		animation: name-color infinite 20s linear;
	}

	.eName {
		font-size: 24px;
		font-weight: 700;
		margin-top: 20px;
		color: rgb(230, 145, 56);
		border: 1px solid rgb(230, 145, 56);
		padding: 10px 20px;
		border-radius: 10px;
	}
	.eName:hover {
		color: rgb(255, 255, 255);
		background-color: rgb(230, 145, 56);
		cursor: pointer;
	}
	.eName:active {
		color: rgb(230, 145, 56);
		background-color: rgb(255, 255, 255);
		transform: scale(0.9);
	}
}
</style>
