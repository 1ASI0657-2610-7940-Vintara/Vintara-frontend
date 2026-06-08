<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import axios from 'axios'
import { useToastStore } from '../store/toast'

const toastStore = useToastStore()
const readings = ref([])
const isLoading = ref(true)
let pollingInterval = null
const alertedEquipments = ref(new Set())

const fetchTelemetry = async () => {
  try {
    const response = await axios.get('/mocks/telemetry.json')
    readings.value = response.data
    isLoading.value = false

    // Check for "Alerta Crítica" and trigger toast notifications
    response.data.forEach((item) => {
      if (item.estado === 'Alerta Crítica') {
        if (!alertedEquipments.value.has(item.idEquipo)) {
          alertedEquipments.value.add(item.idEquipo)
          toastStore.error(
            `El equipo "${item.nombre}" está en Alerta Crítica.`,
            `Alerta IoT: ${item.idEquipo}`
          )
        }
      } else {
        // If it was previously alerted but now normal, remove from set
        if (alertedEquipments.value.has(item.idEquipo)) {
          alertedEquipments.value.delete(item.idEquipo)
          toastStore.success(
            `El equipo "${item.nombre}" ha retornado a su estado normal.`,
            `Restablecido: ${item.idEquipo}`
          )
        }
      }
    })
  } catch (error) {
    console.error('Error fetching telemetry:', error)
    // Only toast on initial failure to avoid spamming every 5s if offline
    if (isLoading.value) {
      toastStore.error('No se pudo establecer conexión con el monitor IoT.', 'Error de Conexión')
    }
    isLoading.value = false
  }
}

const getAssetIcon = (type) => {
  switch (type) {
    case 'Congelador': return 'kitchen'
    case 'Horno': return 'local_fire_department'
    case 'Cámara': return 'severe_cold'
    default: return 'sensors'
  }
}

onMounted(() => {
  fetchTelemetry()
  pollingInterval = setInterval(fetchTelemetry, 5000)
})

onUnmounted(() => {
  if (pollingInterval) {
    clearInterval(pollingInterval)
  }
})
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="mb-8 flex justify-between items-end">
      <div>
        <h2 class="font-headline-lg text-headline-lg text-on-surface mb-2">Monitor de Telemetría (IoT)</h2>
        <p class="font-body-md text-body-md text-on-surface-variant">Lecturas en tiempo real enviadas por sensores IoT en toda la instalación.</p>
      </div>
      
      <!-- Connection Status indicator -->
      <div class="flex items-center gap-2 font-label-md text-label-md text-on-surface-variant bg-surface border border-outline-variant px-3 py-1.5 rounded-full shadow-sm">
        <span class="relative flex h-3.5 w-3.5">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary-fixed-dim opacity-75"></span>
          <span class="relative inline-flex rounded-full h-3.5 w-3.5 bg-tertiary-container"></span>
        </span>
        <span class="font-medium text-tertiary-container">Conexión Activa (Polling 5s)</span>
      </div>
    </div>

    <!-- Data Table Section -->
    <div class="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant overflow-hidden">
      <div class="p-6 border-b border-outline-variant flex justify-between items-center bg-surface">
        <h3 class="font-headline-sm text-headline-sm text-on-surface">Transmisiones en Vivo</h3>
      </div>
      
      <!-- Loading State -->
      <div v-if="isLoading" class="p-12 flex flex-col items-center justify-center gap-3">
        <div class="animate-spin rounded-full h-10 w-10 border-4 border-rose-800 border-t-transparent"></div>
        <p class="font-label-md text-on-surface-variant">Cargando lecturas de telemetría...</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-outline-variant bg-surface-container-low/50">
              <th class="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Activo / Sensor</th>
              <th class="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Temperatura</th>
              <th class="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Humedad</th>
              <th class="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Última Lectura</th>
              <th class="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Estado</th>
            </tr>
          </thead>
          <tbody class="font-body-sm text-body-sm text-on-surface divide-y divide-outline-variant/50">
            <tr 
              v-for="reading in readings" 
              :key="reading.idEquipo" 
              class="hover:bg-surface-container-low transition-colors duration-200 group"
              :class="reading.estado === 'Alerta Crítica' ? 'bg-error-container/10' : ''"
            >
              <!-- Asset with Icon -->
              <td class="py-4 px-6 font-medium flex items-center gap-3">
                <div 
                  class="w-8 h-8 rounded-md flex items-center justify-center transition-colors"
                  :class="[
                    reading.estado === 'Alerta Crítica' 
                      ? 'bg-error-container text-error group-hover:bg-error group-hover:text-on-error'
                      : 'bg-surface-container text-primary group-hover:bg-primary group-hover:text-on-primary'
                  ]"
                >
                  <span class="material-symbols-outlined text-[18px]">{{ getAssetIcon(reading.tipo) }}</span>
                </div>
                <div>
                  <div class="font-semibold text-slate-900">{{ reading.nombre }}</div>
                  <div class="text-[11px] text-slate-500">{{ reading.idEquipo }}</div>
                </div>
              </td>
              
              <!-- Temperature -->
              <td 
                class="py-4 px-6 font-bold" 
                :class="reading.estado === 'Alerta Crítica' ? 'text-error' : 'text-on-surface'"
              >
                {{ reading.temperatura }}°C
              </td>
              
              <!-- Humidity -->
              <td class="py-4 px-6 text-on-surface-variant">{{ reading.humedad }}%</td>
              
              <!-- Timestamp -->
              <td class="py-4 px-6 text-on-surface-variant">{{ reading.timestamp }}</td>
              
              <!-- Status Badge -->
              <td class="py-4 px-6">
                <span 
                  v-if="reading.estado === 'Normal'" 
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full font-label-sm text-label-sm bg-tertiary-fixed text-tertiary-container"
                >
                  Normal
                </span>
                <span 
                  v-else 
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full font-label-sm text-label-sm bg-error text-on-error animate-pulse"
                >
                  Alerta Crítica
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Transiciones si es necesario */
</style>

