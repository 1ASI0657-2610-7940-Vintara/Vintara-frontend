<script setup>
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>

<template>
  <footer class="footer-content">
    <div class="footer-bg" aria-hidden="true"></div>
    <div class="footer-inner">
      <div class="footer-section">
        <p>Copyright &copy; 2025. Capa 6 Development Team.</p>
      </div>
      <div class="footer-section">
        <p>
          {{ t('authoring-phrase.intro') }} <i class="pi pi-heart"/>
          {{ t('authoring-phrase.use') }} <a href="https://primevue.org/" target="_blank">PrimeVue</a>
          {{ t('authoring-phrase.author', { brand: 'Capa6' }) }}
        </p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer-content {
  position: relative;
  width: 100%;
  overflow: visible;
  box-sizing: border-box;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.footer-bg {
  position: absolute;
  left: 50%;
  top: 0;
  transform: translateX(-50%);
  width: 100vw;
  height: 100%;
  background: linear-gradient(90deg, #0f1724, #5b2ef4);
  z-index: 0;
  box-shadow: 0 -6px 18px rgba(11,29,57,0.35);
  border-top: 1px solid rgba(255,255,255,0.03);
}
.footer-inner {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1280px; /* alinear con #app */
  padding: 2.5rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  box-sizing: border-box;
  color: var(--ws-white);
}
.footer-section { text-align: center; font-size: 0.95rem; }
@media (min-width: 1024px) {
  .footer-inner { flex-direction: row; justify-content: space-between; padding: 2.5rem 2rem; }
  .footer-section { text-align: left; }
}
</style>