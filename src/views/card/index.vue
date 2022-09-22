<template>
	<div>
		<Title>城北营销分公司供水附属设施登记卡</Title>
		<!-- <div>
      
      <div class="card">
        <div class="cardText">设施名称</div>
        <div class="cardText">阀门井</div>
        <div class="cardText">使用状态</div>
        <div class="cardText">正常</div>
        <div class="cardText">所属管线</div>
        <div class="cardText">白龙庙街DN300球墨铸铁给水管线（北线）</div>
        <div class="cardText">井室编号</div>
        <div class="cardText">13</div>
      </div>
      <div class="card">
        <div class="cardText">规格型号</div>
        <div class="cardText">DN100</div>
        <div class="cardText">井室类型</div>
        <div class="cardText"></div>
        <div class="cardText"></div>
      </div>
    </div> -->
		<el-descriptions class="margin-top" style="width: 700px" :column="3" size="small" border>
			<el-descriptions-item>
				<template slot="label">设施名称</template>
				阀门井
			</el-descriptions-item>
			<el-descriptions-item>
				<template slot="label">使用状态</template>
				正常
			</el-descriptions-item>
			<el-descriptions-item>
				<template slot="label">所属管线</template>
				白龙庙街DN300球墨铸铁给水管线（北线）
			</el-descriptions-item>
			<el-descriptions-item>
				<template slot="label">井室编号</template>
				13
			</el-descriptions-item>
			<el-descriptions-item>
				<template slot="label">联系地址</template>
				江苏省苏州市吴中区吴中大道 1188 号
			</el-descriptions-item>
		</el-descriptions>
	</div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import Title from "../../components/title.vue";

@Component({
	components: {
		Title,
	},
})
export default class Card extends Vue {}
</script>

<style lang="scss">
.card {
	display: flex;
	justify-content: center;
	align-items: center;
	border: 1px solid black;
	border-right: 0px;
	width: max-content;
	height: 100px;
	text-align: center;
	.cardText {
		display: flex;
		justify-content: center;
		align-items: center;
		border-right: 1px solid black;
		width: 100px;
		height: 100%;
	}
}
</style>
