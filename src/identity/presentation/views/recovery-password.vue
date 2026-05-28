<template>
  <div class="recovery-page" role="main">
    <div class="card">
      <header class="card-header">
        <h1>{{ t('recovery.title') }}</h1>
        <p class="subtitle">{{ t('recovery.subtitle') }}</p>
      </header>

      <form @submit.prevent="onEnviar" class="form" novalidate>
        <label for="email" class="field-label">{{ t('recovery.email') }}</label>
        <div class="input-row">
          <input
            id="email"
            name="email"
            type="email"
            v-model="email"
            class="field-input"
            :placeholder="t('recovery.emailPlaceholder')"
            :aria-invalid="!validEmail"
            required
          />
        </div>

        <p v-if="showError" class="error">{{ t('recovery.invalidEmail') || 'Por favor ingresa un email válido.' }}</p>

        <div class="actions">
          <button type="submit" class="primary" :disabled="!validEmail || sending">
            <span v-if="!sending">{{ t('recovery.send') }}</span>
            <span v-else>{{ t('recovery.sending') || 'Enviando...' }}</span>
          </button>

          <button type="button" class="back" @click="onBack">{{ t('recovery.back') }}</button>
        </div>

        <div v-if="sent" class="sent-msg" role="status">
          <strong>{{ t('recovery.sentTitle') || 'Correo enviado' }}</strong>
          <p class="small">{{ t('recovery.sentMessage') }}</p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const { t } = useI18n();
const router = useRouter();
const email = ref('');
const sent = ref(false);
const sending = ref(false);
const showError = ref(false);

const validEmail = computed(() => {
  const value = (email.value || '').trim();
  return !!value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
});

watch(email, () => {
  if (showError.value) showError.value = false;
});

async function onEnviar() {
  if (!validEmail.value) {
    showError.value = true;
    return;
  }

  sending.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 800));
    sent.value = true;
    // email.value = '';
  } finally {
    sending.value = false;
  }
}

function onBack() {
  router.push({ path: '/sign-up' });
}
</script>

<style scoped>
.recovery-page {
  min-height: calc(100vh - 60px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ws-bg-dark);
  padding: 32px 16px;
  box-sizing: border-box;
}

.card {
  background: var(--ws-white);
  color: var(--ws-text-dark);
  padding: 28px;
  border-radius: 12px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
  max-width: 420px;
  width: 100%;
  box-sizing: border-box;
  text-align: left;
}

.card-header {
  text-align: center;
  margin-bottom: 14px;
}

.card-header h1 {
  margin: 0 0 6px 0;
  font-size: 1.8rem;
  color: var(--ws-text-dark);
}

.subtitle {
  margin: 0;
  font-size: 0.95rem;
  color: rgba(17,24,39,0.7);
}

.field-label {
  display: block;
  font-weight: 600;
  margin: 12px 0 6px 0;
  color: var(--ws-text-dark);
}

.input-row {
  display: flex;
  align-items: center;
}

.field-input {
  width: 100%;
  padding: 10px 12px;
  font-size: 1rem;
  border-radius: 8px;
  border: 1px solid #e6e6e6;
  box-shadow: none;
  outline: none;
  transition: border-color 0.18s, box-shadow 0.18s;
}
.field-input:focus {
  border-color: var(--ws-blue);
  box-shadow: 0 0 0 6px rgba(58,79,255,0.08);
}

.error {
  color: var(--ws-brand-purple-dark);
  margin: 8px 0 0 0;
  font-size: 0.9rem;
}

.actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  align-items: center;
}

button.primary {
  background: linear-gradient(90deg, var(--ws-blue) 0%, var(--ws-purple-soft) 100%);
  color: var(--ws-white);
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}
button.primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

button.back {
  background: transparent;
  border: none;
  color: rgba(17,24,39,0.7);
  padding: 8px 12px;
  cursor: pointer;
  text-decoration: underline;
}

.sent-msg {
  margin-top: 16px;
  background: var(--ws-gray-100);
  padding: 12px;
  border-radius: 8px;
  color: var(--ws-text-dark);
  border: 1px solid #e9eef6;
}

.small {
  margin: 6px 0 0 0;
  color: rgba(17,24,39,0.7);
  font-size: 0.95rem;
}

@media (max-width: 480px) {
  .card { padding: 18px; }
  .card-header h1 { font-size: 1.4rem; }
}
</style>
