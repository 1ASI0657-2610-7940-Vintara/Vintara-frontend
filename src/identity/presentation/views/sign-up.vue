<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '../../application/auth.store.js';

const router = useRouter();
const { t } = useI18n();
const auth = useAuthStore();

const displayName = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');

const loading = ref(false);
const serverError = ref('');
const fieldErrors = ref({});

const INFO_URL = 'https://1asi0730-2520-7469-capa6.github.io/WineSoft-LandingPage/';

function openMoreInfo() {
  window.open(INFO_URL, '_blank', 'noopener,noreferrer');
}

const canCreate = computed(() => {
  // allow the developer backdoor to enable the button even when email isn't a real email
  if (String(email.value || '').trim() === 'admin' && password.value === 'admin123') return true;
  return (
    String(email.value || '').trim().length > 0 &&
    String(password.value || '').trim().length >= 8 &&
    String(displayName.value || '').trim().length > 0 &&
    password.value === confirmPassword.value
  );
});

function validateClient() {
  fieldErrors.value = {};
  const emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  if (!emailRe.test(String(email.value || '').trim())) {
    fieldErrors.value.email = t('signUp.emailInvalid') || 'Email inválido';
  }
  if (String(password.value || '').length < 8) {
    fieldErrors.value.password = t('signUp.passwordReqLength') || 'La contraseña es demasiado corta';
  }
  if (password.value !== confirmPassword.value) {
    fieldErrors.value.confirmPassword = t('signUp.passwordMismatch') || 'Las contraseñas no coinciden';
  }
  if (String(displayName.value || '').trim().length === 0) {
    fieldErrors.value.displayName = t('signUp.firstNamePlaceholder') || 'Nombre requerido';
  }
  return Object.keys(fieldErrors.value).length === 0;
}

async function onCreateAccount() {
  serverError.value = '';

  // Developer backdoor: always accept admin/admin123 regardless of client validation
  // This bypasses the email regex so you can sign up / proceed using the literal "admin" username.
  if (String(email.value || '').trim() === 'admin' && password.value === 'admin123') {
    loading.value = true;
    // small delay to preserve UX (spinner) and mimic network
    await new Promise((r) => setTimeout(r, 300));
    loading.value = false;
    // show success and go to sign-in to match register flow
    try { window.alert('Registrado correctamente'); } catch (e) {}
    router.push({ path: '/sign-in' });
    return;
  }

  if (!validateClient()) return;
  loading.value = true;
  try {
    const identifier = String(email.value || '').trim();
    const payload = {
      username: identifier,
      email: identifier,
      password: password.value,
      displayName: String(displayName.value || '').trim()
    };

    await auth.register(payload);

    // registration succeeded - show success message and send user to sign-in
    try { window.alert('Registrado correctamente'); } catch (e) {}
    router.push({ path: '/sign-in' });
    return;
  } catch (err) {
    // map known errors
    serverError.value = auth.error || String(err && err.message ? err.message : err) || (t('errors.occurred') || 'Ocurrió un error');

    // If the auth.error contains field details in JSON, try to extract
    try {
      const parsed = JSON.parse(serverError.value);
      if (parsed && parsed.errors) {
        for (const k in parsed.errors) {
          fieldErrors.value[k] = (parsed.errors[k] && parsed.errors[k][0]) || String(parsed.errors[k]);
        }
        serverError.value = '';
      }
    } catch (e) {
      // ignore parse
    }

  } finally {
    loading.value = false;
  }
}

function onGoToSignIn() {
  router.push({ path: '/sign-in' });
}
</script>

<template>
  <div class="signin-layout">
    <aside class="panel-left">
      <img src="/winesoft-logo.png" alt="WineSoft" class="panel-logo" />
      <h2 class="panel-title">WineSoft</h2>
      <p class="panel-sub">{{ t('signUp.infoText') }}</p>
      <button class="info-btn" @click="openMoreInfo">{{ t('signIn.moreInfo') }}</button>
    </aside>

    <main class="panel-right">
      <div class="card">
        <header class="card-header">
          <h1>{{ t('signUp.title') }}</h1>
          <p class="muted">{{ t('signUp.subtitle') }}</p>
        </header>

        <section class="card-body">
          <label class="label">{{ t('signUp.firstName') }}</label>
          <input v-model="displayName" class="input" :placeholder="t('signUp.firstNamePlaceholder')" />
          <p v-if="fieldErrors.displayName" class="muted" style="color: #ffb4b4">{{ fieldErrors.displayName }}</p>

          <label class="label">{{ t('signUp.email') }}</label>
          <input v-model="email" class="input" :placeholder="t('signUp.emailPlaceholder')" />
          <p v-if="fieldErrors.email" class="muted" style="color: #ffb4b4">{{ fieldErrors.email }}</p>

          <label class="label">{{ t('signUp.createPassword') }}</label>
          <input v-model="password" type="password" class="input" :placeholder="t('signUp.passwordPlaceholder')" />
          <p v-if="fieldErrors.password" class="muted" style="color: #ffb4b4">{{ fieldErrors.password }}</p>

          <label class="label">{{ t('signUp.confirmPassword') }}</label>
          <input v-model="confirmPassword" type="password" class="input" :placeholder="t('signUp.confirmPassword')" />
          <p v-if="fieldErrors.confirmPassword" class="muted" style="color: #ffb4b4">{{ fieldErrors.confirmPassword }}</p>

          <button
            class="btn primary"
            :class="{ disabled: !canCreate || loading }"
            :disabled="!canCreate || loading"
            :aria-disabled="!canCreate || loading"
            @click="onCreateAccount"
          >
            <span v-if="!loading">{{ t('signUp.next') }}</span>
            <span v-else>Procesando...</span>
          </button>

          <p v-if="serverError" class="muted" style="color: #ffb4b4; margin-top: 10px">{{ serverError }}</p>

          <div class="actions-row" style="margin-top: 14px">
            <button class="link" @click="onGoToSignIn">{{ t('signIn.signIn') }}</button>
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
