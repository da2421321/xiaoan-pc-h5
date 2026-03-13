<template>
  <router-view />
  <Loading />
</template>

<script setup lang="ts">
import Loading from '@/components/modals/loading.vue';
</script>

<style>
#app {
  font-family: Inter, Avenir, Helvetica, Arial, sans-serif;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-text-size-adjust: 100%;
  height: 100%;
}

html,
body {
  margin: 0;
  height: 100%;
}
</style>
