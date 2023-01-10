<template>
	<el-empty style="width: 100%; height: 80%" description=" " :image-size="300">
		<!-- 粗体 内容显示BUILDING -->
		<strong>
			<h1 style="color: #9e9e9e">
				<slot></slot>
			</h1>
		</strong>
	</el-empty>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";

@Component({})
export default class Building extends Vue {}
</script>

<style lang="scss" scoped></style>
