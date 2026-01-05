<template>
  <Loader v-if="productsLoading" />
  <div class="card" v-else>
    <div v-if="activeFilters.length > 0 && filteredProducts.length > 0" class="active-filters">
      <div class="filters-header">
        <span class="filters-title"
          >Активный фильтр: <Chip :label="activeFilters[0].label"
        /></span>
        <Button
          label="Сбросить"
          icon="pi pi-times"
          style="margin-top: 10px"
          size="small"
          severity="secondary"
          @click="resetAllFilters"
        />
      </div>
    </div>

    <DataView
      :value="filteredProducts"
      layout="grid"
      class="dataview"
      :paginator="filteredProducts.length > 0"
      :rows="rows"
    >
      <template #empty>
        <div class="empty-state">
          <i class="pi pi-inbox empty-icon"></i>
          <h3>Товары не найдены</h3>
          <p v-if="activeFilters.length > 0">
            Попробуйте изменить параметры фильтрации
          </p>
          <Button
            v-if="activeFilters.length > 0"
            label="Сбросить фильтры"
            icon="pi pi-filter-slash"
            @click="resetAllFilters"
            class="empty-button"
          />
        </div>
      </template>

      <template #grid="slotProps">
        <div class="item-grid">
          <ProductCard
            v-for="(product, index) in slotProps.items"
            :key="index"
            :product_data="product"
          />
        </div>
      </template>
    </DataView>
  </div>
</template>

<script setup>
import DataView from "primevue/dataview";
import Chip from "primevue/chip";
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import ProductCard from "../small_components/ProductCard.vue";
import Loader from "../small_components/Loader.vue";
import { BACKEND_API } from "../constants/API.constant";
import { headerStore } from "../store/store";

const products = ref([]);
const productsLoading = ref(false);
const rows = ref(40);

const filter = ref(null);
const searchQuery = ref("");
const selectedCatalog = ref(null);
const selectedCategory = ref(null);

const activeFilters = computed(() => {
  const filters = [];

  if (filter.value) {
    filters.push({
      type: "filter",
      label: filter.value.name,
      icon: "pi pi-tag",
    });
  }

  if (searchQuery.value) {
    filters.push({
      type: "search",
      label: `Поиск: "${searchQuery.value}"`,
      icon: "pi pi-search",
    });
  }

  if (selectedCatalog.value) {
    // Здесь нужно получить название каталога по его ID
    filters.push({
      type: "catalog",
      label: `Каталог: #${selectedCatalog.value}`,
      icon: "pi pi-folder",
    });
  }

  if (selectedCategory.value) {
    // Здесь нужно получить название категории по ее ID
    filters.push({
      type: "category",
      label: `Категория: #${selectedCategory.value}`,
      icon: "pi pi-bookmark",
    });
  }

  return filters;
});

// Загрузка продуктов с поддержкой множественных фильтров
const loadProducts = async (filters = {}) => {
  productsLoading.value = true;

  try {
    let url = `${BACKEND_API.PRODUCT.GET_ALL}?all=true`;
    const params = [];

    // Добавляем все активные фильтры в параметры запроса
    if (filters.filter) {
      params.push(`${filters.filter.filter}=${filters.filter.id}`);
    }

    if (filters.search) {
      params.push(`search=${encodeURIComponent(filters.search)}`);
    }

    if (filters.catalogId) {
      params.push(`catalog=${filters.catalogId}`);
    }

    if (filters.categoryId) {
      params.push(`category=${filters.categoryId}`);
    }

    if (params.length > 0) {
      url += `&${params.join("&")}`;
    }

    const response = await fetch(url);
    const result = await response.json();

    if (response.ok) {
      products.value = result.data;
      rows.value = result.count;

      if (Object.keys(filters).length > 0) {
        saveFiltersToLocalStorage(filters);
      }
    }
  } catch (error) {
    console.error("Ошибка загрузки продуктов:", error);
  } finally {
    productsLoading.value = false;
  }
};

const saveFiltersToLocalStorage = (filters) => {
  const savedFilters = {
    filter: filters.filter || null,
    search: filters.search || "",
    catalogId: filters.catalogId || null,
    categoryId: filters.categoryId || null,
    timestamp: new Date().getTime(),
  };
  localStorage.setItem("product_filter", JSON.stringify(savedFilters));
};

// Загрузка фильтров из localStorage
const loadFiltersFromLocalStorage = async () => {
  const savedFilters = localStorage.getItem("product_filter");
  if (savedFilters) {
    try {
      const filters = JSON.parse(savedFilters);
      const now = new Date().getTime();

      // Очищаем старые фильтры (старше 1 часа)
      if (now - filters.timestamp > 3600000) {
        localStorage.removeItem("product_filter");
        return;
      }

      // Применяем сохраненные фильтры
      if (filters.filter) {
        filter.value = filters.filter;
        headerStore.filter = filters.filter;
      }

      if (filters.search) {
        searchQuery.value = filters.search;
        headerStore.search = filters.search;
      }

      selectedCatalog.value = filters.catalogId;
      selectedCategory.value = filters.categoryId;

      // Загружаем продукты с сохраненными фильтрами
      await loadProducts(filters);
    } catch (error) {
      console.error("Ошибка загрузки фильтров из localStorage:", error);
    }
  } else {
    await loadProducts();
  }
};

const filteredProducts = computed(() => {
  return [...products.value];
});

const resetAllFilters = async () => {
  filter.value = null;
  searchQuery.value = "";
  selectedCatalog.value = null;
  selectedCategory.value = null;

  headerStore.filter = null;
  headerStore.search = "";

  localStorage.removeItem("product_filter");

  await loadProducts();
};

watch(
  () => headerStore.filter,
  async (value) => {
    filter.value = value;
    await loadProducts({
      filter: value,
      search: searchQuery.value,
      catalogId: selectedCatalog.value,
      categoryId: selectedCategory.value,
    });
  }
);

watch(
  () => headerStore.search,
  async (value) => {
    searchQuery.value = value;
    await loadProducts({
      filter: filter.value,
      search: value,
      catalogId: selectedCatalog.value,
      categoryId: selectedCategory.value,
    });
  }
);

// Адаптация количества строк
const updateRows = () => {
  rows.value = window.innerWidth <= 720 ? 14 : 30;
};

// Жизненный цикл
onMounted(async () => {
  updateRows();
  headerStore.hide = false;
  window.addEventListener("resize", updateRows);
  await loadFiltersFromLocalStorage();
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", updateRows);
});
</script>

<style scoped>
.card {
  width: 100%;
  min-height: 94vh;
  display: flex;
  flex-direction: column;
}

.dataview {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex: 1;
}

/* Стили для блока активных фильтров */
.active-filters {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  margin: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filters-title {
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filters-title::before {
  content: "🎯";
  font-size: 1.2rem;
}

.filters-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.filter-chip {
  background: rgba(255, 255, 255, 0.95) !important;
  color: #333 !important;
  border: 2px solid transparent;
  font-weight: 500;
  transition: all 0.2s ease;
  padding-left: 0.75rem !important;
}

.filter-chip:hover {
  transform: translateY(-2px);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
}

.filter-chip--filter {
  border-left: 4px solid #3b82f6;
}

.filter-chip--search {
  border-left: 4px solid #10b981;
}

.filter-chip--catalog {
  border-left: 4px solid #f59e0b;
}

.filter-chip--category {
  border-left: 4px solid #8b5cf6;
}

:deep(.p-chip) {
  border-radius: 5px;
  font-size: smaller;
  padding-block: 5px;
}

/* Стили для пустого состояния */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  color: #6b7280;
}

.empty-icon {
  font-size: 4rem;
  color: #d1d5db;
  margin-bottom: 1.5rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.empty-state p {
  font-size: 1rem;
  margin-bottom: 1.5rem;
  max-width: 300px;
}

.empty-button {
  margin-top: 1rem;
}

/* Стили для сетки товаров */
.item-grid {
  display: grid;
  gap: clamp(0.5rem, 2vw, 2rem);
  grid-template-columns: repeat(
    auto-fit,
    minmax(clamp(14rem, 22vw, 18rem), 1fr)
  );
  width: 100%;
  max-width: 1700px;
  margin: 0 auto;
  padding: clamp(0.2rem, 2vw, 2rem);
}

@media (max-width: 768px) {
  .active-filters {
    margin: 0.5rem;
    padding: 0.75rem 1rem;
  }

  .filters-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .filters-chips {
    width: 100%;
  }
}

@media (max-width: 350px) {
  .item-grid {
    grid-template-columns: repeat(1, minmax(0, 1fr)) !important;
    justify-items: center !important;
  }
}

@media (max-width: 720px) {
  .item-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.4rem;
  }
}
</style>
