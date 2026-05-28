<script setup>
import {useI18n}from "vue-i18n";
import {ref, computed, watch, onMounted, onBeforeUnmount} from "vue";
import { useRoute, useRouter } from 'vue-router';
import LanguageSwitcher from "./language-switcher.vue";
import FooterContent from "./footer-content.vue";
import NotificationCenter from "./notification-center.vue";

const {t, locale} = useI18n();
const drawer = ref(false);
const router = useRouter();
const route = useRoute();

const items = [{label: "option.home", to: "/home", icon: "pi pi-home"},
               {label: "option.analytics", to: "/analytics", icon: "pi pi-chart-line", },
               {label: "option.supplies", to: "/inventory/supplies", icon: "pi pi-box"},
               ///{label: "option.stockMovements", to: "/inventory/stock-movements", icon: "pi pi-chart-line"},
               {label: 'option.orders', to: '/purchase/orders', icon: 'pi pi-shopping-cart'},
               {label: "option.profiles", to: '/profiles', icon: 'pi pi-user'},
              ];

const isAuthView = computed(() => {
  const p = route.path.toLowerCase();
  return p === '/sign-up' || p === '/sign-in';
});

function goToSignUp() {
  router.push({ path: '/sign-up' });
}
function goToSignIn() {
  router.push({ path: '/sign-in' });
}

function normalizeLocale(raw) {
  const s = raw && raw.value ? String(raw.value) : String(raw || 'en');
  return s.split('-')[0];
}

// Fallback local header labels
const headerLabels = {
  en: { signUp: 'Sign up', signIn: 'Sign in' },
  es: { signUp: 'Crear Cuenta', signIn: 'Iniciar sesión' }
};

const headerSignUp = computed(() => {
  const l = normalizeLocale(locale) || 'en';
  return (headerLabels[l] && headerLabels[l].signUp) || 'Sign up';
});
const headerSignIn = computed(() => {
  const l = normalizeLocale(locale) || 'en';
  return (headerLabels[l] && headerLabels[l].signIn) || 'Sign in';
});

// Debug: log values when locale changes to help verificar traducciones
watch(locale, (newLocale) => {
  console.log('[i18n debug] locale ->', newLocale);
});

// Safe translation helper: return fallback when t(key) equals the key (missing translation)
function safeT(key, fallback) {
  try {
    const val = t(key);
    // When vue-i18n can't find the key it usually returns the key itself
    if (!val || String(val) === String(key)) return fallback || '';
    return val;
  } catch (e) {
    return fallback || '';
  }
}

// --- New: profile state and logout ---
const authUser = ref(null);

function loadAuthUser() {
  try {
    const raw = localStorage.getItem('auth_user');
    if (raw) authUser.value = JSON.parse(raw);
    else authUser.value = null;
  } catch (e) {
    authUser.value = null;
  }
}

const displayUsername = computed(() => {
  if (!authUser.value) return '';
  if (authUser.value.displayName) return authUser.value.displayName;
  return authUser.value.username || authUser.value.email;
});

const displayEmail = computed(() => {
  if (!authUser.value) return '';
  if (authUser.value.email && authUser.value.email !== displayUsername.value) {
    return authUser.value.email;
  }
  return '';
});

function logout() {
  try {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  } catch (e) {
    // ignore
  }
  router.push({ path: '/sign-in' });
}

function onStorageEvent(e) {
  if (e.key === 'auth_user' || e.key === 'auth_token') loadAuthUser();
}

onMounted(() => {
  loadAuthUser();
  window.addEventListener('storage', onStorageEvent);
});
onBeforeUnmount(() => {
  window.removeEventListener('storage', onStorageEvent);
});
</script>
<template>
  <pv-toast/>
  <pv-confirm-dialog/>
  <div :class="['layout-flex', { 'with-side': !isAuthView }]">
    <!-- Sidebar para vistas normales -->
    <aside v-if="!isAuthView" class="side-nav">
      <div class="side-top">
        <img class="logo" src="/winesoft-logo.png" alt="WineSoft Logo"/>
        <h3 class="brand">WineSoft</h3>
      </div>

      <nav class="side-menu">
        <ul>
          <li v-for="item in items" :key="item.to">
            <router-link :to="item.to" class="side-link">
              <i v-if="item.icon" :class="item.icon"></i>
              <span>{{ t(item.label) }}</span>
            </router-link>
          </li>
        </ul>
      </nav>

      <!-- Profile block (new) -->
      <div class="side-profile" v-if="authUser">
        <div class="profile-info">
          <div class="avatar">{{(displayUsername || 'U').charAt(0).toUpperCase() }}</div>
          <div class="meta">
            <div class="name" :title="displayUsername">{{ displayUsername }}</div>
            <div v-if="displayEmail" class="email" :title="displayEmail">{{ displayEmail }}</div>
            <div class="role">{{ safeT('profile.view', 'Ver Perfil') }}</div>
          </div>
        </div>
        <button class="logout-btn" @click="logout">
          <i class="pi pi-sign-out mr-2"></i> {{ safeT('common.logout', 'Cerrar sesión') }}</button>
      </div>

      <div class="side-footer">
        <notification-center />
        <language-switcher />
      </div>
    </aside>

    <!-- Toolbar superior para vistas de autenticación (sign-in / sign-up) -->
    <div v-else class="header">
      <pv-toolbar class="bg-primary">
        <template #start>
          <img class="logo" src="/winesoft-logo.png" alt="WineSoft Logo"/>
          <h3>WineSoft</h3>
        </template>

        <template #end>
          <div v-if="!isAuthView" class="nav-items mr-3">
            <pv-button
                v-for="item in items"
                :key="item.label"
                as-child
                v-slot="slotProps"
            >
              <router-link :to="item.to" :class="slotProps['class']">
                {{ t(item.label) }}
              </router-link>
            </pv-button>
          </div>

          <div v-else class="auth-actions mr-3">
            <pv-button class="p-button-text p-button-plain" @click="goToSignUp">{{ headerSignUp }}</pv-button>
            <pv-button class="p-button-text p-button-plain" @click="goToSignIn">{{ headerSignIn }}</pv-button>
          </div>

          <notification-center v-if="!isAuthView" class="mr-3" />
          <language-switcher/>
        </template>
      </pv-toolbar>
      <pv-drawer v-model="drawer"/>
    </div>

    <div class="main-content">
      <router-view/>
    </div>
    <footer-content />
  </div>
</template>

<style scoped>
.layout-container {
  display: flex;
  height: 100vh;
  background-color: #0d0d0d;
  font-family: "Poppins", sans-serif;
  color: #f2f2f2;
  overflow: hidden;
}

/* Nuevo: contenedor principal que usa la plantilla */
.layout-flex {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
}

/* Barra lateral (side-nav) */
.side-nav {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 240px;
  background: linear-gradient(180deg, var(--ws-bg-dark, #120f24), var(--ws-brand-purple-dark, #4B2AD0));
  color: var(--ws-white);
  padding: 28px 18px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  z-index: 1300;
  box-shadow: 2px 0 24px rgba(4,6,20,0.6);
}
.side-top { text-align: center; margin-bottom: 24px; }
.side-top .logo { height: 48px; width: auto; margin: 0 auto 8px; filter: drop-shadow(0 6px 10px rgba(75,42,208,0.18)); }
.side-top .brand { margin: 0; font-size: 1.1rem; font-weight: 700; color: var(--ws-white); }

.side-menu { flex: 1 1 auto; overflow-y: auto; overflow-x: hidden;}
.side-menu ul { list-style: none; padding: 0; margin: 0; }
.side-menu li { margin: 12px 0; }
.side-link {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 10px 12px;
  color: rgba(255,255,255,0.92);
  border-radius: 10px;
  text-decoration: none;
}
.side-link:hover .side-link.router-link-active {
  background: rgba(255,255,255,0.1);
  color: var(--ws-white);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.side-link i { font-size: 1.1rem; min-width: 20px; text-align: center; }

.side-profile {
  margin-top: 12px;
  padding: 16px;
  border-radius: 16px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255,255,255,0.05);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.profile-info { display:flex; gap: 12px; align-items: center; width: 100%; overflow: hidden;}
.avatar {
  width: 44px; height: 44px; border-radius: 22px; display:flex; align-items:center; justify-content:center;
  background: linear-gradient(90deg,#7b5bf2,#b94cbc); color: white; font-weight: 700; font-size: 18px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.3); flex-shrink: 0;
}
.profile-info .name { font-weight: 700; }
.profile-info .role { font-size: 12px; color: rgba(255,255,255,0.6); }

.logout-btn:hover { background: rgba(255,255,255,0.02); }

.meta {display: flex; flex-direction: column; justify-content: center; flex: 1;
  min-width: 0; /* IMPORTANTE: Permite que el texto se corte con ellipsis */
}
.name {font-weight: 600;font-size: 0.9rem; white-space: nowrap;overflow: hidden;text-overflow: ellipsis;color: var(--ws-white);
}
.email {font-size: 0.75rem; color: rgba(255,255,255,0.6); white-space: nowrap;overflow: hidden; text-overflow: ellipsis;margin-top: 2px;
}
.role {font-size: 0.7rem; color: var(#8F7BFF); margin-top: 2px; font-weight: 500;
}
.logout-btn { width: 100%; padding: 8px 12px; border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.1); cursor: pointer;
  background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.9); font-size: 0.85rem;
  display: flex; align-items: center; justify-content: center; transition: background 0.2s;
}
.logout-btn:hover { background: rgba(255,50,50,0.2); border-color: rgba(255,50,50,0.3); color: #fff; }

.side-footer { margin-top: 16px; display: flex; flex-direction: column; gap: 16px; align-items: center; width: 100%;
}

/* Estilos del header superior (solo para vistas auth) */
.header { position: fixed; top: 0; left: 0; right: 0; z-index: 1200; pointer-events: auto; }
.bg-primary {
  background: linear-gradient(90deg, var(--ws-bg-dark, #0B1D39), var(--ws-brand-purple-dark, #4B2AD0));
  color: var(--ws-white, #FFFFFF);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 28px;
  border-radius: 0;
  box-shadow: 0 6px 24px rgba(11,17,40,0.25);
  border-bottom: 1px solid rgba(255,255,255,0.04);
}

.nav-items { display: flex; gap: 12px; align-items: center; }
.logo { height: 48px; width: auto; margin-bottom: 0.25rem; filter: drop-shadow(0 0 6px rgba(0,0,0,0.35)); }

.with-side .auth-content::before,
.auth-content::before {
  display: none !important;
}
.layout-flex:not(.with-side) .auth-content {
  margin-left: 0 !important;
}

/* Ajustes del contenido principal según si hay sidebar o no */
.with-side.main-content {
  margin-top: 64px; /* por el header */
  margin-left: 240px;
  padding: 2rem;
  flex: 1 0 auto;
  display: flex;
  justify-content: center; /* centrar horizontal */
  align-items: center;     /* centrar vertical */
  min-height: calc(100vh - 64px);
}

/* Cuando hay sidebar, empujar el contenido a la derecha y quitar el margin-top (la sidebar ocupa todo el alto) */
.with-side .main-content {
  margin-top: 0;
  margin-left: 290px;
  margin-right: 50px;
  min-height: 100vh;
  padding-top: 3.5rem;
  position: relative;
  background: transparent; /* permitimos pseudo-elemento para el panel central */
}

/* Pseudo elemento que sirve como "panel" central extendido (rellena la zona central) */
.with-side .main-content::before {
  content: "";
  position: fixed; /* fijo para cubrir toda el área visual restante */
  top: 0;
  left: 220px; /* empieza justo después del sidebar */
  right: 0; /* llega hasta el borde derecho del viewport */
  height: 100vh;
  background: linear-gradient(180deg, rgba(11,29,57,0.98), rgba(7,11,24,0.95));
  box-shadow: 0 18px 80px rgba(2,6,23,0.55), inset 0 -8px 30px rgba(8,14,28,0.28);
  border-radius: 0;
  z-index: 0; /* por debajo del contenido (contenido tendrá z-index 2) */
}

/* Asegurar que el contenido del router-view esté encima del pseudo-elemento */
.with-side .main-content > * { position: relative; z-index: 2; }

/* Mobile tweak: cuando la sidebar reduce su ancho, ajustar el inicio del panel fijo */
@media (max-width: 900px) {
  .side-nav { width: 80px; padding: 20px 10px; }
  .side-top .brand, .side-link span, .side-profile, .side-footer { display: none; }
  .side-link { justify-content: center; padding: 12px; }
  .with-side .main-content { margin-left: 80px; }
  .with-side .main-content::before { left: 80px; }
}

/* add email style */
.email { font-size: 12px; color: rgba(255,255,255,0.65); margin-top: 2px; }
</style>