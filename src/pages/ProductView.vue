<template>
  <header class="header">
    <div class="header-left">
      <Button
        icon="pi pi-angle-double-left"
        size="medium"
        raised
        @click="goBack"
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
            <Skeleton width="100%" height="400px" style="border-radius: 8px" />
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
        <!-- Оптимизированная галерея -->
        <div v-if="product_images.length > 0" class="gallery-container">
          <!-- Основное изображение -->
          <div class="main-image-container">
            <div class="image-wrapper">
              <img
                v-if="loadedImages.has(currentIndex)"
                :src="product_images[currentIndex].url"
                :alt="`${product_data.name} - вид ${currentIndex + 1}`"
                class="main-image"
                @load="onMainImageLoad"
              />
              <div v-else class="image-loader">
                <i class="pi pi-spinner pi-spin" style="font-size: 2rem"></i>
              </div>
            </div>

            <!-- Навигационные кнопки -->
            <button
              v-if="product_images.length > 1"
              class="nav-button prev"
              @click="prevImage"
              :disabled="!loadedImages.has(prevIndex)"
            >
              <i class="pi pi-chevron-left"></i>
            </button>
            <button
              v-if="product_images.length > 1"
              class="nav-button next"
              @click="nextImage"
              :disabled="!loadedImages.has(nextIndex)"
            >
              <i class="pi pi-chevron-right"></i>
            </button>

            <!-- Индикатор -->
            <div v-if="product_images.length > 1" class="image-indicator">
              {{ currentIndex + 1 }} / {{ product_images.length }}
            </div>
          </div>

          <!-- Миниатюры -->
          <div v-if="product_images.length > 1" class="thumbnails-container">
            <div
              v-for="(img, index) in product_images"
              :key="img.id"
              :class="['thumbnail-wrapper', { active: index === currentIndex }]"
              @click="changeImage(index)"
            >
              <div class="thumbnail-loader" v-if="!loadedImages.has(index)">
                <div class="skeleton-thumbnail"></div>
              </div>
              <img
                v-else
                :src="img.url"
                :alt="`Миниатюра ${index + 1}`"
                class="thumbnail"
                loading="lazy"
              />
            </div>
          </div>
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
          v-if="product_data.categories?.[0]?.catalogs?.[0]"
          severity="secondary"
          style="margin-right: 5px; margin-bottom: 5px"
          :value="product_data.categories[0].catalogs[0].name"
        />
        <Tag
          v-if="product_data.categories?.[0]"
          severity="secondary"
          style="margin-right: 5px; margin-bottom: 5px"
          :value="product_data.categories[0].name"
        />
        <Tag
          v-if="
            product_data.manufacturers?.[0] &&
            product_data.manufacturers[0].name !== 'Неизвестно'
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
                    ? `${product_data.price} руб`
                    : "Отсутствует"
                }}
              </p>
            </div>
          </div>
          <div class="content-item">
            <h5 class="item-caption">Описание</h5>
            <div class="item-body">
              <p>{{ product_data.description || "Отсутствует" }}</p>
            </div>
          </div>
          <div class="content-item">
            <h5 class="item-caption">Характеристики</h5>
            <div class="item-body" v-if="product_data.dimensions?.[0]">
              <div class="spec-item" v-if="product_data.dimensions[0].width > 0">
                <span class="spec-name">Ширина:</span>
                <span class="spec-value"
                  >{{ product_data.dimensions[0].width }} мм</span
                >
              </div>
              <div class="spec-item" v-if="product_data.dimensions[0].height > 0">
                <span class="spec-name">Высота:</span>
                <span class="spec-value"
                  >{{ product_data.dimensions[0].height }} мм</span
                >
              </div>
              <div class="spec-item" v-if="product_data.dimensions[0].length > 0">
                <span class="spec-name">Длина:</span>
                <span class="spec-value"
                  >{{ product_data.dimensions[0].length }} мм</span
                >
              </div>
              <div class="spec-item" v-if="product_data.dimensions[0].depth > 0">
                <span class="spec-name">Глубина:</span>
                <span class="spec-value"
                  >{{ product_data.dimensions[0].depth }} мм</span
                >
              </div>
              <div class="spec-item" v-if="product_data.dimensions[0].weight > 0">
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
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { headerStore } from "../store/store";
import Button from "primevue/button";
import Card from "primevue/card";
import Tag from "primevue/tag";
import Skeleton from "primevue/skeleton";
import { BACKEND_API } from "../constants/API.constant";

const route = useRoute();
const router = useRouter();

// Реактивные данные
const product_data = ref({});
const product_images = ref([]);
const loading = ref(true);
const currentIndex = ref(0);
const loadedImages = ref(new Set());
const imageCache = new Map(); // Кэш для загруженных изображений

// Вычисляемые свойства
const prevIndex = computed(() =>
  currentIndex.value > 0
    ? currentIndex.value - 1
    : product_images.value.length - 1,
);
const nextIndex = computed(() =>
  currentIndex.value < product_images.value.length - 1
    ? currentIndex.value + 1
    : 0,
);

// Методы
const goBack = () => {
  headerStore.hide = false;
  router.push({ name: "Home" });
};

const loadImage = (index) => {
  if (index < 0 || index >= product_images.value.length) return;

  const imgUrl = product_images.value[index].url;

  // Если изображение уже в кэше
  if (imageCache.has(imgUrl)) {
    loadedImages.value.add(index);
    return;
  }

  // Загружаем изображение
  const img = new Image();
  img.onload = () => {
    imageCache.set(imgUrl, img);
    loadedImages.value.add(index);
  };
  img.onerror = () => {
    console.error(`Failed to load image: ${imgUrl}`);
  };
  img.src = imgUrl;
};

const preloadNeighbors = () => {
  const indices = [prevIndex.value, currentIndex.value, nextIndex.value];
  indices.forEach(loadImage);
};

const changeImage = (index) => {
  if (index === currentIndex.value || !loadedImages.value.has(index)) return;
  currentIndex.value = index;
  preloadNeighbors();
};

const prevImage = () => {
  if (loadedImages.value.has(prevIndex.value)) {
    currentIndex.value = prevIndex.value;
    preloadNeighbors();
  }
};

const nextImage = () => {
  if (loadedImages.value.has(nextIndex.value)) {
    currentIndex.value = nextIndex.value;
    preloadNeighbors();
  }
};

const onMainImageLoad = () => {
  // Можно добавить логику после загрузки основного изображения
};

const loadProduct = async (id) => {
  loading.value = true;
  loadedImages.value.clear();
  imageCache.clear();

  try {
    // Убираем искусственную задержку для реальной работы
    const response = await fetch(`${BACKEND_API.PRODUCT.GET_ONE}/${id}`);
    const result = await response.json();

    if (response.ok) {
      product_data.value = result.data;
      product_images.value =
        result.data.images?.length > 0 ? result.data.images : [];
      document.title = result.data.name;

      // Предзагрузка первого изображения и его соседей
      if (product_images.value.length > 0) {
        loadImage(0);
        if (product_images.value.length > 1) {
          loadImage(1);
          loadImage(product_images.value.length - 1);
        }
      }
    }
  } catch (error) {
    console.error("Ошибка загрузки товара:", error);
  } finally {
    loading.value = false;
  }
};

// Клавиатурная навигация
const handleKeyDown = (e) => {
  if (product_images.value.length <= 1) return;

  switch (e.key) {
    case "ArrowLeft":
      e.preventDefault();
      prevImage();
      break;
    case "ArrowRight":
      e.preventDefault();
      nextImage();
      break;
  }
};

// Автоматическое переключение (опционально)
let autoPlayInterval = null;
const startAutoPlay = () => {
  if (product_images.value.length <= 1) return;
  autoPlayInterval = setInterval(() => {
    nextImage();
  }, 5000);
};

const stopAutoPlay = () => {
  if (autoPlayInterval) {
    clearInterval(autoPlayInterval);
    autoPlayInterval = null;
  }
};

// Хуки жизненного цикла
onMounted(async () => {
  headerStore.hide = true;
  await loadProduct(route.params.id);
  document.addEventListener("keydown", handleKeyDown);
  startAutoPlay();
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeyDown);
  stopAutoPlay();
  headerStore.hide = false;
});

// Отслеживание изменений роута
watch(
  () => route.params.id,
  async (newId) => {
    if (newId) {
      await loadProduct(newId);
    }
  },
);
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
  min-height: 100vh;
}

/* Стили для галереи */
.gallery-container {
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
}

.main-image-container {
  position: relative;
  width: 100%;
  height: 400px;
  overflow: hidden;
  border-radius: 12px;
  background-color: #f8f9fa;
  margin-bottom: 16px;
}

.image-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.main-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: opacity 0.3s ease;
}

.image-loader {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #6c757d;
}

.nav-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 10;
}

.nav-button:hover:not(:disabled) {
  background: white;
  transform: translateY(-50%) scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.nav-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.nav-button.prev {
  left: 16px;
}

.nav-button.next {
  right: 16px;
}

.nav-button i {
  font-size: 1.2rem;
  color: #333;
}

.image-indicator {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

/* Миниатюры */
.thumbnails-container {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 8px 0;
  justify-content: center;
  scrollbar-width: thin;
  scrollbar-color: #ccc transparent;
}

.thumbnails-container::-webkit-scrollbar {
  height: 6px;
}

.thumbnails-container::-webkit-scrollbar-track {
  background: transparent;
}

.thumbnails-container::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.thumbnail-wrapper {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  position: relative;
}

.thumbnail-wrapper:hover {
  border-color: #007bff;
  transform: translateY(-2px);
}

.thumbnail-wrapper.active {
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.thumbnail-loader {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
}

.skeleton-thumbnail {
  width: 60px;
  height: 60px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
}

.thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  background-color: #f8f9fa;
  border-radius: 12px;
  color: #6c757d;
  gap: 16px;
}

.no-image i {
  font-size: 4rem;
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
  color: #212529;
}

.item-body {
  line-height: 1.6;
  color: #495057;
}

.spec-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #e9ecef;
}

.spec-item:last-child {
  border-bottom: none;
}

.spec-name {
  font-weight: 500;
  color: #6c757d;
}

.spec-value {
  color: #212529;
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

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Карточка */
.card {
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e9ecef;
}

/* Адаптивность */
@media (max-width: 768px) {
  .main-image-container {
    height: 350px;
  }

  .nav-button {
    width: 36px;
    height: 36px;
  }

  .nav-button.prev {
    left: 12px;
  }

  .nav-button.next {
    right: 12px;
  }

  .thumbnail-wrapper {
    width: 70px;
    height: 70px;
  }

  .image-indicator {
    font-size: 0.85rem;
    padding: 5px 10px;
    bottom: 12px;
  }
}

@media (max-width: 480px) {
  .main-image-container {
    height: 300px;
  }

  .nav-button {
    width: 32px;
    height: 32px;
  }

  .nav-button i {
    font-size: 1rem;
  }

  .thumbnail-wrapper {
    width: 60px;
    height: 60px;
  }

  .content-items {
    grid-row-gap: 20px;
  }

  .item-caption {
    font-size: 1rem;
  }
}

/* Плавные переходы */
.main-image {
  will-change: opacity;
}

.thumbnail-wrapper {
  will-change: transform, border-color;
}
</style>
