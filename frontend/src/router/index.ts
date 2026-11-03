import {
  createRouter,
  createWebHistory,
  type RouteLocationNormalized,
  type RouteRecordRaw,
} from "vue-router";
import { useAuthStore } from "@/stores/auth";

declare module "vue-router" {
  interface RouteMeta {
    // только для вошедших
    auth?: boolean;
    // только для гостей: вошедшему тут делать нечего
    guest?: boolean;
  }
}

// на доску и с неё ходим обычными ссылками, а не через роутер: сервер сам заводит доску на
// /draw/new, а сокет и хоткеи холста живут ровно одну загрузку страницы
export const routes: RouteRecordRaw[] = [
  { path: "/", component: () => import("@/views/LandingView.vue"), meta: { guest: true } },
  { path: "/login", component: () => import("@/views/LoginView.vue"), meta: { guest: true } },
  { path: "/register", component: () => import("@/views/RegisterView.vue"), meta: { guest: true } },
  { path: "/home", component: () => import("@/views/HomeView.vue"), meta: { auth: true } },
  { path: "/draw", component: () => import("@/views/BoardView.vue") },
  { path: "/:pathMatch(.*)*", redirect: "/" },
];

export const guard = async (to: RouteLocationNormalized) => {
  if (!to.meta.auth && !to.meta.guest) {
    return true;
  }

  const auth = useAuthStore();

  await auth.loadMe();

  if (to.meta.auth && !auth.user) {
    return "/login";
  }

  if (to.meta.guest && auth.user) {
    return "/home";
  }

  return true;
};

export const router = createRouter({ history: createWebHistory(), routes });

router.beforeEach(guard);
