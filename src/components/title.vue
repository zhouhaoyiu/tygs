<template>
	<div class="title">
		<slot></slot>
		<el-divider></el-divider>
	</div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
	name: "Title",
	components: {},
	data() {
		return {};
	},
	computed: {},
	methods: {},
});
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
