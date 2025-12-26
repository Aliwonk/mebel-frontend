import { createApp } from "vue";
import { createPinia } from "pinia";
import PrimeVue from "primevue/config";
import router from "./router/router";
import App from "./App.vue";
import "./style.css";
import Aura from "@primeuix/themes/aura";
import { definePreset } from "@primeuix/themes";
import "primeicons/primeicons.css";

const pinia = createPinia();
const app = createApp(App);

// Определение серых цветов для темы Aura
const ZincAura = definePreset(Aura, {
  semantic: {
    primary: {
      50: "{zinc.50}",
      100: "{zinc.100}",
      200: "{zinc.200}",
      300: "{zinc.300}",
      400: "{zinc.400}",
      500: "{zinc.500}",
      600: "{zinc.600}",
      700: "{zinc.700}",
      800: "{zinc.800}",
      900: "{zinc.900}",
      950: "{zinc.950}",
    },
  },
});

// подключение primevue
app.use(PrimeVue, {
  theme: {
    preset: ZincAura,
    options: {
      prefix: "p", // Префиксы для css, пример: --p-primary-50
      darkModeSelector: false, // Темная тема ('system' - для определения системной темы)
      cssLayer: false, // Режим работы с слоями css
    },
  },
  ripple: true,
  // Переопределние локали для компонентов primevue
  locale: {
    accept: "Да",
    reject: "Нет",
    clear: "Очистить",
    apply: "Применить",

    startsWith: "Начинается с",
    contains: "Содержит",
    notContains: "Не содержит",
    endsWith: "Заканчивается на",
    equals: "Равно",
    notEquals: "Не равно",

    dateIs: "Дата равна",
    dateIsNot: "Дата не равна",
    dateBefore: "Дата раньше",
    dateAfter: "Дата позже",

    dayNames: [
      "Воскресенье",
      "Понедельник",
      "Вторник",
      "Среда",
      "Четверг",
      "Пятница",
      "Суббота",
    ],
    dayNamesShort: ["Вск", "Пнд", "Втр", "Ср", "Чтв", "Птн", "Суб"],
    dayNamesMin: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],

    monthNames: [
      "Январь",
      "Февраль",
      "Март",
      "Апрель",
      "Май",
      "Июнь",
      "Июль",
      "Август",
      "Сентябрь",
      "Октябрь",
      "Ноябрь",
      "Декабрь",
    ],
    monthNamesShort: [
      "Янв",
      "Фев",
      "Мар",
      "Апр",
      "Май",
      "Июн",
      "Июл",
      "Авг",
      "Сен",
      "Окт",
      "Ноя",
      "Дек",
    ],

    chooseYear: "Выбрать год",
    chooseMonth: "Выбрать месяц",
    chooseDate: "Выбрать дату",
    today: "Сегодня",
    weekHeader: "Нед",

    firstDayOfWeek: 1, // 0 — воскресенье, 1 — понедельник
    dateFormat: "dd.mm.yy", // формат даты

    weak: "Слабый",
    medium: "Средний",
    strong: "Сильный",
    passwordPrompt: "Введите пароль",
  },
});
app.use(pinia); // подключение pinia (менеджер состояния)
app.use(router); // подключение рутера

app.mount("#app");
