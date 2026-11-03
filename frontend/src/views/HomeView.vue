<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";
import { getRecentBoards } from "@/utils/recentBoards/recentBoards";
import { RouterLink, useRouter } from "vue-router";

const auth = useAuthStore();
const router = useRouter();

const boards = getRecentBoards(localStorage);

const dateFormat = new Intl.DateTimeFormat("ru", { dateStyle: "medium", timeStyle: "short" });

const logout = async () => {
  await auth.logout();
  await router.push("/");
};
</script>

<template>
  <div class="page">
    <div class="page-inner">
      <header class="page-header">
        <RouterLink to="/home" class="page-logo">ДроГА</RouterLink>
        <span>
          {{ auth.user?.name }}
          <button class="page-link logout" @click="logout">Выйти</button>
        </span>
      </header>

      <h1 class="page-title">Доски</h1>

      <p class="new-board">
        <a href="/draw/new" class="page-button">Новая доска</a>
      </p>

      <ul v-if="boards.length" class="boards">
        <li v-for="board in boards" :key="board.id">
          <a :href="`/draw?id=${board.id}`" class="page-link board-id">{{ board.id }}</a>
          <span class="page-muted">{{ dateFormat.format(board.openedAt) }}</span>
        </li>
      </ul>
      <p v-else class="page-muted">Вы ещё не открывали доски в этом браузере.</p>
    </div>
  </div>
</template>

<style scoped>
.logout {
  margin-left: 12px;
  cursor: pointer;
}

.new-board {
  margin-bottom: 32px;
}

.boards li {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 8px 0;
  border-bottom: 1px solid var(--clr-border);
}

.board-id {
  font-family: "JetBrains Mono", monospace;
}
</style>
