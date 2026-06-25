<script setup>
import { ref, computed } from 'vue'
import { useSensorAlerts } from '../composables/useSensorAlerts'
import { useToastStore } from '../store/toast'

const toastStore = useToastStore()

// Composable con polling ya activo en el layout — aquí lo reutilizamos solo para
// obtener los datos y la función acknowledgeAlert. El polling del layout es el primario.
const { alerts, isLoading, serviceOffline, acknowledgeAlert: doAcknowledge } = useSensorAlerts(5000)

// ---- Filtros ----
const filterStatus = ref('ALL')
const filterSensorType = ref('ALL')

const statusOptions = ['ALL', 'NORMAL', 'WARNING', 'CRITICAL']
const sensorTypeOptions = computed(() => {
  const types = new Set(alerts.value.map((a) => a.sensorType))
  return ['ALL', ...Array.from(types)]
})

const filteredAlerts = computed(() => {
  return alerts.value.filter((a) => {
    const matchStatus = filterStatus.value === 'ALL' || a.status === filterStatus.value
    const matchType = filterSensorType.value === 'ALL' || a.sensorType === filterSensorType.value
    return matchStatus && matchType
  })
})

// ---- KPI counts ----
const criticalCount = computed(() => alerts.value.filter((a) => a.status === 'CRITICAL' && !a.acknowledged).length)
const warningCount = computed(() => alerts.value.filter((a) => a.status === 'WARNING' && !a.acknowledged).length)
const anomalyCount = computed(() => alerts.value.filter((a) => a.isAnomaly).length)

// ---- Acknowledge ----
const acknowledging = ref(new Set())

const handleAcknowledge = async (alert) => {
  if (acknowledging.value.has(alert.id)) return
  acknowledging.value.add(alert.id)
  try {
    await doAcknowledge(alert.id)
    toastStore.success(
      `Alerta del sensor "${alert.deviceId}" marcada como reconocida.`,
      'Alerta Reconocida'
    )
  } catch {
    toastStore.error('No se pudo reconocer la alerta. Intenta de nuevo.', 'Error')
  } finally {
    acknowledging.value.delete(alert.id)
  }
}

// ---- Helpers de UI ----
const getSensorIcon = (type) => {
  const icons = {
    temperature: 'thermostat',
    humidity: 'water_drop',
    pressure: 'speed',
    level: 'water',
    flow: 'air'
  }
  return icons[type] ?? 'sensors'
}

const getStatusClasses = (status) => {
  switch (status) {
    case 'CRITICAL':
      return { badge: 'bg-error text-on-error animate-pulse', row: 'bg-error/5' }
    case 'WARNING':
      return { badge: 'bg-amber-100 text-amber-800', row: 'bg-amber-50/40' }
    default:
      return { badge: 'bg-emerald-100 text-emerald-800', row: '' }
  }
}

const getStatusIcon = (status) => {
  switch (status) {
    case 'CRITICAL': return 'crisis_alert'
    case 'WARNING': return 'warning'
    default: return 'check_circle'
  }
}

const formatTimestamp = (ts) => {
  if (!ts) return '—'
  return new Date(ts).toLocaleString('es-PE', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  })
}
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
      <div
        class="flex items-center gap-2 font-label-md text-label-md px-3 py-1.5 rounded-full shadow-sm border"
        :class="serviceOffline
          ? 'bg-amber-50 border-amber-200 text-amber-700'
          : 'bg-surface border-outline-variant text-on-surface-variant'"
      >
        <span class="relative flex h-3.5 w-3.5">
          <span
            class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
            :class="serviceOffline ? 'bg-amber-400' : 'bg-tertiary-fixed-dim'"
          ></span>
          <span
            class="relative inline-flex rounded-full h-3.5 w-3.5"
            :class="serviceOffline ? 'bg-amber-500' : 'bg-tertiary-container'"
          ></span>
        </span>
        <span class="font-medium" :class="serviceOffline ? 'text-amber-700' : 'text-tertiary-container'">
          {{ serviceOffline ? 'Reconectando...' : 'Conexión Activa (Polling 5s)' }}
        </span>
      </div>
    </div>

    <!-- KPI Summary Bar -->
    <div class="grid grid-cols-3 gap-4">
      <div class="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-error/10 flex items-center justify-center flex-shrink-0">
          <span class="material-symbols-outlined text-error text-[20px]" style="font-variation-settings: 'FILL' 1;">crisis_alert</span>
        </div>
        <div>
          <p class="font-label-sm text-label-sm text-on-surface-variant">Alertas Críticas</p>
          <p class="font-headline-sm text-headline-sm text-error font-bold">{{ criticalCount }}</p>
        </div>
      </div>
      <div class="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
          <span class="material-symbols-outlined text-amber-600 text-[20px]" style="font-variation-settings: 'FILL' 1;">warning</span>
        </div>
        <div>
          <p class="font-label-sm text-label-sm text-on-surface-variant">Advertencias</p>
          <p class="font-headline-sm text-headline-sm text-amber-600 font-bold">{{ warningCount }}</p>
        </div>
      </div>
      <div class="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
          <span class="material-symbols-outlined text-purple-600 text-[20px]" style="font-variation-settings: 'FILL' 1;">bug_report</span>
        </div>
        <div>
          <p class="font-label-sm text-label-sm text-on-surface-variant">Anomalías (total)</p>
          <p class="font-headline-sm text-headline-sm text-purple-600 font-bold">{{ anomalyCount }}</p>
        </div>
      </div>
    </div>

    <!-- Filters Bar -->
    <div class="flex items-center gap-3 flex-wrap">
      <span class="font-label-md text-label-md text-on-surface-variant">Filtrar por:</span>
      
      <!-- Status filter -->
      <div class="flex items-center gap-1 bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-1.5">
        <span class="material-symbols-outlined text-on-surface-variant text-[16px]">filter_list</span>
        <select
          v-model="filterStatus"
          class="font-body-sm text-body-sm text-on-surface bg-transparent border-none outline-none cursor-pointer pr-1"
        >
          <option value="ALL">Todos los estados</option>
          <option v-for="s in statusOptions.slice(1)" :key="s" :value="s">{{ s }}</option>
        </select>
      </div>

      <!-- Sensor type filter -->
      <div class="flex items-center gap-1 bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-1.5">
        <span class="material-symbols-outlined text-on-surface-variant text-[16px]">sensors</span>
        <select
          v-model="filterSensorType"
          class="font-body-sm text-body-sm text-on-surface bg-transparent border-none outline-none cursor-pointer pr-1"
        >
          <option value="ALL">Todos los sensores</option>
          <option v-for="t in sensorTypeOptions.slice(1)" :key="t" :value="t">{{ t }}</option>
        </select>
      </div>

      <span class="font-body-sm text-body-sm text-on-surface-variant ml-auto">
        Mostrando <strong>{{ filteredAlerts.length }}</strong> de <strong>{{ alerts.length }}</strong> lecturas
      </span>
    </div>

    <!-- Data Table Section -->
    <div class="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant overflow-hidden">
      <div class="p-6 border-b border-outline-variant flex justify-between items-center bg-surface">
        <h3 class="font-headline-sm text-headline-sm text-on-surface">Transmisiones en Vivo</h3>
        <span class="font-label-sm text-label-sm text-on-surface-variant bg-surface-container px-3 py-1 rounded-full">
          API: GET /api/v1/sensor-alerts
        </span>
      </div>
      
      <!-- Loading State -->
      <div v-if="isLoading" class="p-12 flex flex-col items-center justify-center gap-3">
        <div class="animate-spin rounded-full h-10 w-10 border-4 border-rose-800 border-t-transparent"></div>
        <p class="font-label-md text-on-surface-variant">Cargando lecturas de telemetría...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredAlerts.length === 0" class="p-12 flex flex-col items-center justify-center gap-3 text-center">
        <span class="material-symbols-outlined text-on-surface-variant text-[48px] opacity-40">sensors_off</span>
        <p class="font-label-md text-on-surface-variant">No hay lecturas que coincidan con los filtros.</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-outline-variant bg-surface-container-low/50">
              <th class="py-4 px-5 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Dispositivo</th>
              <th class="py-4 px-5 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Sensor</th>
              <th class="py-4 px-5 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Valor</th>
              <th class="py-4 px-5 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Timestamp</th>
              <th class="py-4 px-5 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Estado</th>
              <th class="py-4 px-5 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Anomalía</th>
              <th class="py-4 px-5 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Acción</th>
            </tr>
          </thead>
          <tbody class="font-body-sm text-body-sm text-on-surface divide-y divide-outline-variant/50">
            <tr 
              v-for="alert in filteredAlerts" 
              :key="alert.id"
              class="hover:bg-surface-container-low transition-colors duration-200 group"
              :class="getStatusClasses(alert.status).row"
            >
              <!-- Device -->
              <td class="py-4 px-5">
                <div class="flex items-center gap-3">
                  <div
                    class="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 transition-colors"
                    :class="alert.status === 'CRITICAL'
                      ? 'bg-error/15 text-error group-hover:bg-error group-hover:text-on-error'
                      : alert.status === 'WARNING'
                        ? 'bg-amber-100 text-amber-700 group-hover:bg-amber-500 group-hover:text-white'
                        : 'bg-surface-container text-primary group-hover:bg-primary group-hover:text-on-primary'"
                  >
                    <span class="material-symbols-outlined text-[18px]">{{ getSensorIcon(alert.sensorType) }}</span>
                  </div>
                  <div>
                    <div class="font-semibold text-on-surface">{{ alert.deviceId }}</div>
                  </div>
                </div>
              </td>

              <!-- Sensor Type -->
              <td class="py-4 px-5 text-on-surface-variant capitalize">{{ alert.sensorType }}</td>

              <!-- Value -->
              <td
                class="py-4 px-5 font-bold font-mono"
                :class="alert.status === 'CRITICAL' ? 'text-error' : alert.status === 'WARNING' ? 'text-amber-600' : 'text-on-surface'"
              >
                {{ alert.value }} <span class="font-normal text-[12px] text-on-surface-variant">{{ alert.unit }}</span>
              </td>

              <!-- Timestamp -->
              <td class="py-4 px-5 text-on-surface-variant text-[12px]">{{ formatTimestamp(alert.timestamp) }}</td>

              <!-- Status Badge -->
              <td class="py-4 px-5">
                <span
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-label-sm text-label-sm"
                  :class="getStatusClasses(alert.status).badge"
                >
                  <span class="material-symbols-outlined text-[14px]" style="font-variation-settings: 'FILL' 1;">{{ getStatusIcon(alert.status) }}</span>
                  {{ alert.status }}
                </span>
              </td>

              <!-- Anomaly flag -->
              <td class="py-4 px-5">
                <span
                  v-if="alert.isAnomaly"
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-label-sm text-label-sm"
                >
                  <span class="material-symbols-outlined text-[13px]" style="font-variation-settings: 'FILL' 1;">error</span>
                  Anomalía
                </span>
                <span v-else class="text-on-surface-variant text-[12px]">Normal</span>
              </td>

              <!-- Acknowledge action -->
              <td class="py-4 px-5">
                <button
                  v-if="!alert.acknowledged"
                  @click="handleAcknowledge(alert)"
                  :disabled="acknowledging.has(alert.id)"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-label-sm text-label-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  :class="alert.status === 'CRITICAL'
                    ? 'bg-error/10 text-error hover:bg-error hover:text-on-error border border-error/30'
                    : 'bg-surface-container text-on-surface-variant hover:bg-primary hover:text-on-primary border border-outline-variant'"
                >
                  <span
                    class="material-symbols-outlined text-[14px]"
                    :class="acknowledging.has(alert.id) ? 'animate-spin' : ''"
                  >{{ acknowledging.has(alert.id) ? 'progress_activity' : 'done' }}</span>
                  Reconocer
                </button>
                <span
                  v-else
                  class="inline-flex items-center gap-1 text-emerald-600 font-label-sm text-label-sm"
                >
                  <span class="material-symbols-outlined text-[14px]" style="font-variation-settings: 'FILL' 1;">check_circle</span>
                  Reconocido
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
select option {
  background-color: white;
  color: #1a1a1a;
}
</style>
