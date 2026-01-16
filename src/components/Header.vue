<template>
  <header class="header">
    <div class="header-left">
      <InputGroup>
        <InputText
          id="search"
          style="font-size: medium"
          placeholder="Найти мебель"
          v-model="searchQuery"
        />
        <InputGroupAddon>
          <Button
            icon="pi pi-search"
            severity="secondary"
            variant="text"
            @click="
              () => {
                headerStore.search = searchQuery;
              }
            "
          />
        </InputGroupAddon>
      </InputGroup>
    </div>
    <div class="header-right">
      <Button
        icon="pi pi-bars"
        size="large"
        style="background-color: transparent; border: none; box-shadow: none"
        raised
        @click="() => (visibleDrawer = true)"
      />
    </div>
    <Drawer
      v-model:visible="visibleDrawer"
      position="left"
      class="custom-drawer"
      @show="onShowDraw"
    >
      <template #header>
        <div class="drawer-header">
          <div class="flex items-center gap-3">
            <i
              class="pi pi-furniture"
              style="font-size: 1.5rem; color: #3f51b5"
            ></i>
            <div>
              <h3 class="font-bold text-xl m-0">Мебель Модно Стильно</h3>
              <small class="text-gray-500">Каталог товаров</small>
            </div>
          </div>
        </div>
      </template>
      <template #default>
        <div v-if="loadingData" class="loading-container">
          <ProgressSpinner
            style="width: 50px; height: 50px"
            strokeWidth="4"
            animationDuration=".5s"
          />
          <p class="mt-3">Загрузка каталога...</p>
        </div>
        <div v-else class="catalog-container">
          <div class="catalog-menu">
            <Accordion :activeIndex="expandedIndex" @tab-change="onTabChange">
              <AccordionTab
                v-for="catalog in filteredMenuItems"
                :key="catalog.id"
                :header="catalog.name"
              >
                <div class="catalog-content">
                  <div
                    v-for="category in catalog.categories"
                    :key="category.id"
                    class="category-item"
                    @click="selectCategory(category)"
                  >
                    <div class="category-content">
                      <span>{{ category.name }}</span>
                    </div>
                    <!-- <i class="pi pi-circle-fill" style="font-size: 8px"></i> -->
                  </div>
                  <div
                    v-if="catalog.categories.length === 0"
                    class="no-categories"
                  >
                    <i class="pi pi-info-circle mr-2"></i>
                    <span>Категории отсутствуют</span>
                  </div>
                </div>
              </AccordionTab>
            </Accordion>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="drawer-footer">
          <div class="contacts">
            <div v-if="mainPhone" class="item-contact">
              <i class="pi pi-phone"></i>
              <p>+{{ mainPhone.phone }}</p>
            </div>
            <div v-if="mainEmail" class="item-contact">
              <i class="pi pi-envelope"></i>
              <p>{{ mainEmail.email }}</p>
            </div>
          </div>
          <Button
            icon="pi pi-info-circle"
            label="Информация о магазине"
            style="color: black; background-color: transparent; border: none"
            @click="
              () => {
                visibleDrawer = false;
                router.push({ name: 'Store' });
              }
            "
          />
        </div>
      </template>
    </Drawer>
  </header>
</template>

<
<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { BACKEND_API } from "../constants/API.constant";
import { headerStore } from "../store/store";
import { useRouter } from "vue-router";

const router = useRouter();
const visibleDrawer = ref(false);
const loadingData = ref(false);
const expandedIndex = ref(0);
const searchQuery = ref("");
const catalogs = ref([]);
const phones = ref([]);
const emails = ref([]);
const mainPhone = ref(null);
const mainEmail = ref(null);

async function onShowDraw() {
  const localFilter = JSON.parse(window.localStorage.getItem("filter"));
  console.log(localFilter);
  if (catalogs.value.length === 0) {
    await loadOptions();
  }
  // Загружаем контакты при открытии drawer
  await loadContacts();
}

async function loadOptions() {
  loadingData.value = true;
  try {
    const response = await fetch(
      BACKEND_API.PRODUCT.CATALOGS.GET_ALL + "?all=true"
    );
    const result = await response.json();

    if (response.ok) {
      catalogs.value = result.data;
    }
  } catch (error) {
    console.error("Произошла ошибка при загрузке данных: ", error);
  } finally {
    loadingData.value = false;
  }
}

// Функция для получения телефонов и email
async function loadContacts() {
  try {
    // Загружаем телефоны
    const phoneResponse = await fetch(BACKEND_API.STORE.PHONE.GET_ALL);
    const phoneResult = await phoneResponse.json();

    if (phoneResponse.ok && phoneResult.data) {
      phones.value = phoneResult.data;
      // Находим телефон с isMain === true
      mainPhone.value =
        phoneResult.data.find((phone) => phone.isMain === true) || null;
    }

    // Загружаем email
    const emailResponse = await fetch(BACKEND_API.STORE.EMAIL.GET_ALL);
    const emailResult = await emailResponse.json();

    if (emailResponse.ok && emailResult.data) {
      emails.value = emailResult.data;
      // Находим email с isMain === true
      mainEmail.value =
        emailResult.data.find((email) => email.isMain === true) || null;
    }
  } catch (error) {
    console.error("Произошла ошибка при загрузке контактов: ", error);
  }
}

// Функция для получения основного телефона (публичная, если нужна из других компонентов)
function getMainPhone() {
  return mainPhone.value;
}

// Функция для получения основного email (публичная, если нужна из других компонентов)
function getMainEmail() {
  return mainEmail.value;
}

// Функция для получения всех телефонов с фильтрацией по isMain
function getAllPhones(onlyMain = false) {
  if (onlyMain) {
    return phones.value.filter((phone) => phone.isMain === true);
  }
  return phones.value;
}

// Функция для получения всех email с фильтрацией по isMain
function getAllEmails(onlyMain = false) {
  if (onlyMain) {
    return emails.value.filter((email) => email.isMain === true);
  }
  return emails.value;
}

const filteredMenuItems = computed(() => {
  if (!searchQuery.value.trim()) {
    return catalogs.value;
  }

  const query = searchQuery.value.toLowerCase();
  return catalogs.value
    .map((catalog) => {
      const filteredCategories =
        catalog.categories?.filter((category) =>
          category.name.toLowerCase().includes(query)
        ) || [];

      if (
        filteredCategories.length > 0 ||
        catalog.name.toLowerCase().includes(query)
      ) {
        return {
          ...catalog,
          categories: filteredCategories,
        };
      }
      return null;
    })
    .filter(Boolean);
});

function onTabChange(event) {
  expandedIndex.value = event.index;
}

function selectCategory(category) {
  window.localStorage.setItem(
    "product_filter",
    JSON.stringify({
      filter: "category_id",
      id: category.id,
      name: category.name,
    })
  );
  headerStore.filter = {
    filter: "category_id",
    id: category.id,
    name: category.name,
  };
  visibleDrawer.value = false;
}

onMounted(() => {
  loadOptions();
  // Загружаем контакты при монтировании компонента
  loadContacts();
});

// Экспортируем функции для использования в других компонентах
defineExpose({
  getMainPhone,
  getMainEmail,
  getAllPhones,
  getAllEmails,
  loadContacts,
});
</script>

<style scoped>
.header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 8vh;
  z-index: 1000;
  position: fixed;
  padding: 5px 20px;
  /* background: linear-gradient(135deg, #3f51b5 0%, #5c6bc0 100%); */
  background: #7d5440;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  flex-direction: row;
  width: 85%;
  height: 75%;
}

.header-left :deep(.p-inputtext) {
  border-radius: 15px 0 0 15px !important;
  border: 1px solid #e0e0e0;
  padding: 0.75rem 1.25rem;
}

.header-left :deep(.p-inputgroup-addon) {
  border-radius: 0 20px 20px 0 !important;
  background: white;
  border: 1px solid #e0e0e0;
  border-left: none;
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.close-btn {
  color: #666 !important;
}

.close-btn:hover {
  background: #f0f0f0 !important;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #666;
}

.catalog-search span {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.catalog-search :deep(.p-inputtext) {
  font-size: medium;
  border-radius: 10px !important;
  border: 1px solid #e0e0e0;
}

.catalog-search :deep(.p-inputtext:focus) {
  border-color: #3f51b5 !important;
  box-shadow: 0 0 0 2px rgba(63, 81, 181, 0.1) !important;
}

:deep(.p-accordionheader) {
  padding: 10px 20px;
}

:deep(.p-accordion .p-accordion-header) {
  background: white !important;
  border: 1px solid #eaeaea !important;
  border-radius: 8px !important;
  margin-bottom: 8px !important;
}

:deep(.p-accordion .p-accordion-header:not(:first-child)) {
  margin-top: 8px !important;
}

:deep(.p-accordion .p-accordion-header .p-accordion-header-link) {
  padding: 1rem 1.25rem !important;
  border: none !important;
  background: white !important;
  border-radius: 8px !important;
  font-weight: 600 !important;
  color: #333 !important;
  transition: all 0.2s ease !important;
}

:deep(.p-accordion .p-accordion-header .p-accordion-header-link:hover) {
  background: #f5f5f5 !important;
}

:deep(.p-accordionheader-toggle-icon) {
  transform: rotate(180deg);
}

:deep(.p-accordion .p-accordion-content) {
  border: none !important;
  background: white !important;
  padding: 0 !important;
  border-radius: 0 0 8px 8px !important;
}

.p-drawer-header {
  padding: 0px;
}

.catalog-content {
  padding: 0.5rem 0;
}

.category-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
  background-color: #7d5440;
  /* border-left: 3px solid #3f51b5; */
  /* border-bottom: #333 solid 1px; */
  /* border: 0.5px solid #7d5440; */
  /* border-radius: 5px; */
  margin-bottom: 5px;
  padding-left: 10px;
}

.category-item:hover {
  background: #f8f9fa;
  /* padding-left: 1.5rem; */
}

.category-content {
  display: flex;
  align-items: center;
  flex: 1;
}

.category-item span {
  font-size: 0.95rem;
  color: white;
}

.no-categories {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  color: #999;
  font-size: 0.9rem;
}

.catalog-stats {
  background: white;
  border-radius: 10px;
  border: 1px solid #eaeaea;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

:deep(.catalog-stats .p-button) {
  border-radius: 20px !important;
  font-size: 0.875rem !important;
}

/* Анимация для плавного открытия */
:deep(.p-drawer-right) {
  animation: slideInRight 0.3s ease;
}

.drawer-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.phones {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: auto;
}

.item-phone {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-bottom: 5px;
}
.item-phone > i {
  margin-right: 10px;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

/* Мобильная адаптация */
@media (max-width: 768px) {
  .header {
    padding: 5px 10px;
  }

  .header-left {
    width: 80%;
  }

  :deep(.custom-drawer) {
    width: 100% !important;
    max-width: 320px !important;
  }
}

/* Кастомные стили для скроллбара */
.catalog-menu::-webkit-scrollbar {
  width: 6px;
}

.catalog-menu::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.catalog-menu::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.catalog-menu::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.drawer-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.contacts {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: auto;
  margin-bottom: 10px;
}

.item-contact {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-bottom: 5px;
}

.item-contact > i {
  margin-right: 15px;
}

/* Адаптация для мобильных устройств */
@media (max-width: 768px) {
  .item-contact {
    font-size: 1.1rem;
  }

  .item-contact > i {
    font-size: 1.1rem;
  }
}
</style>
