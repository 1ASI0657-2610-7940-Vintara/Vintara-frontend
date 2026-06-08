<script setup>
import { ref } from 'vue'

const assets = ref([
  { id: 1, name: 'Congelador Principal A', type: 'Congelador', idealRange: '-20°C a -15°C', status: 'Operativo' },
  { id: 2, name: 'Horno Industrial B', type: 'Horno', idealRange: '180°C a 220°C', status: 'Mantenimiento' },
  { id: 3, name: 'Cámara Frigorífica 1', type: 'Cámara', idealRange: '2°C a 8°C', status: 'Operativo' },
  { id: 4, name: 'Ultracongelador Bio', type: 'Congelador', idealRange: '-80°C a -70°C', status: 'Alerta' },
])

const isModalOpen = ref(false)
const newAssetName = ref('')
const newAssetType = ref('Congelador')
const newAssetRange = ref('')

const openModal = () => {
  newAssetName.value = ''
  newAssetRange.value = ''
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const saveAsset = () => {
  if (newAssetName.value.trim() === '') return
  assets.value.push({
    id: Date.now(),
    name: newAssetName.value,
    type: newAssetType.value,
    idealRange: newAssetRange.value || 'N/D',
    status: 'Operativo'
  })
  closeModal()
}

const getAssetIcon = (type) => {
  switch (type) {
    case 'Congelador': return 'kitchen'
    case 'Horno': return 'local_fire_department'
    case 'Cámara': return 'severe_cold'
    default: return 'devices'
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header Area -->
    <div class="mb-8 flex justify-between items-end">
      <div>
        <h2 class="font-headline-lg text-headline-lg text-on-surface mb-2">Inventario de Activos</h2>
        <p class="font-body-md text-body-md text-on-surface-variant">Gestione y monitoree todos los contenedores e instalaciones del viñedo.</p>
      </div>
      <button 
        @click="openModal" 
        class="bg-primary hover:bg-primary-container text-on-primary hover:text-on-primary-container font-label-md text-label-md py-2px px-4 h-[2.5rem] rounded-lg shadow-sm transition-all duration-200 flex items-center gap-2"
      >
        <span class="material-symbols-outlined text-[18px]">add</span>
        Nuevo Activo
      </button>
    </div>

    <!-- Data Table Card -->
    <div class="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant overflow-hidden">
      <div class="p-6 border-b border-outline-variant flex justify-between items-center bg-surface">
        <h3 class="font-headline-sm text-headline-sm text-on-surface">Activos en Producción</h3>
      </div>
      
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-outline-variant bg-surface-container-low/50">
              <th class="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Nombre del Equipo</th>
              <th class="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Tipo</th>
              <th class="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Rango Ideal</th>
              <th class="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Estado</th>
              <th class="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="font-body-sm text-body-sm text-on-surface divide-y divide-outline-variant/50">
            <tr 
              v-for="asset in assets" 
              :key="asset.id" 
              class="hover:bg-surface-container-low transition-colors duration-200 group"
              :class="asset.status === 'Alerta' ? 'bg-error-container/10' : ''"
            >
              <td class="py-4 px-6 font-medium flex items-center gap-3">
                <div 
                  class="w-8 h-8 rounded-md flex items-center justify-center transition-colors"
                  :class="[
                    asset.status === 'Alerta' 
                      ? 'bg-error-container text-error group-hover:bg-error group-hover:text-on-error'
                      : asset.status === 'Mantenimiento'
                      ? 'bg-surface-container text-secondary group-hover:bg-secondary group-hover:text-on-secondary'
                      : 'bg-surface-container text-primary group-hover:bg-primary group-hover:text-on-primary'
                  ]"
                >
                  <span class="material-symbols-outlined text-[18px]">{{ getAssetIcon(asset.type) }}</span>
                </div>
                {{ asset.name }}
              </td>
              <td class="py-4 px-6 text-on-surface-variant">{{ asset.type }}</td>
              <td class="py-4 px-6 font-medium">{{ asset.idealRange }}</td>
              <td class="py-4 px-6">
                <!-- Badge Operativo -->
                <span 
                  v-if="asset.status === 'Operativo'" 
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full font-label-sm text-label-sm bg-tertiary-fixed text-tertiary-container"
                >
                  Operativo
                </span>
                <!-- Badge Mantenimiento -->
                <span 
                  v-else-if="asset.status === 'Mantenimiento'" 
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full font-label-sm text-label-sm bg-secondary-fixed text-on-secondary-fixed"
                >
                  Mantenimiento
                </span>
                <!-- Badge Alerta -->
                <span 
                  v-else 
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full font-label-sm text-label-sm bg-error text-on-error"
                >
                  Alerta
                </span>
              </td>
              <td class="py-4 px-6 text-right">
                <button class="text-primary hover:text-primary-container font-label-md transition-colors mr-4">
                  Editar
                </button>
                <button class="text-error hover:text-on-error-container font-label-md transition-colors">
                  Eliminar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Form (Create new Asset) -->
    <transition name="fade">
      <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop Blur -->
        <div class="fixed inset-0 bg-inverse-surface/60 backdrop-blur-sm transition-opacity" @click="closeModal"></div>
        
        <!-- Modal Container -->
        <div class="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-2xl w-full max-w-md overflow-hidden transform transition-all z-10">
          <div class="p-6 border-b border-outline-variant flex justify-between items-center bg-surface">
            <h3 class="font-headline-sm text-headline-sm text-on-surface">Agregar Nuevo Activo</h3>
            <button @click="closeModal" class="text-on-surface-variant hover:text-on-surface flex items-center justify-center">
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
          
          <div class="p-6 space-y-4 bg-surface-container-lowest">
            <div>
              <label class="block font-label-md text-label-md text-on-surface mb-1" for="asset-name">Nombre del Activo</label>
              <input 
                id="asset-name"
                type="text" 
                v-model="newAssetName"
                class="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-body-md text-body-md text-on-surface placeholder-on-surface-variant transition-colors outline-none"
                placeholder="Ej: Silo Fermentador C2"
              />
            </div>
            
            <div>
              <label class="block font-label-md text-label-md text-on-surface mb-1" for="asset-type">Tipo de Activo</label>
              <select 
                id="asset-type"
                v-model="newAssetType"
                class="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-body-md text-body-md text-on-surface transition-colors outline-none"
              >
                <option value="Congelador">Congelador</option>
                <option value="Horno">Horno</option>
                <option value="Cámara">Cámara Frigorífica</option>
              </select>
            </div>
            
            <div>
              <label class="block font-label-md text-label-md text-on-surface mb-1" for="asset-range">Rango Ideal de Temperatura</label>
              <input 
                id="asset-range"
                type="text" 
                v-model="newAssetRange"
                class="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-body-md text-body-md text-on-surface placeholder-on-surface-variant transition-colors outline-none"
                placeholder="Ej: 12°C a 16°C"
              />
            </div>
          </div>
          
          <div class="bg-surface p-6 border-t border-outline-variant flex justify-end gap-3">
            <button 
              type="button" 
              @click="closeModal" 
              class="px-4 py-2 border border-outline-variant rounded-lg bg-surface text-on-surface hover:bg-surface-container font-label-md text-label-md transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="button" 
              @click="saveAsset" 
              class="px-4 py-2 bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md rounded-lg transition-colors"
            >
              Guardar Activo
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
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
