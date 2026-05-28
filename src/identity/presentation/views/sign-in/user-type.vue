<template>
  <div class="user-type-page">
    <h1 class="title">{{ t('signIn.userTypeTitle') }}</h1>

    <div class="options">
      <button class="card" aria-label="Dueño" @click.prevent>
        <div class="img-wrap">
          <img src="/dueno.jpeg" alt="Dueño" />
        </div>
        <div class="label">{{ t('signIn.owner') }}</div>
      </button>

      <button class="card" aria-label="Proveedor" @click.prevent>
        <div class="img-wrap">
          <img src="/proovedor.jpeg" alt="Proveedor" />
        </div>
        <div class="label">{{ t('signIn.provider') }}</div>
      </button>
    </div>

  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
</script>

<style scoped>
/* styles copied from existing user-type */
.user-type-page { min-height: calc(100vh - 60px); background: var(--ws-bg-dark); display: flex; flex-direction: column; align-items: center; padding: 32px; box-sizing: border-box; position: relative; }
.title { color: var(--ws-white); font-size: 48px; margin-bottom: 24px; text-align: center; }
.options { width: 100%; max-width: 1100px; display: flex; justify-content: center; gap: 40px; flex-wrap: wrap; box-sizing: border-box; padding: 0 12px; }
.card { flex: 1 1 420px; max-width: 480px; min-width: 260px; background: var(--ws-gray-100); border: 4px solid rgba(0,0,0,0.8); padding: 18px; display: flex; flex-direction: column; align-items: stretch; gap: 12px; cursor: pointer; transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease; text-decoration: none; color: var(--ws-text-dark); outline: none; box-sizing: border-box; }
.card:focus { box-shadow: 0 8px 24px rgba(0,0,0,0.35); transform: translateY(-6px) scale(1.01); border-color: var(--ws-brand-purple); }
.card:hover { transform: translateY(-8px) scale(1.02); box-shadow: 0 14px 40px rgba(0,0,0,0.45); border-color: var(--ws-brand-purple); }
.img-wrap { width: 100%; max-width: 360px; margin: 0 auto; aspect-ratio: 3 / 4; background: var(--ws-white); border: 2px solid #e0e0e0; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.img-wrap img { width: 100%; height: 100%; object-fit: cover; display: block; }
.label { background: var(--ws-gray-100); padding: 12px 24px; font-size: 32px; border: 3px solid rgba(0,0,0,0.8); width: 100%; text-align: center; box-sizing: border-box; color: var(--ws-text-dark); }
@media (min-width: 1200px) { .options { gap: 48px; } .card { flex-basis: 420px; max-width: 440px; } .img-wrap { max-width: 320px; } }
@media (max-width: 900px) { .options { flex-direction: column; align-items: center; gap: 24px; } .img-wrap { max-width: 280px; aspect-ratio: 3 / 4; } .title { font-size: 36px; } .label { font-size: 24px; } }
@media (max-width: 480px) { .user-type-page { padding: 18px; } .title { font-size: 28px; } .card { padding: 12px; } .img-wrap { max-width: 220px; aspect-ratio: 3 / 4; } .label { font-size: 20px; padding: 10px 14px; } }
</style>
