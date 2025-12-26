<template>
  <Loader v-if="productsLoading" />
  <DataView
    v-else
    style="padding-top: 4.5rem"
    :value="filteredProducts"
    layout="grid"
    :paginator="filteredProducts.length > 0"
    :rows="rows"
  >
    <!-- <template #header>
      <div class="filters-container">
        <div class="filter-group">
          <label>Каталог:</label>
          <Select
            v-model="selectedCatalog"
            :options="catalogOptions"
            optionLabel="name"
            placeholder="Все каталоги"
            @change="onFilterChange"
          />
        </div>

        <div class="filter-group">
          <label>Категория:</label>
          <Select
            v-model="selectedCategory"
            :options="categoryOptions"
            optionLabel="name"
            placeholder="Все категории"
            @change="onFilterChange"
          />
        </div>

        <div class="filter-group">
          <label>Сортировка:</label>
          <Select
            v-model="sortOption"
            :options="sortOptions"
            optionLabel="label"
            placeholder="Сортировка"
            @change="onSortChange"
          />
        </div>

        <Button
          v-if="hasActiveFilters"
          label="Сбросить фильтры"
          @click="resetFilters"
          severity="secondary"
          size="small"
        />
      </div>
    </template> -->
    <template #empty>Товары отсутствуют</template>
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
</template>

<script setup>
import DataView from "primevue/dataview";
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import ProductCard from "../small_components/ProductCard.vue";
import Loader from "../small_components/Loader.vue";
import { BACKEND_API } from "../constants/API.constant";
import { headerStore } from "../store/store";

const products = ref([]);
const productsLoading = ref(false);
const rows = ref(40);

// Фильтры и сортировка
const selectedCatalog = ref(null);
const selectedCategory = ref(null);
const sortOption = ref(null);

// Опции для сортировки
const sortOptions = ref([
  { label: "По умолчанию", value: null },
  { label: "Цена по возрастанию", value: "price_asc" },
  { label: "Цена по убыванию", value: "price_desc" },
  { label: "Название А-Я", value: "name_asc" },
  { label: "Название Я-А", value: "name_desc" },
  { label: "Дата добавления (новые)", value: "date_desc" },
  { label: "Дата добавления (старые)", value: "date_asc" },
]);

// Загрузка продуктов
const loadProducts = async (
  { filter, search } = { filter: null, search: null }
) => {
  productsLoading.value = true;
  try {
    let response = await fetch(`${BACKEND_API.PRODUCT.GET_ALL}?all=true`);
    if (filter) {
      response = await fetch(
        `${BACKEND_API.PRODUCT.GET_ALL}?all=true&${filter.filter}=${filter.id}`
      );
    }
    if (search) {
      response = await fetch(
        `${BACKEND_API.PRODUCT.GET_ALL}?search=${search}`
      );
    }
    const result = await response.json();

    if (response.ok) {
      products.value = result.data;
      rows.value = result.count;
    }
  } catch (error) {
    console.error("Ошибка загрузки продуктов:", error);
  } finally {
    productsLoading.value = false;
  }
};

// Отфильтрованные и отсортированные продукты
const filteredProducts = computed(() => {
  let result = [...products.value];

  // Фильтрация по каталогу
  if (selectedCatalog.value) {
    result = result.filter((product) =>
      product.categories?.some((category) =>
        category.catalogs?.some(
          (catalog) => catalog.id === selectedCatalog.value
        )
      )
    );
  }

  // Фильтрация по категории
  if (selectedCategory.value) {
    result = result.filter((product) =>
      product.categories?.some(
        (category) => category.id === selectedCategory.value
      )
    );
  }

  // Сортировка
  if (sortOption.value) {
    result.sort((a, b) => {
      switch (sortOption.value) {
        case "price_asc":
          return parseFloat(a.price) - parseFloat(b.price);

        case "price_desc":
          return parseFloat(b.price) - parseFloat(a.price);

        case "name_asc":
          return a.name.localeCompare(b.name);

        case "name_desc":
          return b.name.localeCompare(a.name);

        case "date_desc":
          return new Date(b.createdAt) - new Date(a.createdAt);

        case "date_asc":
          return new Date(a.createdAt) - new Date(b.createdAt);

        default:
          return 0;
      }
    });
  }

  return result;
});

// Адаптация количества строк
const updateRows = () => {
  rows.value = window.innerWidth <= 720 ? 14 : 30;
};

watch(
  () => headerStore.filter,
  async (value) => {
    await loadProducts({ filter: value });
  }
);

watch(
  () => headerStore.search,
  async (value) => {
    await loadProducts({ search: value });
  }
);

// Жизненный цикл
onMounted(async () => {
  updateRows();
  window.addEventListener("resize", updateRows);
  await loadProducts();
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", updateRows);
});
</script>

<style scoped>
.filters-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-end;
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  min-width: 200px;
}

.filter-group label {
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #495057;
}

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
  .filters-container {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-group {
    min-width: 100%;
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
