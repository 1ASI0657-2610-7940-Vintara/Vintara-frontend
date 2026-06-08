<script setup>
import { ref } from 'vue'
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const chartData = ref({
  labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
  datasets: [
    {
      label: 'Temperatura Global Promedio (°C)',
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      borderColor: '#3b82f6',
      data: [-18, -19, -17.5, -18.2, -19.1, -18.5, -18],
      fill: true,
      tension: 0.4
    }
  ]
})

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true
    }
  },
  scales: {
    y: {
      beginAtZero: false
    }
  }
})

const kpis = ref([
  { title: 'Activos Críticos', value: '3', color: 'text-red-600', bg: 'bg-red-50' },
  { title: 'Lecturas Anómalas (24h)', value: '12', color: 'text-yellow-600', bg: 'bg-yellow-50' },
  { title: 'Auditorías Pendientes', value: '5', color: 'text-blue-600', bg: 'bg-blue-50' },
  { title: 'Estado General', value: 'Estable', color: 'text-green-600', bg: 'bg-green-50' }
])
</script>

<template>
  <div class="space-y-6">
    <!-- KPIs -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div v-for="(kpi, index) in kpis" :key="index" class="card flex items-center p-6">
        <div :class="[kpi.bg, kpi.color]" class="p-3 rounded-full mr-4">
          <!-- Placeholder Icon -->
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z"></path></svg>
        </div>
        <div>
          <p class="text-sm font-medium text-gray-500">{{ kpi.title }}</p>
          <p class="text-2xl font-bold text-gray-900">{{ kpi.value }}</p>
        </div>
      </div>
    </div>

    <!-- Chart -->
    <div class="card h-96 flex flex-col">
      <h3 class="text-lg font-medium text-gray-800 mb-4">Historial de Temperatura Global</h3>
      <div class="flex-1 relative">
        <Line :data="chartData" :options="chartOptions" />
      </div>
    </div>
  </div>
</template>
