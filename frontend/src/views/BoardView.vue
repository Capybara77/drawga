<script setup lang="ts">
import CanvasContainer from "@/components/CanvasContainer.vue";
import CursorContainer from "@/components/CursorContainer.vue";
import OptionsContainer from "@/components/OptionsContainer.vue";
import SettingsContainer from "@/components/SettingsContainer.vue";
import UndoRedoContainer from "@/components/UndoRedoContainer.vue";
import ZoomContainer from "@/components/ZoomContainer.vue";
import { WebSocketService } from "@/services/webSocketService";
import { rememberBoard } from "@/utils/recentBoards/recentBoards";

const socket = new WebSocketService();
const boardId = new URLSearchParams(location.search).get("id");

if (boardId) {
  rememberBoard(localStorage, boardId, Date.now());
}
</script>

<template>
  <CursorContainer />
  <OptionsContainer />
  <ZoomContainer />
  <SettingsContainer :socket="socket" />
  <CanvasContainer :socket="socket" />
  <UndoRedoContainer />
</template>
