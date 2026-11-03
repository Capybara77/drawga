<script setup lang="ts">
import { useAuthStore, type AuthError } from "@/stores/auth";
import { ref } from "vue";
import { RouterLink, useRouter } from "vue-router";

const auth = useAuthStore();
const router = useRouter();

const name = ref("");
const email = ref("");
const password = ref("");
const error = ref<AuthError | null>(null);
const isPending = ref(false);

const submit = async () => {
  isPending.value = true;
  error.value = await auth.register(name.value, email.value, password.value);
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

      <h1 class="page-title">Регистрация</h1>

      <form class="page-form" @submit.prevent="submit">
        <label class="page-field">
          Имя
          <input
            v-model="name"
            autocomplete="name"
            required
            :aria-invalid="error?.field === 'name'"
          />
          <span v-if="error?.field === 'name'" class="page-error">{{ error.message }}</span>
        </label>
        <label class="page-field">
          Email
          <input
            v-model="email"
            type="email"
            autocomplete="email"
            required
            :aria-invalid="error?.field === 'email'"
          />
          <span v-if="error?.field === 'email'" class="page-error">{{ error.message }}</span>
        </label>
        <label class="page-field">
          Пароль
          <input
            v-model="password"
            type="password"
            autocomplete="new-password"
            required
            minlength="8"
            :aria-invalid="error?.field === 'password'"
          />
          <span v-if="error?.field === 'password'" class="page-error">{{ error.message }}</span>
          <span v-else class="page-muted">Минимум 8 символов</span>
        </label>

        <p v-if="error && !error.field" class="page-error" role="alert">{{ error.message }}</p>

        <div>
          <button class="page-button" :disabled="isPending">Зарегистрироваться</button>
        </div>

        <p class="page-muted">
          Уже есть аккаунт?
          <RouterLink to="/login" class="page-link">Войти</RouterLink>
        </p>
      </form>
    </div>
  </div>
</template>
