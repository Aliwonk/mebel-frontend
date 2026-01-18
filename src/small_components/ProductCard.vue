<template>
  <RouterLink
    :to="{ name: 'ProductPage', params: { id: product_data.id } }"
    class="item-link"
  >
    <Card class="item-card">
      <template #header>
        <div class="card-img">
          <Image
            :src="
              product_data.images.length > 0 ? product_data.images[0].url : ''
            "
            alt="Рисунок товара"
          />
        </div>
      </template>

      <template #title>{{ product_data.name }}</template>

      <template #subtitle>
        <div class="tags-row">
          <Tag
            v-if="product_data.categories[0].catalogs.length > 0"
            severity="secondary"
            style="margin-right: 5px; margin-bottom: 5px"
            :value="product_data.categories[0].catalogs[0].name"
          />
          <Tag
            v-if="product_data.categories.length > 0"
            severity="secondary"
            :value="product_data.categories[0].name"
          />
          <Tag
            v-if="
              product_data.manufacturers.length > 0 &&
              product_data.manufacturers[0].name !== 'Неизвестно'
            "
            severity="secondary"
            :value="product_data.manufacturers[0].name"
          />
        </div>
      </template>

      <template #content>
        <div class="price-row">
          <div class="price">
            <h3>{{ product_data.price }} руб</h3>
          </div>

          <Button
            label="Посмотреть"
            variant="outlined"
            severity="info"
            class="card-button"
            style="border-color: #7d5440; color: #7d5440"
            icon="pi pi-eye"
            @click="
              router.push({
                name: 'ProductPage',
                params: { id: product_data.id },
              })
            "
          />
        </div>
      </template>
    </Card>
  </RouterLink>
</template>

<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";

const props = defineProps({
  product_data: {
    type: Object,
    required: true,
  },
});
const router = useRouter();
</script>

<style scoped>
.item-link {
  text-decoration: none;
  max-height: 24rem;
  max-width: 18rem;
}

.item-card {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  cursor: pointer;
}

.tags-row {
  display: flex;
  flex-flow: row wrap;
  gap: 0.5rem;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

:deep(.card-img) {
  width: 100%;
  aspect-ratio: 4 / 3;
}

:deep(.card-img img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

:deep(.p-card-body) {
  padding: clamp(0.75rem, 1vw, 1.1rem);
}

:deep(.p-card-title) {
  font-size: clamp(0.9rem, 1vw, 1rem);
  overflow-wrap: break-word;
}

:deep(.p-tag) {
  font-size: clamp(0.6rem, 0.7vw, 0.8rem);
}

.price h3 {
  font-size: clamp(0.85rem, 0.9vw, 1.15rem);
}

.price h4 {
  font-size: clamp(0.65rem, 0.8vw, 0.9rem);
  color: var(--p-primary-500);
  text-decoration: line-through;
}

.card-button {
  font-size: clamp(0.8rem, 0.8vw, 0.9rem);
}

@media (max-width: 720px) {
  .card-button {
    width: 100%;
    padding: 0.35rem 0.6rem;
  }
}
</style>
