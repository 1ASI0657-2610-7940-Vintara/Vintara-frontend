<script setup>
import { ref } from 'vue'
import apiClient from '../plugins/axios'
import Modal from '../components/Modal.vue'
import { useToastStore } from '../store/toast'

const toastStore = useToastStore()

// Endpoint del analytics-service (via gateway)
const REPORTS_PATH = import.meta.env.VITE_REPORTS_ENDPOINT_PATH || '/analytics/reports'

// ---- Form: criterios ----
const startDate = ref('')
const endDate = ref('')
const language = ref('es')

// Widgets disponibles (según endpoints del analytics-service)
const availableWidgets = [
  { id: 'SupplyLevels', label: 'Niveles de Inventario' },
  { id: 'LowStockAlerts', label: 'Alertas de Bajo Stock' },
  { id: 'InventoryKpis', label: 'KPIs de Inventario' },
  { id: 'SupplyRotationMetrics', label: 'Métricas de Rotación' }
]
const selectedWidgets = ref(['SupplyLevels'])

const toggleWidget = (id) => {
  const idx = selectedWidgets.value.indexOf(id)
  if (idx === -1) selectedWidgets.value.push(id)
  else selectedWidgets.value.splice(idx, 1)
}

// ---- Historial (solo en sesión) ----
const reports = ref([])
let sessionCounter = 1

// ---- Modal ----
const showExportModal = ref(false)
const isExporting = ref(false)
const reportName = ref('')
const exportFormat = ref('PDF')

const openExportModal = () => {
  if (!startDate.value || !endDate.value) {
    toastStore.warning('Por favor, seleccione las fechas del reporte.', 'Campos Requeridos')
    return
  }
  if (new Date(startDate.value) > new Date(endDate.value)) {
    toastStore.warning('La fecha de inicio no puede ser mayor a la de fin.', 'Fechas Inválidas')
    return
  }
  if (selectedWidgets.value.length === 0) {
    toastStore.warning('Seleccione al menos un widget para incluir en el reporte.', 'Widgets Requeridos')
    return
  }
  reportName.value = `Reporte_Sanitario_${startDate.value}_a_${endDate.value}`
  showExportModal.value = true
}

const handleConfirmExport = async () => {
  isExporting.value = true

  const payload = {
    startDate: new Date(startDate.value).toISOString(),
    endDate: new Date(endDate.value).toISOString(),
    widgets: [...selectedWidgets.value],
    language: language.value
  }

  try {
    const response = await apiClient.post(REPORTS_PATH, payload, {
      responseType: 'blob'
    })

    // Descargar el PDF que devolvió el backend
    const contentType = response.headers['content-type'] || 'application/pdf'
    const blob = new Blob([response.data], { type: contentType })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${reportName.value}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    // Guardar en historial de sesión
    reports.value.unshift({
      idReporte: `REP-${new Date().getFullYear()}-${String(sessionCounter++).padStart(3, '0')}`,
      nombre: `${reportName.value}.pdf`,
      tipo: 'PDF',
      fechaGeneracion: new Date().toLocaleString('es-PE'),
      estado: 'Completado',
      widgets: [...selectedWidgets.value]
    })

    toastStore.success('El reporte fue generado y descargado con éxito.', 'Reporte Creado')
    showExportModal.value = false

    // Reset criterios
    startDate.value = ''
    endDate.value = ''
  } catch (error) {
    console.error('Error exporting report:', error)
    // Si el backend devolvió JSON de error dentro de un blob, intenta leerlo
    let msg = 'Ocurrió un error al generar el reporte.'
    if (error.response?.data instanceof Blob) {
      try {
        const text = await error.response.data.text()
        const parsed = JSON.parse(text)
        msg = parsed.message || parsed.title || msg
      } catch { /* keep default */ }
    }
    toastStore.error(msg, 'Error')
  } finally {
    isExporting.value = false
  }
}
</script>

<template>
  <div class="space-y-6 max-w-4xl mx-auto">
    <!-- Header -->
    <div class="flex items-center space-x-4 mb-8">
      <div class="bg-surface-container p-3 rounded-full text-primary flex items-center justify-center">
        <span class="material-symbols-outlined text-[36px]">bar_chart</span>
      </div>
      <div>
        <h2 class="font-headline-lg text-headline-lg text-on-surface mb-1">Generador de Reportes Sanitarios</h2>
        <p class="font-body-md text-body-md text-on-surface-variant">Módulo exclusivo para Inspectores QA y Autoridades Regulatorias.</p>
      </div>
    </div>

    <!-- Criteria Card -->
    <div class="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant overflow-hidden">
      <div class="p-6 border-b border-outline-variant bg-surface">
        <h3 class="font-headline-sm text-headline-sm text-on-surface">Criterios del Reporte</h3>
      </div>

      <div class="p-6 space-y-6 bg-surface-container-lowest">
        <!-- Dates -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block font-label-md text-label-md text-on-surface mb-2" for="start-date">Fecha de Inicio</label>
            <input
              id="start-date"
              type="date"
              v-model="startDate"
              class="w-full bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-body-md text-body-md text-on-surface p-2.5 transition-colors outline-none"
            />
          </div>
          <div>
            <label class="block font-label-md text-label-md text-on-surface mb-2" for="end-date">Fecha de Fin</label>
            <input
              id="end-date"
              type="date"
              v-model="endDate"
              class="w-full bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-body-md text-body-md text-on-surface p-2.5 transition-colors outline-none"
            />
          </div>
        </div>

        <!-- Widgets -->
        <div>
          <label class="block font-label-md text-label-md text-on-surface mb-2">Widgets a Incluir</label>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
            <label
              v-for="w in availableWidgets"
              :key="w.id"
              class="flex items-center gap-3 p-3 bg-surface border border-outline-variant rounded-lg cursor-pointer hover:border-primary transition-colors"
              :class="selectedWidgets.includes(w.id) ? 'border-primary bg-primary-container/20' : ''"
            >
              <input
                type="checkbox"
                :checked="selectedWidgets.includes(w.id)"
                @change="toggleWidget(w.id)"
                class="h-4 w-4 text-primary focus:ring-primary rounded"
              />
              <div>
                <p class="font-label-md text-label-md text-on-surface">{{ w.label }}</p>
                <p class="font-body-sm text-body-sm text-on-surface-variant text-[11px]">{{ w.id }}</p>
              </div>
            </label>
          </div>
        </div>

        <!-- Language -->
        <div>
          <label class="block font-label-md text-label-md text-on-surface mb-2" for="language">Idioma del Reporte</label>
          <select
            id="language"
            v-model="language"
            class="w-full bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-body-md text-body-md text-on-surface p-2.5 transition-colors outline-none"
          >
            <option value="es">Español</option>
            <option value="en">English</option>
          </select>
        </div>

        <!-- Info Panel -->
        <div class="bg-surface-container-low border border-outline-variant/60 p-4 rounded-lg flex items-start space-x-3">
          <span class="material-symbols-outlined text-primary mt-0.5 flex-shrink-0">info</span>
          <p class="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
            El reporte generado incluirá los widgets seleccionados, generado como PDF descargable en el idioma elegido.
          </p>
        </div>
      </div>

      <div class="bg-surface p-6 border-t border-outline-variant flex justify-end">
        <button
          @click="openExportModal"
          class="bg-rose-800 hover:bg-rose-900 text-white font-label-md text-label-md py-3 px-6 rounded-lg shadow-sm transition-all duration-200 flex items-center gap-2 active:scale-[0.99]"
        >
          <span class="material-symbols-outlined">download</span>
          Exportar Reporte Sanitario (PDF)
        </button>
      </div>
    </div>

    <!-- Historial de esta sesión -->
    <div class="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant overflow-hidden mt-8">
      <div class="p-6 border-b border-outline-variant bg-surface flex items-center justify-between">
        <h3 class="font-headline-sm text-headline-sm text-on-surface">Reportes de esta sesión</h3>
        <span class="text-xs text-slate-500 font-medium">{{ reports.length }} generados</span>
      </div>

      <div v-if="reports.length === 0" class="p-8 text-center text-slate-500 font-body-sm">
        Aún no has generado reportes en esta sesión.
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-outline-variant bg-surface-container-low/50">
              <th class="py-3 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">ID</th>
              <th class="py-3 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Nombre</th>
              <th class="py-3 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Widgets</th>
              <th class="py-3 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Fecha</th>
              <th class="py-3 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Estado</th>
            </tr>
          </thead>
          <tbody class="font-body-sm text-body-sm text-on-surface divide-y divide-outline-variant/50 bg-white">
            <tr v-for="report in reports" :key="report.idReporte" class="hover:bg-slate-50 transition-colors">
              <td class="py-3 px-6 font-mono font-semibold text-slate-700 text-xs">{{ report.idReporte }}</td>
              <td class="py-3 px-6 font-medium text-slate-900">{{ report.nombre }}</td>
              <td class="py-3 px-6 text-slate-600 text-xs">{{ report.widgets.join(', ') }}</td>
              <td class="py-3 px-6 text-slate-500 text-xs">{{ report.fechaGeneracion }}</td>
              <td class="py-3 px-6">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full font-label-sm text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {{ report.estado }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <Modal
      :show="showExportModal"
      title="Confirmar Generación de Reporte"
      size="md"
      @close="showExportModal = false"
    >
      <div class="space-y-4">
        <div>
          <label class="block font-label-md text-label-md text-slate-700 mb-1.5" for="modal-report-name">Nombre del Archivo</label>
          <input
            id="modal-report-name"
            type="text"
            v-model="reportName"
            class="w-full bg-slate-50 border border-outline-variant rounded-lg focus:ring-2 focus:ring-rose-800 focus:border-rose-800 font-body-md text-body-md text-slate-900 p-2.5 outline-none"
          />
        </div>

        <div class="bg-slate-50 border border-outline-variant/60 p-3 rounded-lg space-y-1">
          <p class="font-label-sm text-[12px] text-slate-500 uppercase tracking-wider">Resumen</p>
          <p class="font-body-sm text-body-sm text-slate-700"><strong>Periodo:</strong> {{ startDate }} → {{ endDate }}</p>
          <p class="font-body-sm text-body-sm text-slate-700"><strong>Widgets:</strong> {{ selectedWidgets.join(', ') }}</p>
          <p class="font-body-sm text-body-sm text-slate-700"><strong>Idioma:</strong> {{ language === 'es' ? 'Español' : 'English' }}</p>
        </div>

        <div class="bg-rose-50 border border-rose-100/60 p-4 rounded-lg flex items-start space-x-3 mt-4">
          <span class="material-symbols-outlined text-rose-800 mt-0.5 flex-shrink-0">verified_user</span>
          <p class="font-body-sm text-[13px] text-rose-900 leading-relaxed">
            El reporte se generará en el servidor y descargará automáticamente al finalizar.
          </p>
        </div>
      </div>

      <template #footer>
        <button
          @click="showExportModal = false"
          :disabled="isExporting"
          class="px-4 py-2.5 text-slate-600 hover:bg-slate-100 font-label-md text-label-md rounded-lg transition-colors"
        >
          Cancelar
        </button>
        <button
          @click="handleConfirmExport"
          :disabled="isExporting"
          class="bg-rose-800 hover:bg-rose-900 text-white font-label-md text-label-md py-2.5 px-5 rounded-lg shadow-sm transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
        >
          <span v-if="isExporting" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
          <span v-else class="material-symbols-outlined text-[18px]">download</span>
          {{ isExporting ? 'Generando...' : 'Generar y Descargar' }}
        </button>
      </template>
    </Modal>
  </div>
</template>

<style scoped>
/* Estilos locales */
</style>