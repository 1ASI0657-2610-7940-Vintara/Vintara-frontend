<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Modal from '../components/Modal.vue'
import { useToastStore } from '../store/toast'

const toastStore = useToastStore()

const startDate = ref('')
const endDate = ref('')
const facility = ref('all')

const reports = ref([])
const isLoadingReports = ref(true)

const showExportModal = ref(false)
const isExporting = ref(false)

// Form fields inside modal
const reportName = ref('')
const exportFormat = ref('PDF')
const sendEmail = ref(false)

const fetchReports = async () => {
  try {
    const response = await axios.get('/mocks/reports.json')
    reports.value = response.data
  } catch (error) {
    console.error('Error fetching reports:', error)
    toastStore.error('No se pudo cargar el historial de reportes.', 'Error')
  } finally {
    isLoadingReports.value = false
  }
}

onMounted(() => {
  fetchReports()
})

const openExportModal = () => {
  if (!startDate.value || !endDate.value) {
    toastStore.warning('Por favor, seleccione las fechas para el reporte.', 'Campos Requeridos')
    return
  }
  
  // Format clean name
  let facilityName = 'General'
  if (facility.value === 'zona_fria') facilityName = 'Cadena_Frio'
  if (facility.value === 'zona_caliente') facilityName = 'Hornos'
  if (facility.value === 'almacen') facilityName = 'Almacen'
  
  reportName.value = `Reporte_Sanitario_${facilityName}_${startDate.value}_a_${endDate.value}`
  showExportModal.value = true
}

const handleConfirmExport = async () => {
  isExporting.value = true
  try {
    const payload = {
      nombre: reportName.value,
      tipo: exportFormat.value === 'PDF' ? 'Mensual' : 'Auditoría',
      fechaInicio: startDate.value,
      fechaFin: endDate.value,
      instalacion: facility.value === 'all' ? 'Todas las instalaciones' : facility.value,
      sendEmail: sendEmail.value
    }
    
    // Simulated POST request via the global axios interceptor
    await axios.post('/mocks/reports.json', payload)
    
    // Prepend to local reports list to simulate real-time save
    const cleanFacilityName = facility.value === 'all' 
      ? 'Todas las instalaciones' 
      : facility.value === 'zona_fria'
        ? 'Zona de Cadena de Frío'
        : facility.value === 'zona_caliente'
          ? 'Zona de Hornos e Incubadoras'
          : 'Almacén General'

    const newReport = {
      idReporte: `REP-2026-00${reports.value.length + 1}`,
      nombre: reportName.value + (exportFormat.value === 'PDF' ? '.pdf' : '.xlsx'),
      tipo: exportFormat.value,
      fechaGeneracion: new Date().toISOString().replace('T', ' ').substring(0, 19),
      estado: 'Completado',
      instalacion: cleanFacilityName
    }
    reports.value.unshift(newReport)
    
    toastStore.success('El reporte sanitario ha sido generado y exportado con éxito.', 'Reporte Creado')
    showExportModal.value = false
    
    // Reset criteria form
    startDate.value = ''
    endDate.value = ''
    facility.value = 'all'
  } catch (error) {
    console.error('Error exporting report:', error)
    toastStore.error('Ocurrió un error al exportar el reporte.', 'Error')
  } finally {
    isExporting.value = false
  }
}
</script>

<template>
  <div class="space-y-6 max-w-4xl mx-auto">
    <!-- Page Title Header -->
    <div class="flex items-center space-x-4 mb-8">
      <div class="bg-surface-container p-3 rounded-full text-primary flex items-center justify-center">
        <span class="material-symbols-outlined text-[36px]">bar_chart</span>
      </div>
      <div>
        <h2 class="font-headline-lg text-headline-lg text-on-surface mb-1">Generador de Reportes Sanitarios</h2>
        <p class="font-body-md text-body-md text-on-surface-variant">Módulo exclusivo para Inspectores QA y Autoridades Regulatorias.</p>
      </div>
    </div>

    <!-- Report Criteria Card -->
    <div class="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant overflow-hidden">
      <!-- Card Header -->
      <div class="p-6 border-b border-outline-variant bg-surface">
        <h3 class="font-headline-sm text-headline-sm text-on-surface">Criterios del Reporte</h3>
      </div>
      
      <!-- Card Body Form -->
      <div class="p-6 space-y-6 bg-surface-container-lowest">
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

        <div>
          <label class="block font-label-md text-label-md text-on-surface mb-2" for="facility">Instalación / Zona</label>
          <select 
            id="facility"
            v-model="facility" 
            class="w-full bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-body-md text-body-md text-on-surface p-2.5 transition-colors outline-none"
          >
            <option value="all">Todas las instalaciones</option>
            <option value="zona_fria">Zona de Cadena de Frío</option>
            <option value="zona_caliente">Zona de Hornos e Incubadoras</option>
            <option value="almacen">Almacén General</option>
          </select>
        </div>

        <!-- Informative Alert Panel -->
        <div class="bg-surface-container-low border border-outline-variant/60 p-4 rounded-lg flex items-start space-x-3">
          <span class="material-symbols-outlined text-primary mt-0.5 flex-shrink-0">info</span>
          <p class="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
            El reporte generado incluirá el historial completo de telemetría (temperatura y humedad), desviaciones detectadas, alertas críticas y el estado de todas las auditorías de cumplimiento en el período seleccionado.
          </p>
        </div>
      </div>

      <!-- Card Footer Actions -->
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

    <!-- History list table -->
    <div class="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant overflow-hidden mt-8">
      <div class="p-6 border-b border-outline-variant bg-surface flex items-center justify-between">
        <h3 class="font-headline-sm text-headline-sm text-on-surface">Historial de Reportes Generados</h3>
        <span class="text-xs text-slate-500 font-medium">Bajo Demanda</span>
      </div>

      <div v-if="isLoadingReports" class="p-8 flex flex-col items-center justify-center gap-3">
        <div class="animate-spin rounded-full h-8 w-8 border-4 border-rose-800 border-t-transparent"></div>
        <p class="text-sm text-slate-500">Cargando historial de reportes...</p>
      </div>

      <div v-else-if="reports.length === 0" class="p-8 text-center text-slate-500">
        No hay reportes generados en el historial.
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-outline-variant bg-surface-container-low/50">
              <th class="py-3 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">ID Reporte</th>
              <th class="py-3 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Nombre del Archivo</th>
              <th class="py-3 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Instalación</th>
              <th class="py-3 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Fecha Generación</th>
              <th class="py-3 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Estado</th>
              <th class="py-3 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="font-body-sm text-body-sm text-on-surface divide-y divide-outline-variant/50 bg-white">
            <tr v-for="report in reports" :key="report.idReporte" class="hover:bg-slate-50 transition-colors">
              <td class="py-3 px-6 font-mono font-semibold text-slate-700 text-xs">{{ report.idReporte }}</td>
              <td class="py-3 px-6 font-medium text-slate-900">{{ report.nombre }}</td>
              <td class="py-3 px-6 text-slate-600">{{ report.instalacion }}</td>
              <td class="py-3 px-6 text-slate-500 text-xs">{{ report.fechaGeneracion }}</td>
              <td class="py-3 px-6">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full font-label-sm text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {{ report.estado }}
                </span>
              </td>
              <td class="py-3 px-6 text-center">
                <button class="text-rose-800 hover:text-rose-900 hover:bg-rose-50 p-1.5 rounded-lg transition-all flex items-center justify-center mx-auto" title="Descargar Reporte">
                  <span class="material-symbols-outlined text-[20px]">download</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Reusable Modal Component -->
    <Modal
      :show="showExportModal"
      title="Configurar Exportación de Reporte"
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

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div>
            <label class="block font-label-md text-label-md text-slate-700 mb-1.5" for="modal-format">Formato de Exportación</label>
            <select 
              id="modal-format"
              v-model="exportFormat" 
              class="w-full bg-slate-50 border border-outline-variant rounded-lg focus:ring-2 focus:ring-rose-800 focus:border-rose-800 font-body-md text-body-md text-slate-900 p-2.5 outline-none"
            >
              <option value="PDF">Documento PDF (.pdf)</option>
              <option value="EXCEL">Hoja de Cálculo Excel (.xlsx)</option>
            </select>
          </div>
          
          <div class="flex items-center pt-6 md:pt-4">
            <label class="relative inline-flex items-center cursor-pointer select-none">
              <input 
                type="checkbox" 
                v-model="sendEmail" 
                class="sr-only peer"
              />
              <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-800 relative"></div>
              <span class="ml-3 font-label-md text-label-md text-slate-700">Enviar por correo</span>
            </label>
          </div>
        </div>

        <div class="bg-rose-50 border border-rose-100/60 p-4 rounded-lg flex items-start space-x-3 mt-4">
          <span class="material-symbols-outlined text-rose-800 mt-0.5 flex-shrink-0">verified_user</span>
          <p class="font-body-sm text-[13px] text-rose-900 leading-relaxed">
            Este reporte será firmado digitalmente bajo las normas de WineSoft y se archivará automáticamente en el historial de cumplimiento regulatorio.
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
          <span v-else class="material-symbols-outlined text-[18px]">save</span>
          {{ isExporting ? 'Exportando...' : 'Generar y Guardar' }}
        </button>
      </template>
    </Modal>
  </div>
</template>

<style scoped>
/* Estilos locales si se requiere */
</style>

