<template>
  <div class="store-page">
    <div class="store-header">
      <Button
        icon="pi pi-arrow-left"
        label="Назад"
        @click="goBack"
        class="back-btn"
        size="small"
        severity="secondary"
      />
      <!-- <h1 class="store-title">Информация о магазине</h1> -->
    </div>

    <div v-if="loading" class="loading-container">
      <ProgressSpinner
        style="width: 50px; height: 50px"
        strokeWidth="4"
        animationDuration=".5s"
      />
      <p class="mt-3">Загрузка информации...</p>
    </div>

    <div v-else class="store-content">
      <!-- Контакты -->
      <Card class="store-section">
        <template #title>
          <div class="section-title">
            <i class="pi pi-phone section-icon"></i>
            Контакты
          </div>
        </template>
        <template #content>
          <div class="contacts-grid">
            <!-- Телефоны -->
            <div class="contact-category">
              <h3 class="category-title">Телефоны</h3>
              <div class="contact-list">
                <div
                  v-for="phone in phones"
                  :key="phone.id"
                  class="contact-item"
                  :class="{ 'main-contact': phone.isMain }"
                >
                  <div class="contact-info">
                    <i class="pi pi-phone contact-icon"></i>
                    <span class="contact-value">+{{ phone.phone }}</span>
                    <!-- <span v-if="phone.isMain" class="main-badge">Основной</span> -->
                  </div>
                  <div v-if="phone.description" class="contact-description">
                    {{ phone.description }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Email -->
            <div class="contact-category">
              <h3 class="category-title">Email</h3>
              <div class="contact-list">
                <div
                  v-for="email in emails"
                  :key="email.id"
                  class="contact-item"
                  :class="{ 'main-contact': email.isMain }"
                >
                  <div class="contact-info">
                    <i class="pi pi-envelope contact-icon"></i>
                    <span class="contact-value">{{ email.email }}</span>
                    <!-- <span v-if="email.isMain" class="main-badge">Основной</span> -->
                  </div>
                  <div v-if="email.description" class="contact-description">
                    {{ email.description }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </Card>

      <!-- Адреса -->
      <Card v-if="addresses.length > 0" class="store-section">
        <template #title>
          <div class="section-title">
            <i class="pi pi-map-marker section-icon"></i>
            Адреса
          </div>
        </template>
        <template #content>
          <div class="addresses-list">
            <div
              v-for="address in addresses"
              :key="address.id"
              class="address-item"
            >
              <div class="address-info">
                <i class="pi pi-home address-icon"></i>
                <div class="address-details">
                  <p class="address-text">{{ address.address }}</p>
                  <div v-if="address.hours" class="address-hours">
                    <i class="pi pi-clock hours-icon"></i>
                    <span>{{ address.hours }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </Card>

      <!-- Информация о магазине -->
      <Card class="store-section">
        <template #title>
          <div class="section-title">
            <i class="pi pi-info-circle section-icon"></i>
            О магазине
          </div>
        </template>
        <template #content>
          <div class="about-content">
            <div class="about-item">
              <i class="pi pi-shopping-cart about-icon"></i>
              <div class="about-text">
                <h4>Мебель Модно Стильно</h4>
                <p>Каталог товаров для дома и офиса</p>
              </div>
            </div>
            <div class="about-item">
              <i class="pi pi-truck about-icon"></i>
              <div class="about-text">
                <h4>Доставка</h4>
                <p>
                  Быстрая доставка по всему городу. Сроки и стоимость уточняйте
                  у менеджеров.
                </p>
              </div>
            </div>
            <!-- <div class="about-item">
              <i class="pi pi-shield about-icon"></i>
              <div class="about-text">
                <h4>Гарантия</h4>
                <p>
                  На всю продукцию предоставляется гарантия от производителя.
                </p>
              </div>
            </div> -->
          </div>
        </template>
      </Card>

      <!-- Социальные сети (опционально) -->
      <!-- <Card class="store-section">
        <template #title>
          <div class="section-title">
            <i class="pi pi-share-alt section-icon"></i>
            Мы в соцсетях
          </div>
        </template>
        <template #content>
          <div class="social-links">
            <Button
              icon="pi pi-instagram"
              label="Instagram"
              severity="secondary"
              outlined
              class="social-btn"
              @click="openSocial('instagram')"
            />
            <Button
              icon="pi pi-vk"
              label="ВКонтакте"
              severity="secondary"
              outlined
              class="social-btn"
              @click="openSocial('vk')"
            />
            <Button
              icon="pi pi-telegram"
              label="Telegram"
              severity="secondary"
              outlined
              class="social-btn"
              @click="openSocial('telegram')"
            />
          </div>
        </template>
      </Card> -->
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { BACKEND_API } from "../constants/API.constant";
import { headerStore } from "../store/store";
import Button from "primevue/button";
import Card from "primevue/card";
import ProgressSpinner from "primevue/progressspinner";

const router = useRouter();
const loading = ref(true);
const phones = ref([]);
const emails = ref([]);
const addresses = ref([]);

onMounted(() => {
  headerStore.hide = true;
  loadStoreInfo();
});

onUnmounted(() => {
  headerStore.hide = false;
});

async function loadStoreInfo() {
  loading.value = true;
  try {
    // Загружаем телефоны
    const phoneResponse = await fetch(BACKEND_API.STORE.PHONE.GET_ALL);
    if (phoneResponse.ok) {
      const phoneResult = await phoneResponse.json();
      phones.value = phoneResult.data || [];
    }

    // Загружаем email
    const emailResponse = await fetch(BACKEND_API.STORE.EMAIL.GET_ALL);
    if (emailResponse.ok) {
      const emailResult = await emailResponse.json();
      emails.value = emailResult.data || [];
    }

    // Загружаем адреса
    const addressResponse = await fetch(BACKEND_API.STORE.ADDRESS.GET_ALL);
    if (addressResponse.ok) {
      const addressResult = await addressResponse.json();
      addresses.value = addressResult.data || [];
    }
  } catch (error) {
    console.error("Ошибка при загрузке информации о магазине:", error);
  } finally {
    loading.value = false;
  }
}

function goBack() {
  router.back();
}

function openSocial(network) {
  // Здесь можно добавить реальные ссылки на соцсети
  const links = {
    instagram: "https://instagram.com",
    vk: "https://vk.com",
    telegram: "https://telegram.org",
  };
  window.open(links[network], "_blank");
}
</script>

<style scoped>
.store-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #ffeaca 100%);
  padding: 20px;
}

.store-header {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  padding: 0 10px;
}

.back-btn {
  margin-right: 20px;
}

.store-title {
  font-size: 2rem;
  color: #333;
  margin: 0;
  font-weight: 600;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
  color: #666;
}

.store-content {
  max-width: 800px;
  margin: 0 auto;
}

.store-section {
  margin-bottom: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: none;
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 1.25rem;
  color: black;
  font-weight: 600;
}

.section-icon {
  margin-right: 10px;
  font-size: 1.2rem;
}

.contacts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

@media (max-width: 768px) {
  .contacts-grid {
    grid-template-columns: 1fr;
  }
}

.contact-category {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.category-title {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 1.1rem;
  color: #495057;
  /* border-bottom: 2px solid #3f51b5; */
  padding-bottom: 8px;
}

.contact-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.contact-item {
  background: white;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #dee2e6;
  transition: all 0.3s ease;
}

/* .contact-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
} */

.contact-item.main-contact {
  /* border-left: 4px solid #3f51b5; */
  background: linear-gradient(135deg, #f8f9ff 0%, #fffcf0 100%);
}

.contact-info {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.contact-icon {
  margin-right: 10px;
  color: black;
  font-size: 1.1rem;
}

.contact-value {
  flex: 1;
  font-size: 1.05rem;
  font-weight: 500;
  color: #212529;
}

.main-badge {
  background: #3f51b5;
  color: white;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
}

.contact-description {
  font-size: 0.9rem;
  color: #6c757d;
  padding-left: 30px;
}

.addresses-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.address-item {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.address-info {
  display: flex;
  align-items: flex-start;
}

.address-icon {
  margin-right: 15px;
  color: black;
  font-size: 1.2rem;
  margin-top: 2px;
}

.address-details {
  flex: 1;
}

.address-text {
  margin: 0 0 10px 0;
  font-size: 1.05rem;
  color: #212529;
  font-weight: 500;
}

.address-hours {
  display: flex;
  align-items: center;
  color: #495057;
}

.hours-icon {
  margin-right: 8px;
  color: #28a745;
}

.about-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.about-item {
  display: flex;
  align-items: flex-start;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.about-icon {
  margin-right: 15px;
  color: black;
  font-size: 1.3rem;
  margin-top: 2px;
}

.about-text h4 {
  margin: 0 0 5px 0;
  color: #212529;
}

.about-text p {
  margin: 0;
  color: #6c757d;
  line-height: 1.5;
}

.social-links {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.social-btn {
  flex: 1;
  min-width: 150px;
}

:deep(.p-card-title) {
  margin-bottom: 0 !important;
}

:deep(.p-card-content) {
  padding: 0 !important;
}
</style>
