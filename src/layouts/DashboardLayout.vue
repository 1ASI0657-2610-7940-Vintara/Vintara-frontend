<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'
import ProfileSlideOver from '../components/ProfileSlideOver.vue'

const router = useRouter()
const authStore = useAuthStore()
const showProfile = ref(false)

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
        <router-link 
          to="/compliance" 
          :class="[
            $route.path === '/compliance' 
              ? 'bg-primary text-on-primary rounded-lg mx-2 my-1 flex items-center gap-3 px-4 py-3 opacity-90 transition-all duration-200' 
              : 'text-surface-variant hover:text-surface-bright mx-2 my-1 flex items-center gap-3 px-4 py-3 transition-colors hover:bg-primary-container hover:text-on-primary-container rounded-lg'
          ]"
        >
          <span class="material-symbols-outlined" :style="$route.path === '/compliance' ? 'font-variation-settings: \'FILL\' 1;' : ''">check_circle</span>
          <span class="font-label-md text-label-md">Cumplimiento</span>
        </router-link>

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
          <div class="relative hidden md:block">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-70">search</span>
            <input 
              class="pl-10 pr-4 py-2 bg-surface-container rounded-full border-none focus:ring-2 focus:ring-primary-container transition-all font-body-sm text-body-sm w-64 text-on-surface placeholder:text-on-surface-variant/70 outline-none" 
              placeholder="Buscar..." 
              type="text"
            />
          </div>
          <button class="p-2 text-on-surface-variant hover:text-primary transition-colors focus:ring-2 focus:ring-primary-container rounded-full relative">
            <span class="material-symbols-outlined">notifications</span>
            <span class="absolute top-1 right-1 w-2.5 h-2.5 bg-error rounded-full border-2 border-surface"></span>
          </button>
          
          <div 
            @click="showProfile = true"
            class="flex items-center gap-2 border-l border-outline-variant/50 pl-4 cursor-pointer hover:opacity-80 transition-opacity group"
          >
            <div class="text-right hidden sm:block">
              <p class="font-label-md text-label-md text-on-surface font-semibold leading-tight group-hover:text-primary transition-colors">{{ authStore.user?.name }}</p>
              <p class="font-body-sm text-[12px] text-on-surface-variant capitalize">{{ authStore.user?.role }}</p>
            </div>
            <div class="h-8 w-8 rounded-full bg-surface-variant border border-outline-variant overflow-hidden flex-shrink-0 group-hover:border-primary transition-colors">
              <img 
                alt="Perfil de Usuario" 
                class="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBU0ff2ZhQpK7ML8y70Pumm2U_znsKmHUNpCpAt5tuzuIBEUfI8uMtdrops5MKtdj6QgeQR1AbYRtHLpdq2eB9-DDbErG3kO98k-miAVaBjrLUDcuROLMmH8knLk9sNUk0V_ZdolSdp-Bmg1PQgISVOvdYrzKOUtqRgS7QuTMtmk2VYEfxpKMjY1TW1QQwqGxkUPnge4JyHws1cD8Q5vQj1KhUiZXdOxT-pf4YNfStNRluRoSJZR0u9FzI6hxt-f7ZMve8Z9KkTNg"
              />
            </div>
          </div>
        </div>
      </header>

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
</style>
