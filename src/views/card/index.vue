<template>
	<div>
		<Title><!-- 城北营销分公司 -->供水附属设施登记卡</Title>
		<div>
			<el-descriptions
				class="margin-top"
				style="width: 850px"
				contentStyle="text-align: center;"
				:column="4"
				size="small"
				border
			>
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
					<template slot="label">规格型号</template>
					DN300
				</el-descriptions-item>
				<el-descriptions-item>
					<template slot="label">井室类型 </template>
					闸阀
				</el-descriptions-item>
				<el-descriptions-item>
					<template slot="label">井室坐标 </template>
					X:63700.72 Y:21394.07 Z:
				</el-descriptions-item>
				<el-descriptions-item>
					<template slot="label">运行状态 </template>
					正常
				</el-descriptions-item>
				<el-descriptions-item>
					<template slot="label">井室情况 </template>
					正口
				</el-descriptions-item>
				<el-descriptions-item>
					<template slot="label">开关方向 </template>
					正门
				</el-descriptions-item>
				<el-descriptions-item>
					<template slot="label">相对位置 </template>
					老徐烧烤
				</el-descriptions-item>
				<el-descriptions-item>
					<template slot="label">井 深 </template>
					1.5m
				</el-descriptions-item>
				<el-descriptions-item>
					<template slot="label">生产厂家 </template>
					x:66631.223 y:19267.643 z:
				</el-descriptions-item>
				<el-descriptions-item>
					<template slot="label">安装时间 </template>
					2016-8-1
				</el-descriptions-item>
				<el-descriptions-item>
					<template slot="label">备 注 </template>
					无
				</el-descriptions-item>
			</el-descriptions>
		</div>
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
