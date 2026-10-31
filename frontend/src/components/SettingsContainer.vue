<script setup lang="ts">
import type { WebSocketService } from "@/services/webSocketService";
import { useColorMode, type BasicColorSchema } from "@vueuse/core";
import { computed, ref } from "vue";
import type { DropdownMenuItem } from "@nuxt/ui";
import UDropdownMenu from "@nuxt/ui/components/DropdownMenu.vue";
import UButton from "@nuxt/ui/components/Button.vue";
import UModal from "@nuxt/ui/components/Modal.vue";
import { useAllObjectsStore } from "@/stores/allObjects";

const { socket } = defineProps<{
  socket: WebSocketService;
}>();

const { store, system } = useColorMode({
  attribute: "class",
  initialValue: "auto",
});

const allObjectsStore = useAllObjectsStore();

const isConfirmOpen = ref(false);

const myColorMode = computed(() => (store.value === "auto" ? system.value : store.value));

const themes: { mode: BasicColorSchema; label: string; icon: string }[] = [
  { mode: "auto", label: "Системная", icon: "i-heroicons-computer-desktop" },
  { mode: "light", label: "Светлая", icon: "i-heroicons-sun" },
  { mode: "dark", label: "Тёмная", icon: "i-heroicons-moon" },
];

function clearBoard() {
  socket.send(["clear"]);
  allObjectsStore.clear();
  isConfirmOpen.value = false;
}

function openConfirmModal() {
  isConfirmOpen.value = true;
}

// computed, а не ref: иконка темы и галочка в подменю меняются вместе с режимом
const items = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: "Профиль",
      icon: "i-heroicons-user",
      kbds: ["ctrl", "U"],
      onSelect: () => location.replace("/login"),
    },
    {
      label: "Сохранить файл",
      icon: "i-heroicons-arrow-down-tray",
      kbds: ["ctrl", "D"],
    },
    {
      label: "Сохранить доску на сервере",
      icon: "i-heroicons-server",
      kbds: ["ctrl", "shift", "O"],
    },
    {
      label: "Тема",
      icon:
        store.value === "auto"
          ? "i-heroicons-computer-desktop"
          : myColorMode.value === "dark"
            ? "i-heroicons-moon"
            : "i-heroicons-sun",
      children: themes.map(({ mode, label, icon }) => ({
        label,
        icon,
        type: "checkbox" as const,
        checked: store.value === mode,
        onUpdateChecked: () => (store.value = mode),
      })),
    },
  ],
  [
    {
      label: "Очистить полотно",
      icon: "i-heroicons-trash",
      color: "error",
      kbds: ["ctrl", "shift", "del"],
      onSelect: openConfirmModal,
    },
  ],
]);
</script>

<template>
  <div class="settings-wrapper">
    <UDropdownMenu :items="items">
      <UButton icon="i-heroicons-bars-3" color="neutral" variant="outline" />
    </UDropdownMenu>
  </div>
  <UModal
    v-model:open="isConfirmOpen"
    title="Вы точно хотите очистить всю доску?"
    description="Рисунки пропадут у всех участников доски"
  >
    <template #footer>
      <div class="flex gap-2">
        <UButton variant="outline" color="neutral" label="Отмена" @click="isConfirmOpen = false" />
        <UButton color="error" label="Подтвердить" @click="clearBoard" />
      </div>
    </template>
  </UModal>
</template>

<style scoped>
.settings-wrapper {
  position: absolute;
  right: 15px;
  top: 15px;
}
</style>
