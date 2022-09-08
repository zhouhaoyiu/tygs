<template>
  <div class="title">
    <slot></slot>
    <el-divider></el-divider>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop } from "vue-property-decorator";
@Component({
  components: {},
})
export default class Title extends Vue {
  // @Prop()
}
</script>

<style lang="scss" scoped>
.title {
  font-size: 44px;
  font-weight: bold;
  color: #9e9e9e;
  user-select: none; 
  // padding-bottom: 10px;
}
</style>
