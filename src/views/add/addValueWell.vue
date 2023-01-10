<template>
	<div class="page">
    <Title>新增 阀门井</Title>
    <Building>Building...</Building>
  </div>
</template>

<script lang="ts">
import Building from "@/components/Building.vue";
import Title from "@/components/title.vue";
import Vue from "vue";
import Component from "vue-class-component";

@Component({ components: { Title, Building } })
export default class AddValueWell extends Vue {}
</script>

<style lang="scss" scoped></style>
