// filepath: d:\Documentos\WebstormProjects\winesoft-frontendasa\src\identity\application\auth.store.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { BaseApi } from '../../shared/infrastructure/base-api.js';

const apiInstance = new BaseApi().http;

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const loading = ref(false);
  const error = ref('');

  function loadUserFromStorage() {
    try {
      const raw = localStorage.getItem('auth_user');
      user.value = raw ? JSON.parse(raw) : null;
    } catch (e) {
      user.value = null;
    }
  }

  loadUserFromStorage();

  function extractErrorMessage(e) {
    if (!e) return 'Unknown error';
    if (e.response && e.response.data) {
      if (typeof e.response.data === 'string') return e.response.data;
      if (e.response.data.message) return e.response.data.message;
      return JSON.stringify(e.response.data);
    }
    return e.message || String(e);
  }

  async function register(payload) {
    loading.value = true;
    error.value = '';
    try {
      const res = await apiInstance.post('/auth/register', payload);
      loading.value = false;
      return res.data;
    } catch (e) {
      loading.value = false;
      const msg = extractErrorMessage(e);
      error.value = msg;
      throw new Error(msg);
    }
  }

  async function login({ username, password }) {
    loading.value = true;
    error.value = '';
    try {
      const res = await apiInstance.post('/auth/login', { username, password });

      // Response can be JSON { token, username, email } or plain text token
      let token = null;
      let userObj = { username };

      if (res && res.data) {
        if (typeof res.data === 'string') {
          // try parse
          try {
            const parsed = JSON.parse(res.data);
            if (parsed && parsed.token) {
              token = parsed.token;
              userObj.username = parsed.username || username;
              userObj.email = parsed.email || null;
            } else {
              token = String(res.data).trim();
            }
          } catch (e) {
            token = String(res.data).trim();
          }
        } else if (typeof res.data === 'object') {
          if (res.data.token) {
            token = res.data.token;
            userObj.username = res.data.username || username;
            userObj.email = res.data.email || null;
          }
        }
      }

      if (!token) {
        loading.value = false;
        const message = 'Token not present in response';
        error.value = message;
        throw new Error(message);
      }

      try {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_user', JSON.stringify(userObj));
      } catch (e) {
        // ignore storage errors
      }

      apiInstance.defaults.headers = apiInstance.defaults.headers || {};
      if (apiInstance.defaults.headers.common) {
        apiInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
      } else {
        apiInstance.defaults.headers.common = { Authorization: `Bearer ${token}` };
      }

      user.value = userObj;
      loading.value = false;
      return userObj;
    } catch (e) {
      loading.value = false;
      const msg = extractErrorMessage(e);
      error.value = msg;
      throw new Error(msg);
    }
  }

  function logout() {
    try {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    } catch (e) {}
    if (apiInstance.defaults && apiInstance.defaults.headers && apiInstance.defaults.headers.common) {
      delete apiInstance.defaults.headers.common.Authorization;
    }
    user.value = null;
  }

  return { user, loading, error, register, login, logout };
});

