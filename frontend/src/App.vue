<script setup lang="ts">
import Confirm from './components/ConfirmContainer.vue';
import CursorContainer from './components/CursorContainer.vue';
import OptionsContainer from './components/OptionsContainer.vue';
import SettingsContainer from './components/SettingsContainer.vue';
import ZoomContainer from './components/ZoomContainer.vue';
import CanvasContainer from './components/CanvasContainer.vue';
import TrailerComponent from './components/TrailerComponent.vue';
</script>

<template>
  <TrailerComponent />
  <Confirm />
  <CursorContainer />
  <OptionsContainer />
  <ZoomContainer />
  <SettingsContainer />
  <CanvasContainer />
</template>
