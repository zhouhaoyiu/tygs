<template>
	<div class="page">
		<Title>查询 三供一业</Title>
		<Building>Building...</Building>
	</div>
</template>

<script lang="ts">
import Building from "@/components/Building.vue";
import Vue from "vue";
import Component from "vue-class-component";
import Title from "../../components/title.vue";

@Component({
	components: {
		Title,
		Building,
	},
})
export default class ThreeSupply extends Vue {}
</script>

<style lang="scss" scoped></style>
