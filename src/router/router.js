import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/pages/HomeView.vue";
import ProductView from "../pages/ProductView.vue";

// Привязка компонентов к страницам
const routes = [
  {
    path: "/",
    name: "Home",
    meta: {
      title: "Главная",
    },
    component: HomeView,
  },
  {
    path: "/product/:id",
    name: "ProductPage",
    component: ProductView,
  },
];

// создание рутера
const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Изменение названия страницы
router.afterEach((to) => {
  document.title = to.meta.title || "Не найдено";
});

export default router;
