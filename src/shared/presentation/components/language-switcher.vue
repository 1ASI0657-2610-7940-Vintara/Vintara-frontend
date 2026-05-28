<script setup>
import {useI18n} from "vue-i18n";
import { computed, watchEffect } from 'vue';
import i18n from '../../../i18n.js';

const i18nHook = useI18n();
const { locale, availableLocales: hookAvailable } = i18nHook || {};

let rawAvailable = [];
if (Array.isArray(hookAvailable) && hookAvailable.length > 0) {
  rawAvailable = hookAvailable;
} else if (Array.isArray(i18n.global && i18n.global.availableLocales) && i18n.global.availableLocales.length > 0) {
  rawAvailable = i18n.global.availableLocales;
} else {
  try {
    const possible = i18n.global && i18n.global.messages ? i18n.global.messages : null;
    if (possible && typeof possible === 'object') {
      rawAvailable = Object.keys(possible);
    }
  } catch (e) {
    rawAvailable = [];
  }
}

const locales = computed(() => Array.from(new Set(rawAvailable)).map(l => ({ code: String(l), short: String(l).split('-')[0] })));

const currentFull = computed(() => (locale && locale.value) || (i18n && i18n.global && i18n.global.locale && i18n.global.locale.value) || 'en');
const currentShort = computed(() => String(currentFull.value).split('-')[0]);

try { watchEffect(() => console.log('[language-switcher] locales ->', locales.value, ' currentShort ->', currentShort.value)); } catch(e) {}

function setLocale(l) {
  try { if (locale) locale.value = l; } catch(e) {}
  try { i18n.global.locale.value = l; } catch(e) {}
  // debug
  try { console.log('[language-switcher] setLocale ->', l); } catch(e) {}
}
</script>

<template>
  <div class="language-switcher" role="tablist" aria-label="Language switcher">
    <button
      v-for="(loc, i) in locales"
      :key="loc.code"
      :class="['lang-btn', { active: currentShort === loc.short, 'first': i === 0, 'last': i === locales.length - 1 } ]"
      @click="setLocale(loc.code)"
      :aria-pressed="currentShort === loc.short"
      role="tab"
    >
      {{ String(loc.short).toUpperCase() }}
    </button>
  </div>
</template>

<style scoped>
.language-switcher {
  display: inline-flex;
  gap: 0;
  align-items: center;
  background: rgba(255,255,255,0.04);
  border-radius: 10px;
  overflow: hidden;
  padding: 4px;
  box-sizing: border-box;
}
.lang-btn {
  background: transparent;
  color: var(--ws-white);
  border: none;
  padding: 8px 12px;
  cursor: pointer;
  font-weight: 700;
  text-transform: uppercase;
  font-size: 0.9rem;
  transition: background-color 120ms ease, color 120ms ease, box-shadow 120ms ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.lang-btn:not(.active):hover {
  background: rgba(255,255,255,0.02);
}
.lang-btn.active {
  background: var(--ws-white);
  color: var(--ws-brand-purple-dark);
  box-shadow: 0 6px 18px rgba(75,42,208,0.12);
}
.lang-btn.first {
  border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;
}
.lang-btn.last {
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
}
</style>
