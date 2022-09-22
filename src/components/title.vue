<template>
	<div class="title">
		<slot></slot>
		<el-divider></el-divider>
	</div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
@Component({
	components: {},
})
export default class Title extends Vue {}
</script>

<style lang="scss" scoped>
.title {
	font-size: 40px;
	font-weight: bold;
	color: #9e9e9e;
	user-select: none;
	// padding-bottom: 10px;
}
</style>
