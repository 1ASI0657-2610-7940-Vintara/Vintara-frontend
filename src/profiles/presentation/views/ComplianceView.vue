<script setup>
import { ref } from 'vue'

const checklists = ref([
  { id: 1, title: 'Limpieza Diaria - Zona Fría', assignedTo: 'Juan Pérez', dueDate: '2026-06-07', status: 'Completado' },
  { id: 2, title: 'Calibración de Sensores Mensual', assignedTo: 'María Gómez', dueDate: '2026-06-10', status: 'Pendiente' },
  { id: 3, title: 'Auditoría de Higiene y Sanitización', assignedTo: 'Carlos Ruiz', dueDate: '2026-06-08', status: 'Pendiente' },
  { id: 4, title: 'Revisión de Extractores', assignedTo: 'Ana Martínez', dueDate: '2026-06-06', status: 'Completado' },
])

const handleNewChecklist = () => {
  alert('Funcionalidad de crear checklist disponible en la próxima versión.')
}

const handleStartChecklist = (title) => {
  alert(`Iniciando Checklist: ${title}`)
}
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="mb-8 flex justify-between items-end">
      <div>
        <h2 class="font-headline-lg text-headline-lg text-on-surface mb-2">Checklists y Auditorías</h2>
        <p class="font-body-md text-body-md text-on-surface-variant">Controle el cumplimiento de normas de inocuidad y sanitización.</p>
      </div>
      <button 
        @click="handleNewChecklist"
        class="bg-primary hover:bg-primary-container text-on-primary hover:text-on-primary-container font-label-md text-label-md py-2px px-4 h-[2.5rem] rounded-lg shadow-sm transition-all duration-200 flex items-center gap-2"
      >
        <span class="material-symbols-outlined text-[18px]">add_task</span>
        Nuevo Checklist
      </button>
    </div>

    <!-- Columns Container -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Left Column: Pending -->
      <div class="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-6 hover:shadow-md transition-shadow duration-200">
        <h3 class="font-headline-sm text-headline-sm text-on-surface mb-4 flex items-center gap-2">
          <span class="material-symbols-outlined text-secondary">hourglass_empty</span>
          Pendientes por Completar
        </h3>
        
        <ul class="space-y-3">
          <li 
            v-for="item in checklists.filter(c => c.status === 'Pendiente')" 
            :key="item.id" 
            class="bg-surface border border-outline-variant rounded-lg p-4 flex justify-between items-center transition-all hover:shadow-sm"
          >
            <div>
              <p class="font-medium text-on-surface font-label-md text-label-md mb-1">{{ item.title }}</p>
              <p class="font-body-sm text-body-sm text-on-surface-variant">
                Asignado a: {{ item.assignedTo }} <span class="mx-1 opacity-50">|</span> Vence: {{ item.dueDate }}
              </p>
            </div>
            <button 
              @click="handleStartChecklist(item.title)"
              class="font-label-md text-label-md py-1.5 px-3 bg-secondary hover:bg-secondary-container text-on-secondary rounded-lg transition-colors flex-shrink-0"
            >
              Comenzar
            </button>
          </li>
        </ul>
      </div>

      <!-- Right Column: Completed -->
      <div class="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-6 hover:shadow-md transition-shadow duration-200">
        <h3 class="font-headline-sm text-headline-sm text-on-surface mb-4 flex items-center gap-2">
          <span class="material-symbols-outlined text-tertiary-container">check_circle</span>
          Completados Recientemente
        </h3>
        
        <ul class="space-y-3">
          <li 
            v-for="item in checklists.filter(c => c.status === 'Completado')" 
            :key="item.id" 
            class="bg-surface-container-low/50 border border-outline-variant/60 rounded-lg p-4 flex justify-between items-center opacity-85"
          >
            <div>
              <p class="font-medium text-on-surface-variant font-label-md text-label-md line-through mb-1">{{ item.title }}</p>
              <p class="font-body-sm text-body-sm text-on-surface-variant/75">
                Completado por: {{ item.assignedTo }}
              </p>
            </div>
            <span class="text-tertiary-container flex items-center justify-center bg-tertiary-fixed p-1 rounded-full flex-shrink-0">
              <span class="material-symbols-outlined text-[20px]">check</span>
            </span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Transiciones si es necesario */
</style>
