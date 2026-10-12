<template>
	<div id="app">
		<router-view></router-view>
	</div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
	name: "App",
	components: {},
	data() {
		return {};
	},
	computed: {},
	methods: {},
	mounted(): void {
		console.log("%chomeIndex mounted", "color: red; font-size: 20px;font-weight:bold");
	},
});
</script>

<style lang="scss" scoped>
#app {
	// font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	margin: 0px;
	padding: 0px;
	width: 100%;
	height: 100%;
}
</style>
