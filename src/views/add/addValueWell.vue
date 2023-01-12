<template>
  <div class="page">
    <Title>新增 阀门井</Title>
    <!-- <Building>Building...</Building> -->
    <el-form label-position="center" size="small" ref="form" :model="form" style="width: 350px;" label-width="120px">
      <el-form-item label="填写人">
        <el-input v-model="form.filledBy"></el-input>
      </el-form-item>
      <!-- accountIdentifier -->
      <el-form-item label="编号">
        <el-input v-model="form.accountIdentifier"></el-input>
      </el-form-item>
      <!-- streetName -->
      <el-form-item label="街道名称">
        <el-input v-model="form.streetName"></el-input>
      </el-form-item>
      <!-- 井室类型 多选 -->
      <el-form-item label="井室类型(多选)">
        <el-select multiple v-model="form.wellChamberType" placeholder="请选择">
          <el-option v-for="item in wellTypeOptions" :key="item.value" :label="item.label"
            :value="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="其它井室类型">
        <el-input v-model="form.otherWellChamberType"></el-input>
      </el-form-item>
      <el-form-item label="口径">
        <el-select multiple v-model="form.caliber" placeholder="请选择">
          <el-option v-for="item in caliberOptions" :key="item.value" :label="item.label"
            :value="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="其它口径">
        <el-input v-model="form.otherCaliber"></el-input>
      </el-form-item>
      <!-- 运行状态 -->
      <el-form-item label="运行状态">
        <el-select v-model="form.runningState" placeholder="请选择">
          <e-option v-for="item in runStatusOptions" :key="item.value" :label="item.label"
            :value="item.value"></e-option>
        </el-select>
      </el-form-item>
      <el-form-item label="井深（米）">
        <el-input-number v-model="form.wellDepth" :precision="2" :step="0.1" :max="10"></el-input-number>
      </el-form-item>
      <!-- 定位坐标 -->
      <el-form-item label="定位坐标">
        <el-input v-model="form.positioningCoordinates"></el-input>
      </el-form-item>
      <!-- 厂家 -->
      <el-form-item label="厂家">
        <el-input v-model="form.manufacturer"></el-input>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
import Building from "@/components/Building.vue";
import Title from "@/components/title.vue";
import Vue from "vue";
import Component from "vue-class-component";

@Component({ components: { Title, Building } })
export default class AddValueWell extends Vue {
  public form = {
    filledBy: "",
    accountIdentifier: "",
    streetName: "",

    wellChamberType: [],
    otherWellChamberType: "",

    caliber: [],
    otherCaliber: "",

    runningState: "",
    wellDepth: "",

    positioningCoordinates: "",
    manufacturer: "",
  };

  public wellTypeOptions = [
    { value: "主线阀门", label: "主线阀门" },
    { value: "用户阀门", label: "用户阀门" },
    { value: "排气", label: "排气" },
    { value: "消火栓", label: "消火栓" },
    { value: "泄水", label: "泄水" },
    { value: "连接", label: "连接" },
    { value: "减压阀", label: "减压阀" },
  ];

  public caliberNumber =
    [
      15, 20, 25, 40, 50,
      100, 150, 200, 300,
      400, 500, 600, 700,
      800, 900, 1000, 1200,
      1400, 1600, 1800, 2000, 2200
    ]

  public runStatusOptions = [
    { value: "正常", label: "正常" },
    { value: "污水", label: "污水" },
    { value: "漏水", label: "漏水" },
    { value: "井盖破损", label: "井盖破损" },
    { value: "井盖丢失", label: "井盖丢失" },
    { value: "井盖不符", label: "井盖不符" },
    { value: "盘根漏水", label: "盘根漏水" },
    { value: "车压", label: "车压" },
    { value: "井盖异常", label: "井盖异常" },
    { value: "井圈异常", label: "井圈异常" },
    { value: "老式井盖", label: "老式井盖" },
    { value: "销子损坏", label: "销子损坏" },
    { value: "其他", label: "其他" },
  ];

  public caliberOptions = this.caliberNumber.map((item) => {
    return { value: `DN${item}`, label: `DN${item}` };
  });
}
</script>

<style lang="scss" scoped>

</style>
