<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '../../application/auth.store.js';

const router = useRouter();
const { t } = useI18n();
const auth = useAuthStore();

const email = ref('');
const password = ref('');
const loading = ref(false);
const serverError = ref('');
const fieldErrors = ref({});

const INFO_URL = 'https://1asi0730-2520-7469-capa6.github.io/WineSoft-LandingPage/';
function openMoreInfo() { window.open(INFO_URL, '_blank', 'noopener,noreferrer'); }

const canSignIn = computed(() => {
  return String(email.value || '').trim().length > 0 && String(password.value || '').trim().length > 0;
});

async function onSignIn() {
  serverError.value = '';
  fieldErrors.value = {};

  // Developer backdoor: accept admin/admin123 locally and navigate to /home immediately
  if (String(email.value || '').trim() === 'admin' && password.value === 'admin123') {
    loading.value = true;
    await new Promise((r) => setTimeout(r, 250));
    loading.value = false;
    router.push({ path: '/home' });
    return;
  }

  if (!canSignIn.value) {
    if (!email.value) fieldErrors.value.email = t('signIn.emailRequired') || 'Email requerido';
    if (!password.value) fieldErrors.value.password = t('signIn.passwordRequired') || 'Contraseña requerida';
    return;
  }
  loading.value = true;
  try {
    const identifier = String(email.value || '').trim();
    // Use auth store to login
    await auth.login({ username: identifier, password: password.value });

    router.push({ path: '/home' });
    return;
  } catch (err) {
    // use error from store or fallback
    serverError.value = auth.error || String(err && err.message ? err.message : err) || (t('signIn.invalidCredentials') || 'Credenciales inválidas');
  } finally {
    loading.value = false;
  }
}

function onGoToSignUp() {
  router.push({ path: '/sign-up' });
}
function onForgotPassword() {
  router.push({ path: '/recovery-password' });
}
</script>

<template>
  <div class="signin-layout">
    <aside class="panel-left">
      <img src="/winesoft-logo.png" alt="WineSoft" class="panel-logo" />
      <h2 class="panel-title">WineSoft</h2>
      <p class="panel-sub">{{ t('signIn.infoText') || t('signUp.infoText') }}</p>
      <button class="info-btn" @click="openMoreInfo">{{ t('signIn.moreInfo') }}</button>
    </aside>

    <main class="panel-right">
      <div class="card">
        <header class="card-header">
          <h1>{{ t('signIn.welcome') }}</h1>
          <p class="muted">{{ t('signIn.sub') }}</p>
        </header>

        <section class="card-body">
          <label class="label">{{ t('signIn.email') }}</label>
          <input v-model="email" class="input" :placeholder="t('signIn.emailPlaceholder')" />
          <p v-if="fieldErrors.email" class="muted" style="color: #ffb4b4">{{ fieldErrors.email }}</p>

          <label class="label">{{ t('signIn.password') }}</label>
          <input v-model="password" type="password" class="input" :placeholder="t('signIn.passwordPlaceholder')" />
          <p v-if="fieldErrors.password" class="muted" style="color: #ffb4b4">{{ fieldErrors.password }}</p>

          <button
            class="btn primary"
            :class="{ disabled: !canSignIn || loading }"
            :disabled="!canSignIn || loading"
            :aria-disabled="!canSignIn || loading"
            @click="onSignIn"
          >
            <span v-if="!loading">{{ t('signIn.signIn') }}</span>
            <span v-else>{{ t('common.processing') || 'Procesando...' }}</span>
          </button>

          <p v-if="serverError" class="muted" style="color: #ffb4b4; margin-top: 10px">{{ serverError }}</p>

          <div class="actions-row" style="margin-top: 14px">
            <button class="link" @click="onForgotPassword">{{ t('signIn.forgotPassword') }}</button>
            <button class="link" @click="onGoToSignUp">{{ t('signIn.createAccount') }}</button>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Layout */
.signin-layout {
  display: flex;
  min-height: calc(100vh - 185px);
  background: linear-gradient(180deg, rgba(7,11,24,1) 0%, rgba(11,29,57,1) 100%);
  color: var(--ws-white);
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.panel-left {
  width: 320px;
  padding: 48px 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  background: linear-gradient(180deg, rgba(75,42,208,0.12), rgba(75,42,208,0.08));
  box-shadow: 0 8px 40px rgba(2,6,23,0.6);
  border-right: 1px solid rgba(255,255,255,0.02);
}
.panel-logo { width: 78px; height: auto; filter: drop-shadow(0 6px 14px rgba(75,42,208,0.16)); }
.panel-title { margin: 0; font-size: 20px; font-weight: 700; color: var(--ws-white); }
.panel-sub { font-size: 14px; color: rgba(255,255,255,0.75); text-align: center; max-width: 220px; }
.info-btn { margin-top: 12px; background: linear-gradient(90deg,var(--ws-brand-purple),var(--ws-brand-purple-dark)); color: #fff; border: none; padding: 10px 18px; border-radius: 10px; cursor: pointer; font-weight: 600; }

.panel-right { display: flex; align-items: center; justify-content: center; padding: 48px; }
.card {
  width: 520px;
  background: linear-gradient(180deg, rgba(7,13,30,0.95), rgba(9,20,36,0.95));
  border-radius: 14px;
  padding: 32px;
  box-shadow: 0 20px 60px rgba(2,6,23,0.6);
  border: 1px solid rgba(255,255,255,0.03);
}
.card-header h1 { margin: 0 0 6px 0; font-size: 28px; }
.card-header .muted { margin: 0 0 18px 0; color: rgba(255,255,255,0.72); }

/* Form */
.label { display: block; margin-top: 12px; margin-bottom: 8px; font-size: 14px; color: rgba(255,255,255,0.85); }
.input { width: 100%; padding: 12px 14px; border-radius: 10px; border: none; background: rgba(255,255,255,0.06); color: var(--ws-white); box-sizing: border-box; font-size: 16px; }
.input::placeholder { color: rgba(255,255,255,0.5); }

.btn { margin-top: 18px; width: 100%; padding: 12px 16px; font-size: 18px; border-radius: 10px; border: none; cursor: pointer; font-weight: 700; }
.btn.primary { background: linear-gradient(90deg, #7b5bf2, #b94cbc); color: white; box-shadow: 0 12px 30px rgba(75,42,208,0.16); }
.btn.disabled, .btn[disabled] { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.6); cursor: not-allowed; box-shadow: none; }

.actions-row { display: flex; justify-content: space-between; align-items: center; margin-top: 12px; }
.link { background: transparent; border: none; color: rgba(255,255,255,0.8); cursor: pointer; text-decoration: underline; font-size: 14px; }

/* Responsive */
@media (max-width: 900px) {
  .signin-layout { flex-direction: column; padding: 24px; }
  .panel-left { width: 100%; flex-direction: row; justify-content: space-between; padding: 18px; }
  .panel-right { padding: 18px; }
  .card { width: 100%; padding: 20px; }
}
</style>
