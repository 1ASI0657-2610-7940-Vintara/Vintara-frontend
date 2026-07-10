<script setup>
import { ref, computed } from 'vue'
import { useSensorAlerts } from '../composables/useSensorAlerts'
import { useToastStore } from '@/shared/application/toast.store'

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
  let parsedDate = ts
  if (typeof ts === 'string' && ts.includes('T')) {
    const timePart = ts.split('T')[1]
    const hasTimezone = ts.endsWith('Z') || timePart.includes('+') || timePart.includes('-')
    if (!hasTimezone) {
      parsedDate = ts + 'Z'
    }
  }
  return new Date(parsedDate).toLocaleString('es-PE', {
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
      <div v-if="serviceOffline" class="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-800 font-label-md text-label-md animate-pulse">
        <span class="material-symbols-outlined text-[18px]">cloud_off</span>
        Servicio IoT Desconectado
      </div>
      <div v-else class="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-850 font-label-md text-label-md">
        <span class="material-symbols-outlined text-[18px] text-emerald-600 animate-spin" style="animation-duration: 4s;">sync</span>
        Monitoreando Activo
      </div>
    </div>

    <!-- KPI Summary Row -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Critical Alerts KPI -->
      <div class="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant flex items-center justify-between shadow-sm">
        <div class="space-y-1">
          <p class="font-label-md text-label-md text-on-surface-variant">Alertas Críticas Activas</p>
          <h3 class="font-headline-lg text-headline-lg font-bold text-rose-700">{{ criticalCount }}</h3>
        </div>
        <div class="p-3 bg-rose-100 rounded-lg text-rose-700">
          <span class="material-symbols-outlined text-[28px]" style="font-variation-settings: 'FILL' 1;">crisis_alert</span>
        </div>
      </div>

      <!-- Warning Alerts KPI -->
      <div class="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant flex items-center justify-between shadow-sm">
        <div class="space-y-1">
          <p class="font-label-md text-label-md text-on-surface-variant">Advertencias Activas</p>
          <h3 class="font-headline-lg text-headline-lg font-bold text-amber-700">{{ warningCount }}</h3>
        </div>
        <div class="p-3 bg-amber-100 rounded-lg text-amber-700">
          <span class="material-symbols-outlined text-[28px]" style="font-variation-settings: 'FILL' 1;">warning</span>
        </div>
      </div>

      <!-- Anomalies KPI -->
      <div class="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant flex items-center justify-between shadow-sm">
        <div class="space-y-1">
          <p class="font-label-md text-label-md text-on-surface-variant">Anomalías Detectadas</p>
          <h3 class="font-headline-lg text-headline-lg font-bold text-slate-800">{{ anomalyCount }}</h3>
        </div>
        <div class="p-3 bg-slate-100 rounded-lg text-slate-700">
          <span class="material-symbols-outlined text-[28px]" style="font-variation-settings: 'FILL' 1;">bug_report</span>
        </div>
      </div>
    </div>

    <!-- Filters and Controls -->
    <div class="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 flex flex-col md:flex-row gap-4 items-stretch md:items-center">
      <!-- Status Filter -->
      <div class="flex items-center gap-2 bg-surface border border-outline-variant rounded-lg px-3 py-2 flex-1 md:flex-initial">
        <span class="material-symbols-outlined text-on-surface-variant text-[18px]">traffic</span>
        <select v-model="filterStatus" class="font-body-sm text-body-sm text-on-surface bg-transparent border-none outline-none cursor-pointer pr-1 w-full md:w-auto">
          <option value="ALL">Todos los Estados</option>
          <option v-for="opt in statusOptions.slice(1)" :key="opt" :value="opt">{{ opt }}</option>
        </select>
      </div>

      <!-- Sensor Type Filter -->
      <div class="flex items-center gap-2 bg-surface border border-outline-variant rounded-lg px-3 py-2 flex-1 md:flex-initial">
        <span class="material-symbols-outlined text-on-surface-variant text-[18px]">sensors</span>
        <select v-model="filterSensorType" class="font-body-sm text-body-sm text-on-surface bg-transparent border-none outline-none cursor-pointer pr-1 w-full md:w-auto capitalize">
          <option value="ALL">Todos los Sensores</option>
          <option v-for="opt in sensorTypeOptions.slice(1)" :key="opt" :value="opt">{{ opt }}</option>
        </select>
      </div>
    </div>

    <!-- Alerts Table / List -->
    <div class="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant overflow-hidden">
      <!-- Table Header Title -->
      <div class="p-6 border-b border-outline-variant flex justify-between items-center bg-surface">
        <h3 class="font-headline-sm text-headline-sm text-on-surface">Historial de Lecturas</h3>
        <span class="font-label-sm text-label-sm text-on-surface-variant bg-surface-container px-3 py-1 rounded-full">
          {{ filteredAlerts.length }} registros mostrados
        </span>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading && alerts.length === 0" class="p-12 flex flex-col items-center justify-center gap-3">
        <div class="animate-spin rounded-full h-10 w-10 border-4 border-rose-800 border-t-transparent"></div>
        <p class="font-label-md text-on-surface-variant">Conectando con el sensor service...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredAlerts.length === 0" class="p-12 flex flex-col items-center justify-center gap-3 text-center">
        <span class="material-symbols-outlined text-on-surface-variant text-[48px] opacity-40">notifications_off</span>
        <p class="font-label-md text-on-surface-variant">No se encontraron lecturas que coincidan con los filtros.</p>
      </div>

      <!-- Table Content -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-outline-variant bg-surface-container-low/50">
              <th class="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Dispositivo</th>
              <th class="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Tipo Sensor</th>
              <th class="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Valor</th>
              <th class="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Fecha/Hora</th>
              <th class="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Estado</th>
              <th class="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-right">Acción</th>
            </tr>
          </thead>
          <tbody class="font-body-sm text-body-sm text-on-surface divide-y divide-outline-variant/40">
            <tr
              v-for="alert in filteredAlerts"
              :key="alert.id"
              class="hover:bg-surface-container-low transition-colors duration-200 group"
              :class="getStatusClasses(alert.status).row"
            >
              <!-- Device ID -->
              <td class="py-4 px-6 font-medium">
                <div class="flex items-center gap-2">
                  <span class="font-mono">{{ alert.deviceId }}</span>
                  <span
                    v-if="alert.isAnomaly"
                    title="Marcado como anomalía por el Alert Engine"
                    class="material-symbols-outlined text-[16px] text-amber-600 cursor-help"
                  >
                    bug_report
                  </span>
                </div>
              </td>

              <!-- Sensor Type -->
              <td class="py-4 px-6 capitalize">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-[18px] text-on-surface-variant">
                    {{ getSensorIcon(alert.sensorType) }}
                  </span>
                  <span>{{ alert.sensorType }}</span>
                </div>
              </td>

              <!-- Value -->
              <td class="py-4 px-6 font-mono font-semibold">
                {{ alert.value }}<span class="text-[12px] text-on-surface-variant font-normal ml-0.5">{{ alert.unit }}</span>
              </td>

              <!-- Timestamp -->
              <td class="py-4 px-6 text-on-surface-variant">{{ formatTimestamp(alert.timestamp) }}</td>

              <!-- Status -->
              <td class="py-4 px-6">
                <span
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                  :class="getStatusClasses(alert.status).badge"
                >
                  <span class="material-symbols-outlined text-[14px]">
                    {{ getStatusIcon(alert.status) }}
                  </span>
                  {{ alert.status }}
                </span>
              </td>

              <!-- Actions -->
              <td class="py-4 px-6 text-right">
                <template v-if="alert.status !== 'NORMAL' && !alert.acknowledged">
                  <button
                    @click="handleAcknowledge(alert)"
                    :disabled="acknowledging.has(alert.id)"
                    class="font-label-md text-label-md py-1.5 px-3 bg-secondary hover:bg-secondary-container text-on-secondary hover:text-on-secondary-container rounded-lg transition-colors flex items-center gap-1.5 ml-auto disabled:opacity-50"
                  >
                    <span v-if="acknowledging.has(alert.id)" class="animate-spin rounded-full h-3.5 w-3.5 border-2 border-current border-t-transparent"></span>
                    <span v-else class="material-symbols-outlined text-[16px]">done</span>
                    Reconocer
                  </button>
                </template>
                <span v-else-if="alert.acknowledged" class="inline-flex items-center gap-1 text-on-surface-variant opacity-60 text-[12px] font-medium pr-2">
                  <span class="material-symbols-outlined text-[16px] text-emerald-600">done_all</span>
                  Reconocida
                </span>
                <span v-else class="text-on-surface-variant opacity-30">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Las transiciones o estilos específicos de telemetría van aquí */
</style>
