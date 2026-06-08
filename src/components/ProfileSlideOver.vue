<script setup>
import { ref, watch } from 'vue'
import axios from 'axios'
import { useToastStore } from '../store/toast'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['close'])

const toastStore = useToastStore()
const profile = ref({
  name: '',
  email: '',
  role: '',
  avatar: '',
  preferences: {
    emailAlerts: false,
    smsAlerts: false
  }
})

const isLoading = ref(false)
const isSaving = ref(false)

const fetchProfile = async () => {
  isLoading.value = true
  try {
    const response = await axios.get('/mocks/profile.json')
    profile.value = response.data
  } catch (error) {
    console.error('Error fetching profile:', error)
    toastStore.error('No se pudieron cargar los datos de perfil.', 'Error')
  } finally {
    isLoading.value = false
  }
}

watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      fetchProfile()
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }
)

const handleClose = () => {
  emit('close')
}

const handleSave = async () => {
  isSaving.value = true
  try {
    // Simulated POST request via the global axios interceptor
    await axios.post('/mocks/profile.json', profile.value)
    
    toastStore.success('El perfil y sus preferencias fueron guardados.', 'Perfil Actualizado')
    handleClose()
  } catch (error) {
    console.error('Error saving profile:', error)
    toastStore.error('Ocurrió un error al guardar el perfil.', 'Error')
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <teleport to="body">
    <!-- Overlay Backdrop -->
    <transition name="slide-overlay">
      <div
        v-if="show"
        class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[900]"
        @click="handleClose"
      ></div>
    </transition>

    <!-- Slide Over Panel -->
    <transition name="slide-panel">
      <div
        v-if="show"
        class="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white border-l border-slate-100 shadow-2xl z-[910] flex flex-col h-full text-slate-900"
      >
        <!-- Header -->
        <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 class="font-semibold font-headline-sm text-headline-sm text-slate-900">
              Mi Perfil
            </h3>
            <p class="text-xs text-slate-500 font-medium">Configuración de Cuenta & Alertas</p>
          </div>
          <button
            @click="handleClose"
            class="text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-full hover:bg-slate-100 flex items-center justify-center"
            aria-label="Cerrar panel"
          >
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <!-- Scrollable content -->
        <div class="flex-1 overflow-y-auto p-6 space-y-6">
          <!-- Loading State -->
          <div v-if="isLoading" class="h-full flex flex-col items-center justify-center gap-3">
            <div class="animate-spin rounded-full h-8 w-8 border-4 border-rose-800 border-t-transparent"></div>
            <p class="text-sm text-slate-500">Cargando datos de perfil...</p>
          </div>

          <div v-else class="space-y-6">
            <!-- User Avatar & Basic Info Card -->
            <div class="flex flex-col items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
              <div class="relative w-24 h-24 rounded-full overflow-hidden border-2 border-rose-800 shadow-sm bg-slate-200 mb-3">
                <img
                  v-if="profile.avatar"
                  :src="profile.avatar"
                  alt="Avatar de usuario"
                  class="w-full h-full object-cover"
                />
                <span v-else class="material-symbols-outlined text-[48px] text-slate-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  person
                </span>
              </div>
              <h4 class="font-bold text-slate-900 font-headline-sm text-[18px]">{{ profile.name }}</h4>
              <p class="text-xs text-rose-800 font-semibold bg-rose-50 px-2.5 py-0.5 rounded-full mt-1 border border-rose-100 uppercase tracking-wider">
                {{ profile.role }}
              </p>
            </div>

            <!-- Form Fields -->
            <div class="space-y-4">
              <div>
                <label class="block font-label-md text-label-md text-slate-700 mb-1.5" for="profile-name">Nombre Completo</label>
                <input
                  id="profile-name"
                  type="text"
                  v-model="profile.name"
                  class="w-full bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-800 focus:border-rose-800 font-body-md text-body-md text-slate-900 p-3 outline-none transition-all"
                />
              </div>

              <div>
                <label class="block font-label-md text-label-md text-slate-700 mb-1.5" for="profile-email">Correo Electrónico</label>
                <input
                  id="profile-email"
                  type="email"
                  v-model="profile.email"
                  class="w-full bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-800 focus:border-rose-800 font-body-md text-body-md text-slate-900 p-3 outline-none transition-all"
                />
              </div>
            </div>

            <!-- Preference switches section -->
            <div class="border-t border-slate-100 pt-6">
              <h4 class="font-semibold font-label-md text-slate-900 mb-4 flex items-center gap-2">
                <span class="material-symbols-outlined text-[20px] text-rose-800">notifications_active</span>
                Preferencias de Alerta
              </h4>
              
              <div class="space-y-4">
                <!-- Email switch -->
                <div class="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div class="flex flex-col">
                    <span class="font-label-md text-label-md text-slate-900 font-semibold">Notificaciones por Email</span>
                    <span class="text-[11px] text-slate-500">Recibe resúmenes de alerta en tu email</span>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      v-model="profile.preferences.emailAlerts"
                      class="sr-only peer"
                    />
                    <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-800 relative"></div>
                  </label>
                </div>

                <!-- SMS switch -->
                <div class="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div class="flex flex-col">
                    <span class="font-label-md text-label-md text-slate-900 font-semibold">Notificaciones por SMS</span>
                    <span class="text-[11px] text-slate-500">Alertas críticas instantáneas en tu celular</span>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      v-model="profile.preferences.smsAlerts"
                      class="sr-only peer"
                    />
                    <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-800 relative"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
          <button
            @click="handleClose"
            :disabled="isSaving"
            class="px-4 py-2.5 text-slate-600 hover:bg-slate-100 font-label-md text-label-md rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="handleSave"
            :disabled="isSaving || isLoading"
            class="bg-rose-800 hover:bg-rose-900 text-white font-label-md text-label-md py-2.5 px-6 rounded-xl shadow-sm transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
          >
            <span v-if="isSaving" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
            <span v-else class="material-symbols-outlined text-[18px]">save</span>
            {{ isSaving ? 'Guardando...' : 'Guardar Cambios' }}
          </button>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<style scoped>
/* Overlay transitions */
.slide-overlay-enter-active,
.slide-overlay-leave-active {
  transition: opacity 0.3s ease;
}
.slide-overlay-enter-from,
.slide-overlay-leave-to {
  opacity: 0;
}

/* Panel transitions */
.slide-panel-enter-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-panel-leave-active {
  transition: transform 0.2s ease;
}
.slide-panel-enter-from,
.slide-panel-leave-to {
  transform: translateX(100%);
}
</style>
