<template>
	<div>
    <Title>新增 消火栓</Title>
    <Building>Building...</Building>
  </div>
</template>

<script lang="ts">
import Building from "@/components/Building.vue";
import Title from "@/components/title.vue";
import Vue from "vue";
import Component from "vue-class-component";

@Component({ components: { Title, Building } })
export default class AddFireHydrant extends Vue {}
</script>

<style lang="scss" scoped></style>
