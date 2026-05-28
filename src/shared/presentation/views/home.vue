<script setup>
import { useI18n } from "vue-i18n";
import { ref, onMounted } from "vue";
import router from "../../../router.js";

const { t } = useI18n();
const show = ref(false);

onMounted(() => {
  setTimeout(() => (show.value = true), 150);
});

const goToSupplies = () => {
  router.push("/inventory/supplies");
};

const goToStock = () => {
  router.push("/inventory/stock-movements");
};


const goToOrders = () => {
  router.push("/purchase/orders");
};

</script>

<template>
  <div class="home-container">
    <transition name="fade">
      <pv-card v-if="show" class="home-card shadow-4 home-card-large">
        <template #title>
          <h1 class="text-5xl font-bold title-gradient text-center mb-2">
            {{ t('home.title') }}
          </h1>
        </template>
        <template #content>
          <p class="text-xl text-gray-300 text-center mt-2 leading-relaxed max-w-3xl mx-auto">
            {{ t('home.content') }}
          </p>
          <div class="mt-8 flex justify-center gap-5 home-options-center">
            <pv-button
                class="home-btn"
                :label="`${t('home.manage-supplies')}`"
                icon="pi pi-box"
                severity="primary"
                @click="goToSupplies"
            />
            <pv-button
                class="home-btn home-btn-neutral"
                :label="`${t('home.views-stock')}`"
                icon="pi pi-chart-line"
                severity="secondary"
                @click="goToStock"
            />
            <pv-button
                class="home-btn"
                :label="`${t('option.orders')}`"
                icon="pi pi-shopping-cart"
                severity="help"
                @click="goToOrders"
            />
          </div>
        </template>
      </pv-card>
    </transition>
  </div>
</template>

<style scoped>
.home-container {
  display: flex;
  align-items: flex-start; /* alinear al inicio para parecer desplazado debajo del header/side */
  justify-content: center; /* centrar horizontal */
  width: 100%;
  min-height: calc(100vh - 64px); /* restar altura del header fijo */
  padding-top: 64px; /* espacio para el header */
  padding-bottom: 80px;
  /* background ahora lo gestiona layout para que sea continuo; dejamos fallback */
  background: transparent;
  color: var(--ws-white);
}
.home-card {
  background: linear-gradient(180deg, rgba(11,29,57,0.98), rgba(7,11,24,0.9));
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 1rem;
  padding: 3rem 2.5rem 2.5rem 2.5rem;
  width: 100%;
  max-width: 760px;
  margin: 0 1rem;
  box-shadow: 0 18px 36px rgba(2,6,23,0.6), inset 0 -6px 18px rgba(12,22,40,0.3);
  backdrop-filter: blur(6px);
}
.home-card-large {
  min-height: 380px;
}

.title-gradient {
  background: linear-gradient(90deg, #d04a72 0%, var(--ws-brand-purple) 60%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
}

.home-options-center {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  gap: 22px;
}

/* Botones: estilo uniforme, mayor tamaño y sombra sutil */
:deep(.home-btn) {
  position: relative; /* necesario para el ::after */
  overflow: hidden;
  border-radius: 12px;
  padding: 0.8rem 1.4rem;
  font-weight: 700;
  min-width: 170px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  box-shadow: 0 10px 30px rgba(3,9,25,0.55);
  transition: transform 0.14s cubic-bezier(.2,.9,.3,1), box-shadow 0.14s ease, opacity 0.12s ease;
  border: 1px solid rgba(255,255,255,0.06);
  backdrop-filter: blur(4px);
}
:deep(.home-btn:focus) {
  outline: 2px solid rgba(124, 90, 242, 0.28);
  outline-offset: 2px;
}

/* Icon inside button slightly smaller and vertically centered */
:deep(.home-btn .pi) {
  font-size: 1.05rem;
  line-height: 1;
}

/* Botón neutral (blanco) */
:deep(.home-btn-neutral) {
  background: #ffffff !important;
  color: var(--ws-text-dark) !important;
  box-shadow: 0 10px 28px rgba(3,9,25,0.32) !important;
  border: 1px solid rgba(16,24,40,0.06) !important;
}

/* Colores por severity: cubrir tanto el atributo (si se usa) como las clases de PrimeVue */
:deep(.home-btn[severity="help"]), :deep(.home-btn.p-button-help) { background-image: linear-gradient(90deg, #b63db3, #8c33c9) !important; color: #fff !important; border: 1px solid rgba(0,0,0,0.12) !important; }
:deep(.home-btn[severity="primary"]), :deep(.home-btn.p-button-primary) { background-image: linear-gradient(90deg, #7b5bf2, #b94cbc) !important; color: #fff !important; border: 1px solid rgba(0,0,0,0.12) !important; }
:deep(.home-btn[severity="secondary"]), :deep(.home-btn.p-button-secondary) { background: #ffffff !important; color: var(--ws-text-dark) !important; border: 1px solid rgba(16,24,40,0.06) !important; }

/* Añadir un detalle de borde interno claro para un look elegante */
:deep(.home-btn::after) {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 12px;
  pointer-events: none;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.03);
}

/* Animación de entrada */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.45s ease, transform 0.45s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

@media (max-width: 768px) {
  .home-card { max-width: 92%; padding: 2rem; }
  .title-gradient { font-size: 1.6rem; }
  :deep(.home-btn) { min-width: 120px; padding: 0.6rem 0.9rem; }
}
</style>