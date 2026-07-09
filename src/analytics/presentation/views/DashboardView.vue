<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { Line, Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { useIotStore } from '@/iot/application/iot.store'
import { useInventoryStore } from '@/inventory/application/inventory.store'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler)

const alertsStore = useIotStore()
const inventoryStore = useInventoryStore()

// ---- KPIs dinámicos ----
const kpis = computed(() => [
  {
    title: 'Alertas Críticas',
    value: alertsStore.criticalCount,
    icon: 'crisis_alert',
    color: 'text-rose-700',
    bg: 'bg-rose-50',
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
    pulse: alertsStore.criticalCount > 0
  },
  {
    title: 'Lecturas Anómalas',
    value: alertsStore.anomalyCount,
    icon: 'bug_report',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    pulse: false
  },
  {
    title: 'Alertas No Reconocidas',
    value: alertsStore.alerts.filter((a) => !a.acknowledged).length,
    icon: 'notifications_active',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    pulse: false
  },
  {
    title: 'Estado General',
    value: alertsStore.systemStatus,
    icon:
      alertsStore.systemStatus === 'Crítico'
        ? 'dangerous'
        : alertsStore.systemStatus === 'Advertencia'
          ? 'warning'
          : 'check_circle',
    color:
      alertsStore.systemStatus === 'Crítico'
        ? 'text-rose-700'
        : alertsStore.systemStatus === 'Advertencia'
          ? 'text-amber-700'
          : 'text-emerald-700',
    bg:
      alertsStore.systemStatus === 'Crítico'
        ? 'bg-rose-50'
        : alertsStore.systemStatus === 'Advertencia'
          ? 'bg-amber-50'
          : 'bg-emerald-50',
    iconBg:
      alertsStore.systemStatus === 'Crítico'
        ? 'bg-rose-100'
        : alertsStore.systemStatus === 'Advertencia'
          ? 'bg-amber-100'
          : 'bg-emerald-100',
    iconColor:
      alertsStore.systemStatus === 'Crítico'
        ? 'text-rose-600'
        : alertsStore.systemStatus === 'Advertencia'
          ? 'text-amber-600'
          : 'text-emerald-600',
    pulse: false
  }
])

// ---- Constantes de Configuración ----
const sensorTabs = [
  { id: 'temperature', label: 'Temperatura', icon: 'thermostat', unit: '°C', color: '#9f1239', warn: 19, crit: 25 },
  { id: 'humidity', label: 'Humedad', icon: 'water_drop', unit: '%HR', color: '#1e40af', warn: 65, crit: 80 },
  { id: 'level', label: 'Nivel', icon: 'water', unit: '%', color: '#065f46', warn: 20, crit: 10 },
  { id: 'pressure', label: 'Presión', icon: 'speed', unit: 'bar', color: '#92400e', warn: 1.8, crit: 2.5 },
  { id: 'noise', label: 'Ruido', icon: 'volume_up', unit: 'dB', color: '#4c1d95', warn: 75, crit: 90 },
  { id: 'movement', label: 'Movimiento', icon: 'directions_run', unit: 'evt/h', color: '#164e63', warn: 50, crit: 100 }
]

const ranges = [
  { id: '1min', label: '1 min', ms: 60 * 1000 },
  { id: '5min', label: '5 min', ms: 5 * 60 * 1000 },
  { id: '30min', label: '30 min', ms: 30 * 60 * 1000 },
  { id: '1h', label: '1 h', ms: 60 * 60 * 1000 },
  { id: '1d', label: '1 d', ms: 24 * 60 * 60 * 1000 },
  { id: '7d', label: '7 d', ms: 7 * 24 * 60 * 65 * 1000 } // Note: original used 7 * 24 * 60 * 60 * 1000 or similar.
]

// ---- Estado Reactivo ----
const activeTab = ref(sensorTabs[0])
const activeRange = ref(ranges[2]) // 30min por defecto
const activeDevice = ref('ALL')
const countdown = ref(60)
let refreshInterval = null
const refreshTrigger = ref(0) // Usado para forzar la reactividad del chart 

const deviceOptions = computed(() => {
  const devices = new Set(
    alertsStore.alerts
      .filter((a) => a.sensorType === activeTab.value.id)
      .map((a) => a.deviceId)
  )
  return ['ALL', ...Array.from(devices)]
})

watch(activeTab, () => {
  activeDevice.value = 'ALL'
  forceRefresh()
})

watch(activeRange, () => {
  forceRefresh()
})

const forceRefresh = () => {
  refreshTrigger.value++
  countdown.value = 60
}

onMounted(async () => {
  refreshInterval = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      forceRefresh()
    }
  }, 1000)

  try {
    await inventoryStore.fetchStockMovements()
  } catch (e) {
    console.error('Error fetching stock movements for dashboard:', e)
  }
})

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval)
})

// ---- Funciones de Agrupación ----
const groupData = (data, rangeId) => {
  if (rangeId === '1min' || rangeId === '5min' || rangeId === '30min') {
    return data
  }
  
  // Agrupar por dispositivo
  const byDevice = {}
  data.forEach(d => {
    if (!byDevice[d.deviceId]) byDevice[d.deviceId] = []
    byDevice[d.deviceId].push(d)
  })

  let intervalMs = 0
  if (rangeId === '1h') intervalMs = 60 * 1000 // 1 min
  else if (rangeId === '1d') intervalMs = 60 * 60 * 1000 // 1 hora
  else if (rangeId === '7d') intervalMs = 24 * 60 * 60 * 1000 // 1 dia

  const grouped = []
  for (const [deviceId, readings] of Object.entries(byDevice)) {
    // Agrupar lecturas en buckets
    const buckets = {}
    readings.forEach(r => {
      const ts = new Date(r.timestamp).getTime()
      const bucket = Math.floor(ts / intervalMs) * intervalMs
      if (!buckets[bucket]) buckets[bucket] = { sum: 0, count: 0, status: 'NORMAL', isAnomaly: false }
      buckets[bucket].sum += r.value
      buckets[bucket].count++
      if (r.status === 'CRITICAL') buckets[bucket].status = 'CRITICAL'
      else if (r.status === 'WARNING' && buckets[bucket].status !== 'CRITICAL') buckets[bucket].status = 'WARNING'
      if (r.isAnomaly) buckets[bucket].isAnomaly = true
    })

    for (const [bucketStr, data] of Object.entries(buckets)) {
      grouped.push({
        deviceId,
        sensorType: activeTab.value.id,
        value: parseFloat((data.sum / data.count).toFixed(2)),
        timestamp: new Date(parseInt(bucketStr)).toISOString(),
        status: data.status,
        isAnomaly: data.isAnomaly
      })
    }
  }
  
  return grouped.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
}

const formatXLabel = (timestampStr, rangeId) => {
  const d = new Date(timestampStr)
  if (rangeId === '1min' || rangeId === '5min') return d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  if (rangeId === '30min' || rangeId === '1h') return d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
  if (rangeId === '1d') return d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' })
}

// ---- Gráfico ----
const chartData = computed(() => {
  // Dependency on refreshTrigger to update every 60s
  const _trigger = refreshTrigger.value
  
  const now = Date.now()
  const cutoff = now - activeRange.value.ms
  
  // 1. Filtrar
  let rawData = alertsStore.alerts.filter(a => 
    a.sensorType === activeTab.value.id && 
    new Date(a.timestamp).getTime() >= cutoff
  )
  
  if (activeDevice.value !== 'ALL') {
    rawData = rawData.filter(a => a.deviceId === activeDevice.value)
  }

  // 2. Agrupar (si aplica)
  const processedData = groupData(rawData, activeRange.value.id)

  // 3. Extraer labels únicos ordenados
  const labelsSet = new Set(processedData.map(a => new Date(a.timestamp).getTime()))
  const sortedTimes = Array.from(labelsSet).sort((a,b) => a - b)
  const labels = sortedTimes.map(ts => formatXLabel(new Date(ts).toISOString(), activeRange.value.id))

  // 4. Crear datasets por dispositivo
  const devicesInView = new Set(processedData.map(a => a.deviceId))
  const datasets = []
  
  // Array de colores alternativos si hay múltiples dispositivos
  const colors = [activeTab.value.color, '#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981', '#f43f5e']

  Array.from(devicesInView).forEach((deviceId, index) => {
    const deviceData = processedData.filter(a => a.deviceId === deviceId)
    const color = colors[index % colors.length]
    
    // Alinear valores con los labels
    const values = []
    const pointColors = []
    const pointRadii = []
    const pointStyles = []
    
    sortedTimes.forEach(ts => {
      const reading = deviceData.find(a => new Date(a.timestamp).getTime() === ts)
      if (reading) {
        values.push(reading.value)
        pointColors.push(reading.isAnomaly ? '#dc2626' : reading.status === 'WARNING' ? '#d97706' : color)
        pointRadii.push(reading.isAnomaly ? 8 : (activeRange.value.id.includes('d') ? 2 : 4))
        pointStyles.push(reading.isAnomaly ? 'star' : 'circle')
      } else {
        values.push(null)
        pointColors.push('transparent')
        pointRadii.push(0)
        pointStyles.push('circle')
      }
    })

    datasets.push({
      label: deviceId,
      data: values,
      borderColor: color,
      backgroundColor: color + '1A', // 10% opacity
      fill: false,
      tension: 0.2,
      spanGaps: true,
      pointBackgroundColor: pointColors,
      pointBorderColor: pointColors,
      pointRadius: pointRadii,
      pointHoverRadius: pointRadii.map((r) => r === 0 ? 0 : r + 3),
      pointStyle: pointStyles
    })
  })

  // Añadir Thresholds como datasets invisibles con borderDash
  if (labels.length > 0) {
    // Critical
    datasets.push({
      label: 'Critical Threshold',
      data: Array(labels.length).fill(activeTab.value.crit),
      borderColor: '#dc2626',
      borderWidth: 2,
      borderDash: [6, 4],
      fill: false,
      pointRadius: 0,
      pointHoverRadius: 0
    })
    // Warning
    datasets.push({
      label: 'Warning Threshold',
      data: Array(labels.length).fill(activeTab.value.warn),
      borderColor: '#d97706',
      borderWidth: 2,
      borderDash: [6, 4],
      fill: false,
      pointRadius: 0,
      pointHoverRadius: 0
    })
  }

  return { labels, datasets }
})

const activeChartData = computed(() => {
  // Dependencia reactiva: Si no hay datos en el store (al cargar), mostramos fallback
  if (alertsStore.alerts.length === 0) {
    return {
      labels: ['-'],
      datasets: [{ label: 'Esperando datos...', data: [] }]
    }
  }
  return chartData.value
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 0 }, // Disable animation on manual refresh to avoid jumping
  plugins: {
    legend: { display: true, position: 'bottom' },
    tooltip: {
      callbacks: {
        label: (ctx) => {
          if (ctx.dataset.label.includes('Threshold')) return `${ctx.dataset.label}: ${ctx.raw} ${activeTab.value.unit}`
          return `${ctx.dataset.label}: ${ctx.formattedValue} ${activeTab.value.unit}`
        }
      }
    }
  },
  scales: {
    y: { 
      beginAtZero: false,
      title: { display: true, text: activeTab.value.unit }
    },
    x: { 
      ticks: { maxRotation: 45, minRotation: 0 } 
    }
  }
}))

// ---- Stock Movements Chart Logic ----
const movementChartData = computed(() => {
  // Dependency on refreshTrigger to refresh every 60s
  const _trigger = refreshTrigger.value
  
  const now = Date.now()
  const cutoff = now - activeRange.value.ms
  
  // 1. Filtrar movimientos en rango
  const rawMovements = (inventoryStore.movements || []).filter(m => 
    new Date(m.date).getTime() >= cutoff
  )

  // 2. Agrupar por Nombre de Insumo (supplyName)
  const productData = {}
  
  rawMovements.forEach(m => {
    const name = m.supplyName || `Insumo #${m.supplyId}`
    if (!productData[name]) {
      productData[name] = { entry: 0, exit: 0 }
    }
    if (m.type === 'ENTRY') {
      productData[name].entry += m.quantity
    } else if (m.type === 'EXIT') {
      productData[name].exit += m.quantity
    }
  })

  // 3. Generar labels y datasets
  const labels = Object.keys(productData).sort()
  const entryData = []
  const exitData = []
  
  labels.forEach(name => {
    entryData.push(productData[name].entry)
    exitData.push(productData[name].exit)
  })

  return {
    labels: labels.length ? labels : ['Sin movimientos'],
    datasets: [
      {
        label: 'Entradas (+)',
        backgroundColor: '#10b981', // Emerald 500
        borderColor: '#10b981',
        data: entryData.length ? entryData : [0]
      },
      {
        label: 'Salidas (-)',
        backgroundColor: '#f43f5e', // Rose 500
        borderColor: '#f43f5e',
        data: exitData.length ? exitData : [0]
      }
    ]
  }
})

const movementChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: true, position: 'bottom' }
  },
  scales: {
    y: { 
      beginAtZero: true,
      title: { display: true, text: 'Cantidad' }
    },
    x: { 
      ticks: { maxRotation: 45, minRotation: 0 } 
    }
  }
}))
</script>

<template>
  <div class="space-y-6">
    <!-- KPIs -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      <div
        v-for="(kpi, index) in kpis"
        :key="index"
        class="bg-surface-container-lowest rounded-xl border border-outline-variant p-5 flex items-center gap-4 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
        :class="kpi.bg"
      >
        <div
          class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          :class="[kpi.iconBg, kpi.pulse ? 'animate-pulse' : '']"
        >
          <span
            class="material-symbols-outlined text-[24px]"
            :class="kpi.iconColor"
            style="font-variation-settings: 'FILL' 1;"
          >{{ kpi.icon }}</span>
        </div>
        <div>
          <p class="font-label-sm text-label-sm text-on-surface-variant">{{ kpi.title }}</p>
          <p
            class="font-headline-sm text-headline-sm font-bold transition-all duration-500"
            :class="kpi.color"
          >{{ kpi.value }}</p>
        </div>
      </div>
    </div>

    <!-- Chart Config Bar (Tabs) -->
    <div class="flex flex-wrap items-center gap-2 border-b border-outline-variant pb-2">
      <button
        v-for="tab in sensorTabs"
        :key="tab.id"
        @click="activeTab = tab"
        class="flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors border-b-2 font-label-md"
        :class="activeTab.id === tab.id 
          ? 'border-primary text-primary bg-primary-container/30' 
          : 'border-transparent text-on-surface-variant hover:bg-surface-container'"
      >
        <span class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' 1;">{{ tab.icon }}</span>
        {{ tab.label }}
      </button>
    </div>

    <!-- Chart Area -->
    <div class="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6">
      
      <!-- Chart Controls -->
      <div class="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h3 class="font-headline-sm text-headline-sm text-on-surface">
            {{ activeTab.label }} — Últimos {{ activeRange.label }} ({{ activeTab.unit }})
          </h3>
          <div class="mt-2 flex items-center gap-2">
            <span class="font-label-sm text-on-surface-variant">Dispositivo:</span>
            <select v-model="activeDevice" class="bg-surface border border-outline-variant rounded px-2 py-1 text-sm outline-none">
              <option v-for="opt in deviceOptions" :key="opt" :value="opt">{{ opt === 'ALL' ? 'Todos' : opt }}</option>
            </select>
          </div>
        </div>

        <div class="flex flex-col items-end gap-3">
          <!-- Refresh -->
          <div class="flex items-center gap-3">
            <span class="font-label-sm text-on-surface-variant w-[120px] text-right">Actualiza en: <strong>{{ countdown }}s</strong></span>
            <button 
              @click="forceRefresh"
              class="flex items-center gap-1 bg-surface-container hover:bg-surface-container-high px-3 py-1.5 rounded-lg border border-outline-variant text-sm transition-colors"
            >
              <span class="material-symbols-outlined text-[16px]">refresh</span> Ahora
            </button>
          </div>

          <!-- Range Pills -->
          <div class="flex bg-surface-container border border-outline-variant rounded-lg p-1">
            <button
              v-for="r in ranges"
              :key="r.id"
              @click="activeRange = r"
              class="px-3 py-1 text-xs font-medium rounded-md transition-colors"
              :class="activeRange.id === r.id ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high'"
            >
              {{ r.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- Canvas -->
      <div v-if="alertsStore.alerts.length === 0" class="h-[400px] flex flex-col items-center justify-center gap-2 text-on-surface-variant">
        <span class="material-symbols-outlined text-[40px] opacity-30">ssid_chart</span>
        <p class="font-label-md text-label-md opacity-60">Esperando datos del servicio IoT...</p>
      </div>
      <div v-else class="h-[400px] relative">
        <Line :data="activeChartData" :options="chartOptions" />
      </div>
    </div>

    <!-- Stock Movements Chart Area -->
    <div class="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="font-headline-sm text-headline-sm text-on-surface">
            Movimiento General de Productos (Entradas vs. Salidas)
          </h3>
          <p class="text-xs text-on-surface-variant mt-1">Resumen consolidado de movimientos de stock para el rango seleccionado</p>
        </div>
      </div>
      
      <div v-if="!inventoryStore.movements || inventoryStore.movements.length === 0" class="h-[300px] flex flex-col items-center justify-center gap-2 text-on-surface-variant">
        <span class="material-symbols-outlined text-[40px] opacity-30">pending_actions</span>
        <p class="font-label-md text-label-md opacity-60">No hay movimientos registrados en este periodo...</p>
      </div>
      <div v-else class="h-[300px] relative">
        <Bar :data="movementChartData" :options="movementChartOptions" />
      </div>
    </div>

    <!-- Recent Critical Alerts Panel -->
    <div
      v-if="alertsStore.criticalCount > 0"
      class="bg-rose-50 border border-rose-200 rounded-xl p-5"
    >
      <h3 class="font-headline-sm text-headline-sm text-rose-800 mb-3 flex items-center gap-2">
        <span class="material-symbols-outlined text-rose-600" style="font-variation-settings: 'FILL' 1;">crisis_alert</span>
        Alertas Críticas Pendientes ({{ alertsStore.criticalCount }})
      </h3>
      <ul class="space-y-2">
        <li
          v-for="alert in alertsStore.alerts.filter(a => a.status === 'CRITICAL' && !a.acknowledged).slice(0, 5)"
          :key="alert.id"
          class="flex items-center gap-3 bg-white/80 border border-rose-100 rounded-lg px-4 py-2.5"
        >
          <span class="material-symbols-outlined text-rose-500 text-[18px]" style="font-variation-settings: 'FILL' 1;">sensors</span>
          <span class="font-label-md text-label-md text-rose-900 flex-1">
            <strong>{{ alert.deviceId }}</strong> — {{ alert.sensorType }}: {{ alert.value }}{{ alert.unit }}
          </span>
          <span class="font-body-sm text-[11px] text-rose-400">
            {{ new Date(alert.timestamp).toLocaleTimeString('es-PE') }}
          </span>
        </li>
      </ul>
      <p v-if="alertsStore.criticalCount > 5" class="font-label-sm text-label-sm text-rose-600 mt-2 text-right">
        + {{ alertsStore.criticalCount - 5 }} más → <router-link to="/telemetry" class="underline hover:text-rose-800">Ver todas</router-link>
      </p>
    </div>
  </div>
</template>

<style scoped>
</style>
