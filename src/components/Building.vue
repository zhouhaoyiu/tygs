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
import { defineComponent } from "vue";

export default defineComponent({
	name: "Building",
	data() {
		return {};
	},
	computed: {},
	methods: {},
});
</script>

<style lang="scss" scoped></style>
