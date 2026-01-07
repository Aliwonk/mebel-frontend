<template>
  <Header v-if="!headerStore.hide" />
  <RouterView />
</template>

<script setup>
import { RouterView } from "vue-router";
import Header from "./components/Header.vue";
import { headerStore, telegramStore } from "./store/store";

if (window.Telegram && Telegram.WebApp) {
  Telegram.WebApp.ready();

  telegramStore.webApp = Telegram.WebApp;
} else {
  console.log("Running outside Telegram");
}
</script>
