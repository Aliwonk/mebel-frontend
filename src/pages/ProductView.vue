<template>
  <header class="header">
    <div class="header-left">
      <Button
        icon="pi pi-angle-double-left"
        size="medium"
        raised
        @click="
          () => {
            headerStore.hide = false;
            router.push({ name: 'Home' });
          }
        "
      />
    </div>
  </header>
  <main class="item-all">
    <!-- Скелетон при загрузке -->
    <div v-if="loading" class="skeleton-container">
      <Card class="card skeleton-card" style="padding: 10px">
        <!-- Скелетон для галереи -->
        <template #header>
          <div class="gallery-skeleton">
            <!-- Основное изображение -->
            <Skeleton width="100%" height="400px" style="border-radius: 8px" />

            <!-- Индикаторы загрузки -->
            <!-- <div class="indicators-skeleton">
              <div v-for="i in 4" :key="i" class="indicator-skeleton">
                <Skeleton width="10px" height="10px" shape="circle" />
              </div>
            </div> -->

            <!-- Кнопки навигации -->
            <!-- <div class="navigation-skeleton">
              <Skeleton
                width="40px"
                height="40px"
                shape="circle"
                style="margin-right: 10px"
              />
              <Skeleton width="40px" height="40px" shape="circle" />
            </div> -->
          </div>
        </template>

        <!-- Скелетон для заголовка -->
        <template #title>
          <div class="title-skeleton">
            <Skeleton width="70%" height="2rem" style="margin-bottom: 1rem" />
            <div class="tags-skeleton">
              <Skeleton
                width="100px"
                height="1.8rem"
                style="border-radius: 12px; margin-right: 10px"
              />
              <Skeleton
                width="120px"
                height="1.8rem"
                style="border-radius: 12px"
              />
            </div>
          </div>
        </template>

        <!-- Скелетон для контента -->
        <template #content>
          <div class="content-skeleton">
            <div class="section-skeleton" style="margin-bottom: 2rem">
              <Skeleton
                width="120px"
                height="1.5rem"
                style="margin-bottom: 1rem"
              />
              <Skeleton
                width="100%"
                height="1rem"
                style="margin-bottom: 0.8rem"
              />
              <Skeleton
                width="100%"
                height="1rem"
                style="margin-bottom: 0.8rem"
              />
              <Skeleton
                width="90%"
                height="1rem"
                style="margin-bottom: 0.8rem"
              />
              <Skeleton width="80%" height="1rem" />
            </div>
            <div class="section-skeleton">
              <Skeleton
                width="150px"
                height="1.5rem"
                style="margin-bottom: 1rem"
              />
              <Skeleton
                width="100%"
                height="1rem"
                style="margin-bottom: 0.8rem"
              />
              <Skeleton
                width="100%"
                height="1rem"
                style="margin-bottom: 0.8rem"
              />
              <Skeleton
                width="95%"
                height="1rem"
                style="margin-bottom: 0.8rem"
              />
              <Skeleton width="85%" height="1rem" />
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Основной контент после загрузки -->
    <Card v-else class="card" style="padding: 10px">
      <template #header>
        <!-- Галерея с навигацией поверх изображения -->
        <div v-if="product_images.length > 0" class="gallery-container">
          <Galleria
            :value="product_images"
            :numVisible="1"
            :showThumbnails="false"
            :showIndicators="true"
            :showItemNavigators="product_images.length > 1"
            :changeItemOnIndicatorHover="true"
            :circular="true"
            :autoPlay="true"
            :transitionInterval="3000"
            containerStyle="width: 100%; max-width: 640px; margin: 0 auto; position: relative;"
            :pt="{
              root: { class: 'custom-galleria' },
              indicators: { class: 'custom-indicators' },
              indicatorButton: { class: 'custom-indicator-button' },
              itemWrapper: { class: 'custom-item-wrapper' },
              item: { class: 'custom-item' },
            }"
          >
            <template #item="slotProps">
              <div class="image-container">
                <img
                  :src="slotProps.item.url"
                  :alt="slotProps.item.alt"
                  class="galleria-image"
                />

                <!-- Номер изображения -->
                <!-- <div class="image-counter">
                  {{ activeIndex + 1 }} / {{ product_images.length }}
                </div> -->
              </div>
            </template>

            <!-- Кастомные стрелки -->
            <template #previousitemicon>
              <div class="custom-nav-button prev">
                <i class="pi pi-chevron-left"></i>
              </div>
            </template>
            <template #nextitemicon>
              <div class="custom-nav-button next">
                <i class="pi pi-chevron-right"></i>
              </div>
            </template>

            <!-- Кастомные индикаторы -->
            <template #indicator="slotProps">
              <div
                :class="[
                  'custom-dot',
                  { 'custom-dot-active': slotProps.index === activeIndex },
                ]"
                @click="changeImage(slotProps.index)"
              ></div>
            </template>
          </Galleria>
        </div>

        <!-- Если нет изображений -->
        <div v-else class="no-image">
          <i class="pi pi-image" style="font-size: 5rem; color: #ccc"></i>
          <p>Нет изображений</p>
        </div>
      </template>
      <template #title>{{ product_data.name }}</template>
      <template #subtitle="slotProps">
        <Tag
          v-if="
            product_data.categories &&
            product_data.categories[0].catalogs &&
            product_data.categories[0].catalogs.length > 0
          "
          severity="secondary"
          style="margin-right: 5px; margin-bottom: 5px"
          :value="product_data.categories[0].catalogs[0].name"
        />
        <Tag
          v-if="product_data.categories && product_data.categories.length > 0"
          severity="secondary"
          style="margin-right: 5px; margin-bottom: 5px"
          :value="product_data.categories[0].name"
        />
        <Tag
          v-if="
            product_data.manufacturers && product_data.manufacturers.length > 0
          "
          severity="secondary"
          :value="product_data.manufacturers[0].name"
        />
      </template>
      <template #content>
        <div class="content-items">
          <div class="content-item">
            <h5 class="item-caption">Цена</h5>
            <div class="item-body">
              <p style="font-weight: 600">
                {{
                  product_data.price
                    ? product_data.price + " руб"
                    : `Отсутствует`
                }}
              </p>
            </div>
          </div>
          <div class="content-item">
            <h5 class="item-caption">Описание</h5>
            <div class="item-body">
              <p>
                {{
                  product_data.description
                    ? product_data.description
                    : `Отсутствует`
                }}
              </p>
            </div>
          </div>
          <div class="content-item">
            <h5 class="item-caption">Характеристики</h5>
            <div class="item-body">
              <div class="spec-item">
                <span class="spec-name">Ширина:</span>
                <span class="spec-value"
                  >{{ product_data.dimensions[0].width }} мм</span
                >
              </div>

              <div class="spec-item">
                <span class="spec-name">Высота:</span>
                <span class="spec-value"
                  >{{ product_data.dimensions[0].height }} мм</span
                >
              </div>
              <div class="spec-item">
                <span class="spec-name">Длина:</span>
                <span class="spec-value"
                  >{{ product_data.dimensions[0].length }} мм</span
                >
              </div>
              <div class="spec-item">
                <span class="spec-name">Глубина:</span>
                <span class="spec-value"
                  >{{ product_data.dimensions[0].depth }} мм</span
                >
              </div>
              <div class="spec-item">
                <span class="spec-name">Вес:</span>
                <span class="spec-value"
                  >{{ product_data.dimensions[0].weight }} кг</span
                >
              </div>
            </div>
          </div>
        </div>
      </template>
    </Card>
  </main>
</template>

<script setup>
import { watch, ref, onMounted, onUnmounted, computed } from "vue";
import Galleria from "primevue/galleria";
import Skeleton from "primevue/skeleton";
import { useRoute, useRouter } from "vue-router";
import { headerStore } from "../store/store";
import Button from "primevue/button";
import Card from "primevue/card";
import Tag from "primevue/tag";
import { BACKEND_API } from "../constants/API.constant";

const route = useRoute();
const router = useRouter();
const product_data = ref({});
const product_images = ref([]);
const loading = ref(true);
const activeIndex = ref(0);

const changeImage = (index) => {
  console.log(index);
  activeIndex.value = index;
};

const loadProduct = async (id) => {
  loading.value = true;
  try {
    // Имитация задержки загрузки
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const response = await fetch(`${BACKEND_API.PRODUCT.GET_ONE}/${id}`);
    const result = await response.json();

    if (response.ok) {
      product_data.value = result.data;
      product_images.value =
        result.data.images && result.data.images.length > 0
          ? result.data.images
          : [];
      document.title = result.data.name;
    }
  } catch (error) {
    console.error("Ошибка загрузки товара:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  headerStore.hide = true;
  await loadProduct(route.params.id);
});
</script>

<style scoped>
.header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 60px;
  z-index: 1000;
  position: absolute;
  padding-top: 7px;
  padding-left: 15px;
  padding-right: 15px;
  background-color: transparent;
}

.header-left {
  display: flex;
  flex-direction: row;
  width: 85%;
  height: 75%;
}

.item-all {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: fit-content;
}

/* Стили для галереи */
.gallery-container {
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
  position: relative;
}

.image-container {
  position: relative;
  width: 100%;
  height: 400px;
  overflow: hidden;
  border-radius: 8px;
  background-color: #f5f5f5;
}

.galleria-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.image-counter {
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

/* Кастомные стили для Galleria */
:deep(.custom-galleria) {
  position: relative;
}

:deep(.custom-item-wrapper) {
  position: relative;
}

:deep(.custom-indicators) {
  position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 8px;
  z-index: 10;
}

.custom-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
}

.custom-dot:hover {
  background-color: rgba(255, 255, 255, 0.8);
  transform: scale(1.2);
}

.custom-dot-active {
  background-color: white;
  transform: scale(1.2);
}

.custom-nav-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.custom-nav-button:hover {
  background: white;
  transform: translateY(-50%) scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.custom-nav-button.prev {
  left: 15px;
}

.custom-nav-button.next {
  right: 15px;
}

.custom-nav-button i {
  font-size: 1.2rem;
  color: #333;
}

:deep(.p-galleria-item-nav) {
  background: transparent !important;
}

:deep(.p-galleria-item-prev, .p-galleria-item-next) {
  color: transparent !important;
  width: 40px !important;
  height: 40px !important;
}

:deep(.p-galleria-indicator-list) {
  display: none;
}

/* Скрыть стандартные навигационные кнопки */
:deep(.p-galleria-item-prev-icon, .p-galleria-item-next-icon) {
  display: none !important;
}

.no-image {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  background-color: #f9f9f9;
  border-radius: 12px;
  color: #999;
}

.content-items {
  display: grid;
  grid-row-gap: 25px;
  margin-top: 20px;
}

.item-caption {
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 12px;
  color: #333;
}

.item-body {
  line-height: 1.6;
  color: #555;
}

.spec-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.spec-item:last-child {
  border-bottom: none;
}

.spec-name {
  font-weight: 500;
  color: #666;
}

.spec-value {
  color: #333;
  font-weight: 400;
}

/* Стили для скелетона */
.skeleton-container {
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
}

.skeleton-card {
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
}

.gallery-skeleton {
  position: relative;
  margin-bottom: 1.5rem;
}

.indicators-skeleton {
  position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 8px;
}

.indicator-skeleton {
  width: 10px;
  height: 10px;
}

.navigation-skeleton {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  padding: 0 20px;
  transform: translateY(-50%);
}

.title-skeleton {
  margin-bottom: 2rem;
}

.tags-skeleton {
  display: flex;
  align-items: center;
  margin-top: 1rem;
}

.content-skeleton {
  margin-top: 1.5rem;
}

.section-skeleton {
  margin-bottom: 2.5rem;
}

/* Анимация для скелетона */
:deep(.p-skeleton) {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Адаптивность */
@media (max-width: 768px) {
  .image-container {
    height: 300px;
  }

  .image-counter {
    top: 10px;
    right: 10px;
    padding: 4px 10px;
    font-size: 0.8rem;
  }

  .custom-nav-button {
    width: 36px;
    height: 36px;
  }

  .custom-nav-button.prev {
    left: 10px;
  }

  .custom-nav-button.next {
    right: 10px;
  }

  .custom-nav-button i {
    font-size: 1rem;
  }

  .custom-dot {
    width: 6px;
    height: 6px;
  }

  .gallery-skeleton :deep(.p-skeleton) {
    height: 300px !important;
  }

  .content-items {
    grid-row-gap: 20px;
  }
}

@media (max-width: 480px) {
  .image-container {
    height: 400px;
  }

  .image-counter {
    top: 8px;
    right: 8px;
    padding: 3px 8px;
    font-size: 0.75rem;
  }

  .custom-nav-button {
    width: 32px;
    height: 32px;
  }

  .custom-nav-button.prev {
    left: 8px;
  }

  .custom-nav-button.next {
    right: 8px;
  }

  .gallery-skeleton :deep(.p-skeleton) {
    height: 250px !important;
  }

  .tags-skeleton :deep(.p-skeleton) {
    width: 80px !important;
    margin-right: 8px !important;
  }

  .tags-skeleton :deep(.p-skeleton):last-child {
    width: 100px !important;
  }
}

/* Гарантия одинаковых размеров для карточки и скелетона */
.card {
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  overflow: hidden;
}

.skeleton-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  overflow: hidden;
}
</style>
