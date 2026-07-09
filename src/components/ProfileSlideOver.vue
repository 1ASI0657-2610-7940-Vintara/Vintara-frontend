<script setup>
import { ref, watch, computed } from 'vue'
import { useAuthStore } from '../store/auth'
import { useToastStore } from '../store/toast'
import { useInventoryAlerts } from '../composables/useInventoryAlerts'

const props = defineProps({
  show: { type: Boolean, required: true }
})
const emit = defineEmits(['close'])

const authStore = useAuthStore()
const toastStore = useToastStore()

const {
  lowStockThreshold,
  setLowStockThreshold,
  expiringWindowDays,
  setExpiringWindowDays
} = useInventoryAlerts()

// ---- Estado ----
const isLoading = ref(false)
const isSavingProfile = ref(false)
const isSavingPassword = ref(false)
const activeTab = ref('profile') // 'profile' | 'password'

// Form: profile
const formFullName = ref('')
const formEmail = ref('')
const formPhone = ref('')

// Form: password
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showCurrent = ref(false)
const showNew = ref(false)

// Preferencias (localStorage)
const preferences = ref({ emailAlerts: false, smsAlerts: false })

// Umbrales de inventario (localStorage vía composable)
const formThreshold = ref(lowStockThreshold.value)
const formExpiringDays = ref(expiringWindowDays.value)

const userInitials = computed(() => {
  const name = authStore.user?.fullName || authStore.user?.username || 'U'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
})
const displayName = computed(() => authStore.user?.fullName || authStore.user?.username || 'Usuario')
const displayUsername = computed(() => authStore.user?.username || '—')

const loadPreferences = () => {
  try {
    const stored = localStorage.getItem('user_preferences')
    if (stored) preferences.value = JSON.parse(stored)
  } catch {
    // ignore
  }
}

const loadProfileData = async () => {
  isLoading.value = true
  try {
    await authStore.fetchMe()
    formFullName.value = authStore.user?.fullName || ''
    formEmail.value = authStore.user?.email || ''
    formPhone.value = authStore.user?.phone || ''
  } catch {
    toastStore.error('No se pudieron cargar los datos del perfil.', 'Error')
  } finally {
    isLoading.value = false
  }
}

const resetPasswordForm = () => {
  currentPassword.value = ''
  newPassword.value = ''
  confirmPassword.value = ''
  showCurrent.value = false
  showNew.value = false
}

watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      activeTab.value = 'profile'
      loadPreferences()
      loadProfileData()
      resetPasswordForm()
      formThreshold.value = lowStockThreshold.value
      formExpiringDays.value = expiringWindowDays.value
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }
)

const handleClose = () => emit('close')

// ---- Guardar perfil ----
const handleSaveProfile = async () => {
  if (!formFullName.value.trim() && !formPhone.value.trim() && !formEmail.value.trim()) {
    toastStore.warning('Completa al menos un campo.', 'Sin cambios')
    return
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (formEmail.value && !emailRegex.test(formEmail.value)) {
    toastStore.warning('Ingresa un email válido.', 'Email inválido')
    return
  }

  isSavingProfile.value = true
  try {
    const result = await authStore.updateProfile({
      fullName: formFullName.value.trim(),
      phone: formPhone.value.trim(),
      email: formEmail.value.trim()
    })
    if (result.success) {
      // Guardar preferencias también
      localStorage.setItem('user_preferences', JSON.stringify(preferences.value))
      // Guardar umbrales
      setLowStockThreshold(formThreshold.value)
      setExpiringWindowDays(formExpiringDays.value)

      toastStore.success('Perfil actualizado correctamente.', 'Perfil')
      handleClose()
    } else {
      toastStore.error(result.message, 'Error')
    }
  } finally {
    isSavingProfile.value = false
  }
}

// ---- Cambiar contraseña ----
const handleChangePassword = async () => {
  if (!currentPassword.value || !newPassword.value || !confirmPassword.value) {
    toastStore.warning('Completa todos los campos.', 'Campos requeridos')
    return
  }
  if (newPassword.value.length < 6) {
    toastStore.warning('La nueva contraseña debe tener al menos 6 caracteres.', 'Contraseña corta')
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    toastStore.warning('Las contraseñas no coinciden.', 'Confirmación inválida')
    return
  }
  if (currentPassword.value === newPassword.value) {
    toastStore.warning('La nueva contraseña debe ser diferente a la actual.', 'Sin cambios')
    return
  }

  isSavingPassword.value = true
  const result = await authStore.changePassword({
    currentPassword: currentPassword.value,
    newPassword: newPassword.value
  })
  isSavingPassword.value = false

  if (result.success) {
    toastStore.success('Contraseña actualizada correctamente.', 'Contraseña')
    resetPasswordForm()
    activeTab.value = 'profile'
  } else {
    toastStore.error(result.message, 'Error')
  }
}
</script>

<template>
  <teleport to="body">
    <transition name="slide-overlay">
      <div
        v-if="show"
        class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[900]"
        @click="handleClose"
      ></div>
    </transition>

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

        <!-- Tabs -->
        <div class="flex border-b border-slate-100 bg-white">
          <button
            @click="activeTab = 'profile'"
            class="flex-1 py-3 font-label-md text-label-md transition-colors border-b-2"
            :class="activeTab === 'profile'
              ? 'border-rose-800 text-rose-800'
              : 'border-transparent text-slate-500 hover:text-slate-700'"
          >
            <span class="material-symbols-outlined text-[18px] align-middle mr-1">person</span>
            Datos
          </button>
          <button
            @click="activeTab = 'password'"
            class="flex-1 py-3 font-label-md text-label-md transition-colors border-b-2"
            :class="activeTab === 'password'
              ? 'border-rose-800 text-rose-800'
              : 'border-transparent text-slate-500 hover:text-slate-700'"
          >
            <span class="material-symbols-outlined text-[18px] align-middle mr-1">lock</span>
            Contraseña
          </button>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-6 space-y-6">
          <!-- Loading -->
          <div v-if="isLoading" class="h-full flex flex-col items-center justify-center gap-3">
            <div class="animate-spin rounded-full h-8 w-8 border-4 border-rose-800 border-t-transparent"></div>
            <p class="text-sm text-slate-500">Cargando datos...</p>
          </div>

          <!-- TAB: PROFILE -->
          <div v-else-if="activeTab === 'profile'" class="space-y-6">
            <!-- Avatar Card
            <div class="flex flex-col items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
              <div class="relative w-24 h-24 rounded-full overflow-hidden border-2 border-rose-800 shadow-sm bg-slate-200 mb-3 flex items-center justify-center">
                <span class="material-symbols-outlined text-[48px] text-slate-400">person</span>
              </div>
              <h4 class="font-bold text-slate-900 font-headline-sm text-[18px]">{{ displayName }}</h4>
              <p class="text-xs text-slate-500 mt-1">@{{ displayUsername }}</p>
            </div> -->
            <!-- Avatar Card -->
            <div class="flex flex-col items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
              <div class="relative w-24 h-24 rounded-full border-2 border-rose-800 shadow-sm bg-rose-800 text-white mb-3 flex items-center justify-center font-bold text-2xl">
                {{ userInitials }}
              </div>
              <h4 class="font-bold text-slate-900 font-headline-sm text-[18px]">{{ displayName }}</h4>
              <p class="text-xs text-slate-500 mt-1">@{{ displayUsername }}</p>
            </div>

            <!-- Editable Fields -->
            <div class="space-y-4">
              <div>
                <label class="block font-label-md text-label-md text-slate-700 mb-1.5" for="profile-fullname">Nombre Completo</label>
                <input
                  id="profile-fullname"
                  type="text"
                  v-model="formFullName"
                  :disabled="isSavingProfile"
                  placeholder="Ej: Juan Pérez"
                  class="w-full bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-800 focus:border-rose-800 font-body-md text-body-md text-slate-900 p-3 outline-none transition-all"
                />
              </div>

              <div>
                <label class="block font-label-md text-label-md text-slate-700 mb-1.5" for="profile-email">Correo Electrónico</label>
                <input
                  id="profile-email"
                  type="email"
                  v-model="formEmail"
                  :disabled="isSavingProfile"
                  placeholder="tu@empresa.com"
                  class="w-full bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-800 focus:border-rose-800 font-body-md text-body-md text-slate-900 p-3 outline-none transition-all"
                />
              </div>

              <div>
                <label class="block font-label-md text-label-md text-slate-700 mb-1.5" for="profile-phone">Teléfono</label>
                <input
                  id="profile-phone"
                  type="tel"
                  v-model="formPhone"
                  :disabled="isSavingProfile"
                  placeholder="Ej: 999888777"
                  class="w-full bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-800 focus:border-rose-800 font-body-md text-body-md text-slate-900 p-3 outline-none transition-all"
                />
              </div>
            </div>

            <!-- Preferences -->
            <div class="border-t border-slate-100 pt-6">
              <h4 class="font-semibold font-label-md text-slate-900 mb-4 flex items-center gap-2">
                <span class="material-symbols-outlined text-[20px] text-rose-800">notifications_active</span>
                Preferencias de Alerta
              </h4>

              <div class="space-y-4">
                <div class="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div class="flex flex-col">
                    <span class="font-label-md text-label-md text-slate-900 font-semibold">Notificaciones por Email</span>
                    <span class="text-[11px] text-slate-500">Recibe resúmenes de alerta en tu email</span>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer select-none">
                    <input type="checkbox" v-model="preferences.emailAlerts" class="sr-only peer" />
                    <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-800 relative"></div>
                  </label>
                </div>

                <div class="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div class="flex flex-col">
                    <span class="font-label-md text-label-md text-slate-900 font-semibold">Notificaciones por SMS</span>
                    <span class="text-[11px] text-slate-500">Alertas críticas instantáneas en tu celular</span>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer select-none">
                    <input type="checkbox" v-model="preferences.smsAlerts" class="sr-only peer" />
                    <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-800 relative"></div>
                  </label>
                </div>
              </div>
            </div>

            <!-- Umbrales de Inventario -->
            <div class="border-t border-slate-100 pt-6">
              <h4 class="font-semibold font-label-md text-slate-900 mb-4 flex items-center gap-2">
                <span class="material-symbols-outlined text-[20px] text-rose-800">tune</span>
                Umbrales de Inventario
              </h4>

              <div class="space-y-4">
                <div class="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <label class="block font-label-md text-label-md text-slate-900 font-semibold mb-1" for="threshold-stock">
                    Alerta de stock bajo
                  </label>
                  <p class="text-[11px] text-slate-500 mb-2">
                    Insumos con cantidad ≤ este número se marcan como "Stock bajo"
                  </p>
                  <div class="flex items-center gap-2">
                    <input
                      id="threshold-stock"
                      type="number"
                      min="0"
                      v-model.number="formThreshold"
                      class="w-24 bg-white border border-slate-200 rounded-lg p-2 outline-none focus:ring-2 focus:ring-rose-800"
                    />
                    <span class="text-sm text-slate-500">unidades</span>
                  </div>
                </div>

                <div class="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <label class="block font-label-md text-label-md text-slate-900 font-semibold mb-1" for="threshold-expiring">
                    Ventana de vencimiento
                  </label>
                  <p class="text-[11px] text-slate-500 mb-2">
                    Días de anticipación para alertar sobre vencimientos
                  </p>
                  <div class="flex items-center gap-2">
                    <input
                      id="threshold-expiring"
                      type="number"
                      min="1"
                      v-model.number="formExpiringDays"
                      class="w-24 bg-white border border-slate-200 rounded-lg p-2 outline-none focus:ring-2 focus:ring-rose-800"
                    />
                    <span class="text-sm text-slate-500">días</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB: PASSWORD -->
          <div v-else-if="activeTab === 'password'" class="space-y-5">
            <div class="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-start gap-3">
              <span class="material-symbols-outlined text-rose-800 mt-0.5 flex-shrink-0 text-[20px]">shield</span>
              <p class="text-[13px] text-rose-900 leading-relaxed">
                Cambiar tu contraseña te desconectará de otros dispositivos. Usa una contraseña de al menos 6 caracteres.
              </p>
            </div>

            <div>
              <label class="block font-label-md text-label-md text-slate-700 mb-1.5" for="pw-current">Contraseña Actual</label>
              <div class="relative">
                <input
                  id="pw-current"
                  :type="showCurrent ? 'text' : 'password'"
                  v-model="currentPassword"
                  :disabled="isSavingPassword"
                  autocomplete="current-password"
                  class="w-full bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-800 focus:border-rose-800 font-body-md text-body-md text-slate-900 p-3 pr-10 outline-none"
                />
                <button
                  type="button"
                  @click="showCurrent = !showCurrent"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  <span class="material-symbols-outlined text-[18px]">{{ showCurrent ? 'visibility' : 'visibility_off' }}</span>
                </button>
              </div>
            </div>

            <div>
              <label class="block font-label-md text-label-md text-slate-700 mb-1.5" for="pw-new">Nueva Contraseña</label>
              <div class="relative">
                <input
                  id="pw-new"
                  :type="showNew ? 'text' : 'password'"
                  v-model="newPassword"
                  :disabled="isSavingPassword"
                  autocomplete="new-password"
                  placeholder="Mínimo 6 caracteres"
                  class="w-full bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-800 focus:border-rose-800 font-body-md text-body-md text-slate-900 p-3 pr-10 outline-none"
                />
                <button
                  type="button"
                  @click="showNew = !showNew"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  <span class="material-symbols-outlined text-[18px]">{{ showNew ? 'visibility' : 'visibility_off' }}</span>
                </button>
              </div>
            </div>

            <div>
              <label class="block font-label-md text-label-md text-slate-700 mb-1.5" for="pw-confirm">Confirmar Nueva Contraseña</label>
              <input
                id="pw-confirm"
                :type="showNew ? 'text' : 'password'"
                v-model="confirmPassword"
                :disabled="isSavingPassword"
                autocomplete="new-password"
                placeholder="Repite la nueva contraseña"
                class="w-full bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-800 focus:border-rose-800 font-body-md text-body-md text-slate-900 p-3 outline-none"
              />
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
          <button
            @click="handleClose"
            :disabled="isSavingProfile || isSavingPassword"
            class="px-4 py-2.5 text-slate-600 hover:bg-slate-100 font-label-md text-label-md rounded-xl transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            v-if="activeTab === 'profile'"
            @click="handleSaveProfile"
            :disabled="isSavingProfile || isLoading"
            class="bg-rose-800 hover:bg-rose-900 text-white font-label-md text-label-md py-2.5 px-6 rounded-xl shadow-sm transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
          >
            <span v-if="isSavingProfile" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
            <span v-else class="material-symbols-outlined text-[18px]">save</span>
            {{ isSavingProfile ? 'Guardando...' : 'Guardar Cambios' }}
          </button>

          <button
            v-else
            @click="handleChangePassword"
            :disabled="isSavingPassword"
            class="bg-rose-800 hover:bg-rose-900 text-white font-label-md text-label-md py-2.5 px-6 rounded-xl shadow-sm transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
          >
            <span v-if="isSavingPassword" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
            <span v-else class="material-symbols-outlined text-[18px]">lock_reset</span>
            {{ isSavingPassword ? 'Cambiando...' : 'Cambiar Contraseña' }}
          </button>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<style scoped>
.slide-overlay-enter-active,
.slide-overlay-leave-active {
  transition: opacity 0.3s ease;
}
.slide-overlay-enter-from,
.slide-overlay-leave-to {
  opacity: 0;
}

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