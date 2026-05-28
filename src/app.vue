<script setup>

import Layout from "./shared/presentation/components/layout.vue";
import {useI18n} from "vue-i18n";
const { t } = useI18n();
</script>

<template>
  <div class="app-flex-layout">
    <layout/>
  </div>
</template>

<style scoped>
.app-flex-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>

<style>
html, body {
  overflow-x: hidden;
}
</style>
