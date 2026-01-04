<template>
  <div>Магазин</div>
</template>

<script setup>
import { onMounted } from "vue";
import { headerStore } from "../store/store";

onMounted(() => {
  headerStore.hide = true;
});
</script>
