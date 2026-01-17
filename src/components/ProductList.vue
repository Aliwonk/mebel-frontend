<template>
  <div v-if="productsLoading" class="card">
    <Loader />
  </div>
  <div class="card" v-else>
    <DataView
      :value="paginatedProducts.data"
      layout="grid"
      class="dataview"
      :paginator="paginatedProducts.totalPages > 1"
      :rows="rowsPerPage"
      :first="firstRecordIndex"
      :totalRecords="paginatedProducts.count"
      @page="onPageChange"
      :lazy="true"
    >
      <template #header v-if="activeFilters.length > 0">
        <div class="pagination-info">
          <span>Фильтры: {{ activeFilters[0].label }} </span>
          <Button
            label="Сбросить все фильтры"
            icon="pi pi-times"
            size="small"
            style="
              margin-right: 10px;
              border-color: rgb(125, 84, 64);
              color: rgb(125, 84, 64);
            "
            severity="secondary"
            @click="resetAllFilters"
          />
        </div>
      </template>

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

      <template #grid>
        <div class="item-grid">
          <ProductCard
            v-for="(product, index) in paginatedProducts.data"
            :key="product.id || index"
            :product_data="product"
          />
        </div>
      </template>

      <template #paginatorstart v-if="paginatedProducts.data.length > 0">
        <span class="pagination-text">
          Страница {{ currentPage }} из {{ paginatedProducts.totalPages }}
        </span>
      </template>
    </DataView>
  </div>
</template>

<script setup>
import DataView from "primevue/dataview";
import Chip from "primevue/chip";
import Dropdown from "primevue/dropdown";
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import ProductCard from "../small_components/ProductCard.vue";
import Loader from "../small_components/Loader.vue";
import { BACKEND_API } from "../constants/API.constant";
import { headerStore } from "../store/store";

// Основные переменные состояния
const paginatedProducts = ref({
  data: [],
  count: 0,
  page: 1,
  totalPages: 1,
});
const productsLoading = ref(false);

// Пагинация
const rowsPerPage = ref(3); // Значение по умолчанию. Количество элементов на страницу
const currentPage = ref(1);
const firstRecordIndex = ref(0);

// Фильтры
const filter = ref(null);
const searchQuery = ref("");
const selectedCatalog = ref(null);
const selectedCategory = ref(null);

// Вычисляемые свойства
const activeFilters = computed(() => {
  const filters = [];

  if (filter.value) {
    filters.push({
      type: "filter",
      label: filter.value.name,
      icon: "pi pi-tag",
      value: filter.value,
    });
  }

  if (searchQuery.value) {
    filters.push({
      type: "search",
      label: `Поиск: "${searchQuery.value}"`,
      icon: "pi pi-search",
      value: searchQuery.value,
    });
  }

  if (selectedCatalog.value) {
    filters.push({
      type: "catalog",
      label: `Каталог: #${selectedCatalog.value}`,
      icon: "pi pi-folder",
      value: selectedCatalog.value,
    });
  }

  if (selectedCategory.value) {
    filters.push({
      type: "category",
      label: `Категория: #${selectedCategory.value}`,
      icon: "pi pi-bookmark",
      value: selectedCategory.value,
    });
  }

  return filters;
});

// Загрузка продуктов с серверной пагинацией
const loadProducts = async (
  page = currentPage.value,
  limit = rowsPerPage.value,
) => {
  productsLoading.value = true;

  try {
    let url = `${BACKEND_API.PRODUCT.GET_ALL}`;
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    // Добавляем фильтры
    if (filter.value) {
      params.append(`${filter.value.filter}`, filter.value.id);
    }

    if (searchQuery.value) {
      params.append("search", searchQuery.value);
    }

    if (selectedCatalog.value) {
      params.append("catalog", selectedCatalog.value);
    }

    if (selectedCategory.value) {
      params.append("category", selectedCategory.value);
    }

    const response = await fetch(`${url}?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.data) {
      paginatedProducts.value = {
        data: result.data,
        count: result.count || result.data.length,
        page: result.page || page,
        totalPages:
          result.totalPages ||
          Math.ceil((result.count || result.data.length) / limit),
      };

      currentPage.value = result.page || page;
      firstRecordIndex.value = (currentPage.value - 1) * rowsPerPage.value;

      saveFiltersToLocalStorage();
    }
  } catch (error) {
    console.error("Ошибка загрузки продуктов:", error);
    // Можно добавить уведомление об ошибке
  } finally {
    productsLoading.value = false;
  }
};

// Сохранение фильтров в localStorage
const saveFiltersToLocalStorage = () => {
  const savedFilters = {
    filter: filter.value || null,
    search: searchQuery.value || "",
    catalogId: selectedCatalog.value || null,
    categoryId: selectedCategory.value || null,
    rowsPerPage: rowsPerPage.value,
    page: currentPage.value,
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
        await loadProducts();
        return;
      }

      // Восстанавливаем фильтры
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

      if (filters.rowsPerPage) {
        rowsPerPage.value = filters.rowsPerPage;
      }

      if (filters.page) {
        currentPage.value = filters.page;
        firstRecordIndex.value = (filters.page - 1) * rowsPerPage.value;
      }

      await loadProducts();

      // Загружаем продукты с сохраненными фильтрами
    } catch (error) {
      console.error("Ошибка загрузки фильтров из localStorage:", error);
      await loadProducts();
    }
  } else {
    await loadProducts();
  }
};

// Обработчики событий
const onPageChange = (event) => {
  const newPage = Math.floor(event.first / event.rows) + 1;
  currentPage.value = newPage;
  firstRecordIndex.value = event.first;
  loadProducts(newPage, event.rows);
};

const resetAllFilters = async () => {
  filter.value = null;
  searchQuery.value = "";
  selectedCatalog.value = null;
  selectedCategory.value = null;

  headerStore.filter = null;
  headerStore.search = "";

  currentPage.value = 1;
  firstRecordIndex.value = 0;

  localStorage.removeItem("product_filter");

  await loadProducts(1, rowsPerPage.value);
};

// Отслеживание изменений фильтров в headerStore
watch(
  () => headerStore.filter,
  async (value) => {
    filter.value = value;
    currentPage.value = 1;
    firstRecordIndex.value = 0;
    await loadProducts(1, rowsPerPage.value);
  },
);

watch(
  () => headerStore.search,
  async (value) => {
    searchQuery.value = value;
    currentPage.value = 1;
    firstRecordIndex.value = 0;
    await loadProducts(1, rowsPerPage.value);
  },
);

// Жизненный цикл
onMounted(async () => {
  headerStore.hide = false;
  await loadFiltersFromLocalStorage();
});

onBeforeUnmount(() => {
  // Очистка при необходимости
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
  color: black;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  margin: 1rem;
}

.filters-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filters-title {
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filters-content {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
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

/* Информация о пагинации в заголовке */
.pagination-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  font-size: 0.9rem;
  color: #666;
}

.rows-per-page {
  display: flex;
  align-items: center;
}

.rows-per-page label {
  margin-right: 0.5rem;
}

:deep(.p-paginator) {
  padding: 1rem 0;
  border-top: 1px solid #e5e7eb;
}

:deep(.p-paginator-page) {
  min-width: 2.5rem;
  height: 2.5rem;
}

.pagination-text {
  font-size: 0.9rem;
  color: #666;
  padding: 0 1rem;
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

  .pagination-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .rows-per-page {
    width: 100%;
    justify-content: flex-start;
  }
}

@media (max-width: 720px) {
  .item-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.4rem;
  }
}

@media (max-width: 350px) {
  .item-grid {
    grid-template-columns: repeat(1, minmax(0, 1fr)) !important;
    justify-items: center !important;
  }
}
</style>
