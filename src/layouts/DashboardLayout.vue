<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/auth/application/auth.store'
import { useIotStore } from '@/iot/application/iot.store'
import { useToastStore } from '@/shared/application/toast.store'
import { useSensorAlerts } from '@/iot/presentation/composables/useSensorAlerts'
import ProfileSlideOver from '@/profiles/presentation/components/ProfileSlideOver.vue'
import { computed } from 'vue'

const router = useRouter()
const authStore = useAuthStore()
const alertsStore = useIotStore()
const toastStore = useToastStore()
const showProfile = ref(false)

// Iniciar el polling de alertas a nivel de layout para que el badge siempre esté actualizado
const { alerts, serviceOffline, startPolling, stopPolling } = useSensorAlerts(5000)

// Callback cuando llega una nueva alerta CRITICAL no notificada antes
const handleNewCritical = (alert) => {
  toastStore.error(
    `Sensor "${alert.deviceId}" reporta ${alert.value}${alert.unit} — ${alert.sensorType.toUpperCase()}`,
    '🚨 Alerta Crítica IoT'
  )
}

import { onMounted, onUnmounted } from 'vue'
onMounted(() => startPolling(handleNewCritical))
onUnmounted(() => stopPolling())

// Sincronizar el store global con los datos del composable
watch(alerts, (newAlerts) => alertsStore.setAlerts(newAlerts))
watch(serviceOffline, (val) => alertsStore.setServiceOffline(val))


const userInitials = computed(() => {
  const name = authStore.user?.fullName || authStore.user?.username || 'U'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
})

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>


<template>
  <div class="flex h-screen w-screen bg-background text-on-background antialiased overflow-hidden">
    <!-- SideNavBar -->
    <aside class="fixed left-0 top-0 h-full w-64 bg-inverse-surface text-primary border-r border-outline-variant shadow-md flex flex-col py-6 z-20">
      <div class="px-6 mb-8">
        <h1 class="font-headline-md text-headline-md font-bold text-surface-bright">WineSoft</h1>
        <p class="font-body-sm text-body-sm text-surface-variant opacity-80">Precision Viticulture</p>
      </div>
      
      <div class="flex-1 flex flex-col gap-1 overflow-y-auto">
        <!-- Dashboard Link -->
        <router-link 
          to="/dashboard" 
          :class="[
            $route.path === '/dashboard' 
              ? 'bg-primary text-on-primary rounded-lg mx-2 my-1 flex items-center gap-3 px-4 py-3 opacity-90 transition-all duration-200' 
              : 'text-surface-variant hover:text-surface-bright mx-2 my-1 flex items-center gap-3 px-4 py-3 transition-colors hover:bg-primary-container hover:text-on-primary-container rounded-lg'
          ]"
        >
          <span class="material-symbols-outlined" :style="$route.path === '/dashboard' ? 'font-variation-settings: \'FILL\' 1;' : ''">dashboard</span>
          <span class="font-label-md text-label-md">Dashboard</span>
        </router-link>

        <!-- Assets Link -->
        <router-link 
          to="/assets" 
          :class="[
            $route.path === '/assets' 
              ? 'bg-primary text-on-primary rounded-lg mx-2 my-1 flex items-center gap-3 px-4 py-3 opacity-90 transition-all duration-200' 
              : 'text-surface-variant hover:text-surface-bright mx-2 my-1 flex items-center gap-3 px-4 py-3 transition-colors hover:bg-primary-container hover:text-on-primary-container rounded-lg'
          ]"
        >
          <span class="material-symbols-outlined" :style="$route.path === '/assets' ? 'font-variation-settings: \'FILL\' 1;' : ''">inventory_2</span>
          <span class="font-label-md text-label-md">Inventario</span>
        </router-link>

        <!-- Telemetry Link -->
        <router-link 
          to="/telemetry" 
          :class="[
            $route.path === '/telemetry' 
              ? 'bg-primary text-on-primary rounded-lg mx-2 my-1 flex items-center gap-3 px-4 py-3 opacity-90 transition-all duration-200' 
              : 'text-surface-variant hover:text-surface-bright mx-2 my-1 flex items-center gap-3 px-4 py-3 transition-colors hover:bg-primary-container hover:text-on-primary-container rounded-lg'
          ]"
        >
          <span class="material-symbols-outlined" :style="$route.path === '/telemetry' ? 'font-variation-settings: \'FILL\' 1;' : ''">sensors</span>
          <span class="font-label-md text-label-md">IoT Sensores</span>
        </router-link>

        <!-- Compliance Link -->
        <!--<router-link 
          to="/compliance" 
          :class="[
            $route.path === '/compliance' 
              ? 'bg-primary text-on-primary rounded-lg mx-2 my-1 flex items-center gap-3 px-4 py-3 opacity-90 transition-all duration-200' 
              : 'text-surface-variant hover:text-surface-bright mx-2 my-1 flex items-center gap-3 px-4 py-3 transition-colors hover:bg-primary-container hover:text-on-primary-container rounded-lg'
          ]"
        >
          <span class="material-symbols-outlined" :style="$route.path === '/compliance' ? 'font-variation-settings: \'FILL\' 1;' : ''">check_circle</span>
          <span class="font-label-md text-label-md">Cumplimiento</span>
        </router-link>-->

        <!-- Reports Link -->
        <router-link 
          to="/reports" 
          :class="[
            $route.path === '/reports' 
              ? 'bg-primary text-on-primary rounded-lg mx-2 my-1 flex items-center gap-3 px-4 py-3 opacity-90 transition-all duration-200' 
              : 'text-surface-variant hover:text-surface-bright mx-2 my-1 flex items-center gap-3 px-4 py-3 transition-colors hover:bg-primary-container hover:text-on-primary-container rounded-lg'
          ]"
        >
          <span class="material-symbols-outlined" :style="$route.path === '/reports' ? 'font-variation-settings: \'FILL\' 1;' : ''">bar_chart</span>
          <span class="font-label-md text-label-md">Reportes</span>
        </router-link>
      </div>

      <!-- Action Button & Footer Links in Sidebar -->
      <div class="px-4 mt-auto">
        <button 
          @click="handleLogout"
          class="w-full bg-primary hover:bg-primary-container text-on-primary hover:text-on-primary-container font-label-md text-label-md py-3 rounded-lg transition-colors flex items-center justify-center gap-2 mb-4"
        >
          <span class="material-symbols-outlined text-[18px]">logout</span>
          Cerrar Sesión
        </button>
        
        <div class="flex flex-col gap-1 border-t border-outline-variant/30 pt-4">
          <div class="text-surface-variant mx-2 py-1 text-center font-body-sm text-[12px] opacity-65">
            WineSoft v1.0.0
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content Wrapper -->
    <div class="flex-1 ml-64 flex flex-col min-h-screen overflow-hidden">
      <!-- TopAppBar -->
      <header class="docked full-width top-0 bg-surface border-b border-outline-variant flat no shadows flex justify-between items-center h-16 px-6 z-10 w-full flex-shrink-0">
        <div class="flex items-center gap-4">
          <h2 class="font-headline-sm text-headline-sm font-bold text-primary hidden md:block">WineSoft</h2>
          <div class="h-4 w-px bg-outline-variant hidden md:block"></div>
          <nav class="flex text-on-surface-variant font-medium font-label-md text-label-md gap-4">
            <span class="text-primary font-bold border-b-2 border-primary pb-1">{{ $route.name }}</span>
          </nav>
        </div>
        
        <div class="flex items-center gap-4">
          <!-- <div class="relative hidden md:block">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-70">search</span>
            <input 
              class="pl-10 pr-4 py-2 bg-surface-container rounded-full border-none focus:ring-2 focus:ring-primary-container transition-all font-body-sm text-body-sm w-64 text-on-surface placeholder:text-on-surface-variant/70 outline-none" 
              placeholder="Buscar..." 
              type="text"
            />
          </div> -->

          <!-- Notifications Bell with functional critical badge -->
          <button
            @click="router.push('/telemetry')"
            :title="alertsStore.criticalCount > 0 ? `${alertsStore.criticalCount} alerta(s) crítica(s) no reconocidas` : 'Sin alertas críticas'"
            class="p-2 text-on-surface-variant hover:text-primary transition-colors focus:ring-2 focus:ring-primary-container rounded-full relative"
          >
            <span
              class="material-symbols-outlined"
              :style="alertsStore.criticalCount > 0 ? 'font-variation-settings: \'FILL\' 1;' : ''"
            >notifications</span>
            <!-- Badge: solo visible cuando hay alertas críticas no reconocidas -->
            <transition name="badge-pop">
              <span
                v-if="alertsStore.criticalCount > 0"
                class="absolute -top-1 -right-1 min-w-[20px] h-5 bg-error text-on-error text-[10px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-surface"
              >
                {{ alertsStore.criticalCount > 99 ? '99+' : alertsStore.criticalCount }}
              </span>
            </transition>
          </button>
          
          <div 
            @click="showProfile = true"
            class="flex items-center gap-2 border-l border-outline-variant/50 pl-4 cursor-pointer hover:opacity-80 transition-opacity group"
          >
            <div class="text-right hidden sm:block">
              <p class="font-label-md text-label-md text-on-surface font-semibold leading-tight group-hover:text-primary transition-colors">{{ authStore.user?.name }}</p>
              <p class="font-body-sm text-[12px] text-on-surface-variant capitalize">{{ authStore.user?.role }}</p>
            </div>
            <!-- <div class="h-8 w-8 rounded-full bg-surface-variant border border-outline-variant overflow-hidden flex-shrink-0 group-hover:border-primary transition-colors">
              <img 
                alt="Perfil de Usuario" 
                class="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBU0ff2ZhQpK7ML8y70Pumm2U_znsKmHUNpCpAt5tuzuIBEUfI8uMtdrops5MKtdj6QgeQR1AbYRtHLpdq2eB9-DDbErG3kO98k-miAVaBjrLUDcuROLMmH8knLk9sNUk0V_ZdolSdp-Bmg1PQgISVOvdYrzKOUtqRgS7QuTMtmk2VYEfxpKMjY1TW1QQwqGxkUPnge4JyHws1cD8Q5vQj1KhUiZXdOxT-pf4YNfStNRluRoSJZR0u9FzI6hxt-f7ZMve8Z9KkTNg"
              />
            </div> -->
            <div class="h-8 w-8 rounded-full bg-primary text-on-primary border border-outline-variant flex-shrink-0 group-hover:border-primary transition-colors flex items-center justify-center font-semibold text-sm">
              {{ userInitials }}
            </div>
          </div>
        </div>
      </header>

      <!-- IoT Service Offline Banner -->
      <transition name="banner-slide">
        <div
          v-if="alertsStore.serviceOffline"
          class="flex items-center gap-3 bg-amber-50 border-b border-amber-200 px-6 py-3 text-amber-800"
        >
          <span
            class="material-symbols-outlined text-amber-600 text-[20px]"
            style="font-variation-settings: 'FILL' 1;"
          >wifi_off</span>
          <p class="font-label-md text-label-md flex-1">
            <strong>Servicio IoT no disponible.</strong> Reintentando conexión con el monitor de sensores...
          </p>
          <span class="font-body-sm text-[12px] text-amber-600 animate-pulse">Reconectando...</span>
        </div>
      </transition>

      <!-- Main Content Area -->
      <main class="flex-1 bg-surface-container-low p-8 overflow-y-auto">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>

  <!-- Profile Slide-Over Panel -->
  <ProfileSlideOver :show="showProfile" @close="showProfile = false" />
</template>


<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Badge pop animation */
.badge-pop-enter-active {
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.badge-pop-leave-active {
  transition: all 0.15s ease-in;
}
.badge-pop-enter-from,
.badge-pop-leave-to {
  opacity: 0;
  transform: scale(0);
}

/* Service offline banner animation */
.banner-slide-enter-active,
.banner-slide-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}
.banner-slide-enter-from,
.banner-slide-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}
.banner-slide-enter-to,
.banner-slide-leave-from {
  max-height: 80px;
}
</style>
