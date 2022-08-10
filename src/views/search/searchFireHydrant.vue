<template>
  <div>
    <Title>消防栓</Title>
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
export default class SearchFireHydrant extends Vue {}
</script>
