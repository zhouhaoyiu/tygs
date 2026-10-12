<template>
	<div class="page">
		<Title>查询 三供一业</Title>
		<Building>Building...</Building>
	</div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import Building from "@/components/Building.vue";

import Title from "../../components/title.vue";
export default defineComponent({
	name: "ThreeSupply",
	components: {
		Title,
		Building,
	},
	data() {
		return {};
	},
	computed: {},
	methods: {},
});
</script>

<style lang="scss" scoped></style>
