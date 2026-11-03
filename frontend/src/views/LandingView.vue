<script setup lang="ts">
import LandingSketch from "@/components/LandingSketch.vue";
import { RouterLink } from "vue-router";
</script>

<template>
  <div class="page">
    <div class="page-inner">
      <header class="page-header">
        <RouterLink to="/" class="page-logo">ДроГА</RouterLink>
        <RouterLink to="/login" class="page-link">Войти</RouterLink>
      </header>

      <h1 class="page-title">Доска, на которой рисуют вместе</h1>
      <p class="lead">Создаёшь доску, отправляешь ссылку и рисуешь. Без регистрации.</p>
      <p class="start">
        <a href="/draw/new" class="page-button">Создать доску</a>
      </p>

      <LandingSketch />

      <h2 class="features-title">Что тут есть</h2>
      <ul class="features">
        <li>Карандаш, линии, прямоугольники, эллипсы, текст и картинки.</li>
        <li>Курсоры и черновики других участников видны прямо во время рисования.</li>
        <li>Выделение рамкой, перетаскивание, ресайз, отмена и повтор.</li>
        <li>Доска сохраняется: можно вернуться по той же ссылке.</li>
      </ul>

      <footer class="page-muted">
        Открытый код на
        <a href="https://github.com/Capybara77/drawga" class="page-link">GitHub</a>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.lead {
  font-size: 1.125rem;
  margin-bottom: 20px;
}

.start {
  margin-bottom: 32px;
}

.features-title {
  font-size: 1.375rem;
  font-weight: 600;
  margin: 32px 0 8px;
}

.features {
  list-style: disc;
  padding-left: 20px;
  margin-bottom: 32px;
}

.features li {
  margin-bottom: 4px;
}
</style>
