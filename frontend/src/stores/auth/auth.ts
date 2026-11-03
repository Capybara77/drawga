import { defineStore } from "pinia";

export type User = { name: string; email: string };
export type AuthError = { field?: "name" | "email" | "password" | null; message: string };

type State = {
  user: User | null;
  loaded: boolean;
};

const UNAVAILABLE: AuthError = { message: "Сервер недоступен" };

const post = (url: string, body?: object) =>
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });

export const useAuthStore = defineStore("auth", {
  state: (): State => ({
    user: null,
    loaded: false,
  }),
  actions: {
    async loadMe() {
      if (this.loaded) {
        return;
      }

      try {
        // гостю сервер отвечает 204 без тела: json() бросит, и пользователь останется null
        const response = await fetch("/api/me");

        this.user = response.ok ? await response.json() : null;
      } catch {
        this.user = null;
      }

      this.loaded = true;
    },
    // null — всё хорошо, иначе ошибка для формы
    async submit(url: string, body: object): Promise<AuthError | null> {
      try {
        const response = await post(url, body);
        const data = await response.json();

        if (!response.ok) {
          return data;
        }

        this.user = data;
        this.loaded = true;

        return null;
      } catch {
        return UNAVAILABLE;
      }
    },
    login(email: string, password: string) {
      return this.submit("/api/login", { email, password });
    },
    register(name: string, email: string, password: string) {
      return this.submit("/api/register", { name, email, password });
    },
    async logout() {
      await post("/api/logout");
      this.user = null;
    },
  },
});
