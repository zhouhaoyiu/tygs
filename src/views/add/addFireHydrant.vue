<template>
	<div>
    <Title>新增 消火栓</Title>
    <Buliding>Building...</Buliding>
  </div>
</template>

<script lang="ts">
import Buliding from "@/components/Buiding.vue";
import Title from "@/components/title.vue";
import Vue from "vue";
import Component from "vue-class-component";

@Component({ components: { Title, Buliding } })
export default class AddFireHydrant extends Vue {}
</script>

<style lang="scss" scoped></style>
