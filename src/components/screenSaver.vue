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
		<div class="eName">TAIYUAN WATER SUPPLY GROUP CO,.LTD</div>
	</div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";

@Component({})
export default class ScreenSaver extends Vue {
	public async mounted(): Promise<void> {}
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
		color:rgb(53, 28, 117)
	}
	50% {
		color: rgb(186, 47, 128);
	}
	100% {
		color:rgb(53, 28, 117)
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
		color: rgb(53, 28, 117);
		animation: name-color infinite 20s linear;
	}

	.eName {
		font-size: 24px;
		font-weight: 700;
		margin-top: 20px;
		color: rgb(230, 145, 56);
	}
}
</style>
