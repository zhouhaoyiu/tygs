<template>
	<div>
		<Title>新增 消火栓</Title>
		<Building>Building...</Building>
	</div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import Building from "@/components/Building.vue";

import Title from "@/components/title.vue";
export default defineComponent({
	name: "AddFireHydrant",
	components: { Title, Building },
	data() {
		return {};
	},
	computed: {},
	methods: {},
});
</script>

<style lang="scss" scoped></style>
