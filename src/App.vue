<template>
  <Header v-if="!headerStore.hide" />
  <RouterView />
</template>

<script setup>
import { RouterView } from "vue-router";
import Header from "./components/Header.vue";
import { headerStore } from "./store/store";
</script>
