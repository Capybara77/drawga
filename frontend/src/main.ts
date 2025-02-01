import { createApp } from 'vue';
import App from './App.vue';
import './assets/newStyle.css';
import './assets/toastify.css';
import { createPinia } from 'pinia';

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
app.mount('#wrapper');
