<script setup lang="ts">
import Confirm from './components/ConfirmContainer.vue';
import CursorContainer from './components/CursorContainer.vue';
import OptionsContainer from './components/OptionsContainer.vue';
import SettingsContainer from './components/SettingsContainer.vue';
import ZoomContainer from './components/ZoomContainer.vue';

import CanvasContainer from './components/CanvasContainer.vue';
</script>

<template>
  <div id="me" class="trailer"></div>
  <Confirm />
  <CursorContainer />
  <OptionsContainer />
  <ZoomContainer />
  <SettingsContainer />
  <CanvasContainer />
</template>

<style scoped></style>
