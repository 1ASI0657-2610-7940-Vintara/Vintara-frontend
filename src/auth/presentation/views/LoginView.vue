<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../application/auth.store'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const rememberMe = ref(false)
const showPassword = ref(false)
const isLoading = ref(false)
const errorMsg = ref('')

const handleLogin = async () => {
  errorMsg.value = ''
  isLoading.value = true

  try {
    const success = await authStore.login({
      username: username.value,
      password: password.value
    })

    if (success) {
      if (rememberMe.value) {
        localStorage.setItem('remembered_username', username.value)
      } else {
        localStorage.removeItem('remembered_username')
      }
      router.push('/dashboard')
    } else {
      errorMsg.value = 'Credenciales incorrectas. Verifique su usuario y contraseña.'
    }
  } catch (error) {
    console.error('Login error:', error)
    errorMsg.value = 'Ocurrió un error al intentar iniciar sesión. Por favor intente más tarde.'
  } finally {
    isLoading.value = false
  }
}

// Pre-fill username if it was remembered
const storedUsername = localStorage.getItem('remembered_username')
if (storedUsername) {
  username.value = storedUsername
  rememberMe.value = true
}
</script>

<template>
  <div class="flex w-full min-h-screen bg-background text-on-surface antialiased">
    <!-- Left Column: Branding (Hidden on mobile) -->
    <div class="hidden lg:flex w-1/2 bg-primary relative flex-col justify-between overflow-hidden p-12">
      <div class="absolute inset-0 opacity-10 pointer-events-none" style="background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 32px 32px;"></div>

      <div class="relative z-10 flex items-center space-x-3">
        <span class="material-symbols-outlined text-4xl text-on-primary" data-weight="fill">sensors</span>
        <span class="font-headline-md text-headline-md text-on-primary">WineSoft</span>
      </div>

      <div class="relative z-10 max-w-md">
        <h1 class="font-headline-xl text-headline-xl text-on-primary mb-6 leading-tight">Control total de tu cadena de frío</h1>
        <p class="font-body-lg text-body-lg text-primary-fixed-dim opacity-90">
          Monitoreo IoT avanzado para viñedos. Asegura la calidad de tus procesos con datos precisos y análisis en tiempo real.
        </p>
      </div>

      <div class="relative z-10 mt-12 w-full h-64 bg-primary-container rounded-xl border border-outline border-opacity-30 overflow-hidden shadow-2xl transform translate-x-8 translate-y-8 flex">
        <div class="w-1/4 bg-primary-fixed-variant opacity-50 border-r border-outline border-opacity-20 p-4 flex flex-col gap-4">
          <div class="h-4 bg-outline-variant bg-opacity-30 rounded w-full"></div>
          <div class="h-4 bg-outline-variant bg-opacity-30 rounded w-3/4"></div>
          <div class="h-4 bg-outline-variant bg-opacity-30 rounded w-5/6"></div>
        </div>
        <div class="w-3/4 p-6 flex flex-col gap-6">
          <div class="h-8 bg-outline-variant bg-opacity-20 rounded w-1/3"></div>
          <div class="flex-1 bg-outline-variant bg-opacity-10 rounded-lg flex items-end p-4 gap-2">
            <div class="w-1/6 bg-on-primary-container bg-opacity-80 rounded-t-sm h-[40%]"></div>
            <div class="w-1/6 bg-on-primary-container bg-opacity-60 rounded-t-sm h-[70%]"></div>
            <div class="w-1/6 bg-on-primary-container bg-opacity-90 rounded-t-sm h-[55%]"></div>
            <div class="w-1/6 bg-on-primary-container bg-opacity-50 rounded-t-sm h-[30%]"></div>
            <div class="w-1/6 bg-on-primary-container bg-opacity-70 rounded-t-sm h-[85%]"></div>
            <div class="w-1/6 bg-on-primary-container bg-opacity-100 rounded-t-sm h-[60%]"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Column: Form -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 bg-surface-container-lowest relative">
      <div class="absolute top-8 left-8 flex lg:hidden items-center space-x-2">
        <span class="material-symbols-outlined text-2xl text-primary" data-weight="fill">sensors</span>
        <span class="font-headline-sm text-headline-sm text-primary font-bold">WineSoft</span>
      </div>

      <div class="w-full max-w-md">
        <div class="mb-10 text-center lg:text-left">
          <h2 class="font-headline-lg text-headline-lg text-on-surface mb-2">Bienvenido de nuevo</h2>
          <p class="font-body-md text-body-md text-on-surface-variant">Ingresa tus credenciales para acceder al panel.</p>
        </div>

        <transition name="fade">
          <div v-if="errorMsg" class="mb-6 p-4 rounded-lg bg-error-container text-on-error-container border border-error/20 flex items-start space-x-3">
            <span class="material-symbols-outlined text-error mt-0.5">error</span>
            <div class="text-body-sm font-medium">{{ errorMsg }}</div>
          </div>
        </transition>

        <form class="space-y-6" @submit.prevent="handleLogin">
          <!-- Username Input -->
          <div>
            <label class="block font-label-md text-label-md text-on-surface mb-1" for="username">Usuario</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span class="material-symbols-outlined text-outline">person</span>
              </div>
              <input
                id="username"
                name="username"
                type="text"
                autocomplete="username"
                placeholder="Usuario"
                required
                v-model="username"
                :disabled="isLoading"
                class="w-full pl-10 pr-4 py-3 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-body-md text-body-md text-on-surface placeholder-on-surface-variant transition-colors outline-none"
              />
            </div>
          </div>

          <!-- Password Input -->
          <div>
            <label class="block font-label-md text-label-md text-on-surface mb-1" for="password">Contraseña</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span class="material-symbols-outlined text-outline">lock</span>
              </div>
              <input
                :type="showPassword ? 'text' : 'password'"
                id="password"
                name="password"
                autocomplete="current-password"
                placeholder="••••••••"
                required
                v-model="password"
                :disabled="isLoading"
                class="w-full pl-10 pr-10 py-3 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-body-md text-body-md text-on-surface placeholder-on-surface-variant transition-colors outline-none"
              />
              <button
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-on-surface focus:outline-none"
                type="button"
                @click="showPassword = !showPassword"
              >
                <span class="material-symbols-outlined">{{ showPassword ? 'visibility' : 'visibility_off' }}</span>
              </button>
            </div>
          </div>

          <!-- Options Row -->
          <div class="flex items-center justify-between mt-4">
            <div class="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                v-model="rememberMe"
                :disabled="isLoading"
                class="h-4 w-4 text-primary focus:ring-primary border-outline-variant rounded cursor-pointer"
              />
              <label class="ml-2 block font-body-sm text-body-sm text-on-surface-variant cursor-pointer select-none" for="remember-me">
                Recordarme
              </label>
            </div>
            <div class="text-sm">
              <a class="font-label-md text-label-md text-primary hover:text-primary-container transition-colors" href="#" @click.prevent="errorMsg = 'Por favor, contacte a su administrador de sistemas para recuperar su contraseña.'">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </div>

          <!-- Submit Button -->
          <button
            class="w-full h-touch-target flex justify-center items-center px-4 border border-transparent rounded-lg shadow-sm font-label-md text-label-md text-on-primary bg-primary hover:bg-primary-container focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all mt-8 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="flex items-center space-x-2">
              <svg class="animate-spin h-5 w-5 text-on-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Verificando...</span>
            </span>
            <span v-else>Iniciar Sesión</span>
          </button>

        </form>

        <p class="mt-8 text-center font-body-sm text-body-sm text-on-surface-variant">
          ¿No tienes una cuenta? <router-link to="/register" class="font-label-md text-label-md text-primary hover:text-primary-container transition-colors">Regístrate</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
