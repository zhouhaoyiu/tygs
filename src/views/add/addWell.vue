<template>
	<div class="page">
		<Title>新增 水表信息(户表)</Title>
		<Buliding>Building...</Buliding>
	</div>
</template>

<script lang="ts">
import Buliding from "@/components/Buiding.vue";
import Title from "@/components/title.vue";
import Vue from "vue";
import Component from "vue-class-component";

@Component({ components: { Title, Buliding } })
export default class AddWell extends Vue {}
</script>

<style lang="scss" scoped></style>
