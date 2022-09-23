<template>
	<div>
		<Title>新增表井(总表)</Title>
	</div>
</template>

<script lang="ts">
import Title from "@/components/title.vue";
import Component from "vue-class-component";
import Vue from "vue";

@Component({
	components: { Title },
})
export default class AddWaterMeterWell extends Vue {
	public mounted(): void {
		console.log("addWaterMeterWell");
	}
}
</script>

<style lang="scss" scoped></style>
