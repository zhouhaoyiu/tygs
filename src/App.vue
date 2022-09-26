<template>
	<div id="app">
		<router-view></router-view>
	</div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
@Component({
	components: {},
})
export default class App extends Vue {
	public mounted(): void {
		console.log("%chomeIndex mounted", "color: red; font-size: 20px;font-weight:bold");
	}
}
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
