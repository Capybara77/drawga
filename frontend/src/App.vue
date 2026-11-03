<script setup lang="ts">
import UApp from "@nuxt/ui/components/App.vue";
import { useColorMode } from "@vueuse/core";
import { RouterView } from "vue-router";

// тема применяется на всех страницах, а переключатель живёт в меню доски
useColorMode({ attribute: "class", initialValue: "auto" });
</script>

<template>
  <UApp>
    <RouterView />
  </UApp>
</template>
