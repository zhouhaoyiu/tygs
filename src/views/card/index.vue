<template>
  <div>
    <Title>卡片</Title>
    <div>
      城北营销分公司供水附属设施登记卡
      <div style="display: flex;border: 1px solid black;width:max-content">
        <div style="border-right: 1px solid black;">设施名称</div>
        <div style="border-right: 1px solid black;">阀门井</div>
        <div style="border-right: 1px solid black;">使用状态</div>
        <div style="border-right: 1px solid black;">正常</div>
        <div style="border-right: 1px solid black;">所属管线</div>
        <div style="border-right: 1px solid black;">白龙庙街DN300球墨铸铁给水管线（北线）</div>
        <div style="border-right: 1px solid black;">井室编号</div>
        <div style="border-right: 1px solid black;">13</div>
      </div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
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

<style lang="scss"></style>
