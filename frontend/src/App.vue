<script setup lang="ts">
import Confirm from "./components/ConfirmContainer.vue";
import CursorContainer from "./components/CursorContainer.vue";
import OptionsContainer from "./components/OptionsContainer.vue";
import SettingsContainer from "./components/SettingsContainer.vue";
import ZoomContainer from "./components/ZoomContainer.vue";
import CanvasContainer from "./components/CanvasContainer.vue";
import { WebSocketService } from "./services/webSocketService";
import UndoRedoContainer from "./components/UndoRedoContainer.vue";

const socket = new WebSocketService();
</script>

<template>
  <Confirm />
  <CursorContainer />
  <OptionsContainer />
  <ZoomContainer />
  <SettingsContainer :socket="socket" />
  <CanvasContainer :socket="socket" />
  <UndoRedoContainer />
</template>
