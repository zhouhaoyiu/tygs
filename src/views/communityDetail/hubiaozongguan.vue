<template>
	<div class="page">
		<Title>户表总管</Title>
		<div class="table">
			<!-- 根据居民用水户数，非居民用水户数，二次供水设施，供用水合同排序 -->
			<el-table
				border
				stripe
				:data="communityInfoList"
				max-height="590px"
				class="table"
				:default-sort="{ prop: 'accountname', order: 'ascending' }"
			>
				<el-table-column
					align="center"
					prop="accountname"
					width="300px"
					label="户名"
					sortable
					:sort-method="accountnameSort"
				></el-table-column>
				<el-table-column align="center" prop="address" label="地址"></el-table-column>
				<el-table-column
					align="center"
					prop="residentialwater"
					label="居民用水（户）"
					sortable
					:sort-by="residentialwaterSort"
				></el-table-column>
				<el-table-column
					align="center"
					prop="nonresidentialwater"
					label="非居民用水（户）"
					sortable
					:sort-by="nonresidentialwaterSort"
				></el-table-column>
				<el-table-column
					align="center"
					prop="secondarywatersupply"
					label="二次供水设施"
					width="150px"
					:filters="[
						{ text: '√', value: '√' },
						{ text: '×', value: '×' },
					]"
					:filter-method="secondarywatersupplyFilterHandler"
				></el-table-column>
				<el-table-column
					align="center"
					prop="watersupplycontract"
					label="供用水合同"
					width="150px"
					:filters="[
						{ text: '√', value: '√' },
						{ text: '×', value: '×' },
					]"
					:filter-method="watersupplycontractFilterHandler"
				></el-table-column>
				<el-table-column align="center" prop="remarks" label="备注"></el-table-column>
			</el-table>
		</div>
	</div>
</template>

<script lang="ts">
import _ from "lodash";
import Vue from "vue";
import Component from "vue-class-component";
import Title from "../../components/title.vue";

@Component({
	components: {
		Title,
	},
})
export default class Hubiaozongguan extends Vue {
	public name: string = "Hubiaozongguan";

	// accountname 户 名
	// address 地址
	// residentialwater 居民用水（户）
	// nonresidentialwater 非居民用水（户）
	// secondarywatersupply 二次供水设施
	// watersupplycontract 供用水合同
	// remarks 备注

	public communityInfoList: any[] = [];

	public accountnameSort = (a: any, b: any) => {
		if(!a.accountname || !b.accountname) return 0;
    return a.accountname.localeCompare(b.accountname, "zh");   
	};
	public residentialwaterSort = (a: any, b: any) => {
		return Number(a.residentialwater) - b;
	};
	public nonresidentialwaterSort = (a: any, b: any) => {
		console.log(a, b);
		return Number(a.nonresidentialwater) - b;
	};
	public secondarywatersupplyFilterHandler(value: any, row: any) {
		return row.secondarywatersupply === value;
	}
	public watersupplycontractFilterHandler(value: any, row: any) {
		return row.watersupplycontract === value;
	}
	public async mounted(): Promise<void> {
		const res = await this["axios"].get("/Hubiaohuguan/getAllHubiaohuguan");
		console.log(res);
		this.communityInfoList = res.data;
	}
}
</script>
<style lang="scss">
.page {
	.name {
		font-size: 48px;
	}
	.table {
		margin-top: 20px;
		width: 1600px;
		box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
	}
}
</style>
