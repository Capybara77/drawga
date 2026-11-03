<script setup lang="ts">
import { useAuthStore, type AuthError } from "@/stores/auth";
import { ref } from "vue";
import { RouterLink, useRouter } from "vue-router";

const auth = useAuthStore();
const router = useRouter();

const email = ref("");
const password = ref("");
const error = ref<AuthError | null>(null);
const isPending = ref(false);

const submit = async () => {
  isPending.value = true;
  error.value = await auth.login(email.value, password.value);
  isPending.value = false;

  if (!error.value) {
    await router.push("/home");
  }
};
</script>

<template>
  <div class="page">
    <div class="page-inner">
      <header class="page-header">
        <RouterLink to="/" class="page-logo">ДроГА</RouterLink>
      </header>

      <h1 class="page-title">Вход</h1>

      <form class="page-form" @submit.prevent="submit">
        <label class="page-field">
          Email
          <input v-model="email" type="email" autocomplete="email" required />
        </label>
        <label class="page-field">
          Пароль
          <input v-model="password" type="password" autocomplete="current-password" required />
        </label>

        <p v-if="error" class="page-error" role="alert">{{ error.message }}</p>

        <div>
          <button class="page-button" :disabled="isPending">Войти</button>
        </div>

        <p class="page-muted">
          Нет аккаунта?
          <RouterLink to="/register" class="page-link">Зарегистрироваться</RouterLink>
        </p>
      </form>
    </div>
  </div>
</template>
