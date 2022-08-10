<template>
  <div class="page">
    <Title>首页</Title>
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
export default class homeIndex extends Vue {}
</script>

<style lang="scss">
.page {
  .name {
    font-size: 48px;
  }
}
</style>
