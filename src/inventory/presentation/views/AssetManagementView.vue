<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToastStore } from '@/shared/application/toast.store'
import { useInventoryStore } from '../../application/inventory.store'
import { useInventoryAlerts } from '../composables/useInventoryAlerts'
import { useSubscriptionStore } from '@/subscription/application/subscription.store'
import DeviceLimitModal from '@/subscription/presentation/components/DeviceLimitModal.vue'

const toastStore = useToastStore()
const suppliesStore = useInventoryStore()
const subscriptionStore = useSubscriptionStore()
const showDeviceLimitModal = ref(false)

const {
  lowStockThreshold,
  expiringWindowDays,
  isLowStock,
  isExpired,
  isExpiringSoon,
  daysUntilExpiration,
  getExpiration,
  setExpiration,
  clearExpiration
} = useInventoryAlerts()

// ---- Estado ----
const supplies = computed(() => suppliesStore.supplies)
const isLoading = computed(() => suppliesStore.isLoading)
const isSaving = ref(false)
const deletingIds = ref(new Set())

// ---- Filtros ----
const searchQuery = ref('')
const filterUnit = ref('ALL')
const filterSupplier = ref('ALL')
const filterAlert = ref('ALL') // ALL | LOW_STOCK | EXPIRING | EXPIRED

// ---- Modal ----
const isModalOpen = ref(false)
const isEditMode = ref(false)
const editingId = ref(null)

const supplyName = ref('')
const quantity = ref(0)
const unit = ref('unidad')
const supplier = ref('')
const price = ref(0)
const date = ref('')
const expirationDate = ref('')

const unitOptions = ['unidad', 'botella', 'litro', 'kg', 'gramos', 'caja']

// ---- Opciones dinámicas ----
const availableUnits = computed(() => {
  const units = new Set(supplies.value.map((s) => s.unit).filter(Boolean))
  return ['ALL', ...Array.from(units).sort()]
})

const availableSuppliers = computed(() => {
  const suppliers = new Set(supplies.value.map((s) => s.supplier).filter(Boolean))
  return ['ALL', ...Array.from(suppliers).sort()]
})

// ---- Filtrado ----
const filteredSupplies = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return supplies.value.filter((s) => {
    const matchesSearch =
      !q ||
      s.supplyName?.toLowerCase().includes(q) ||
      s.supplier?.toLowerCase().includes(q)
    const matchesUnit = filterUnit.value === 'ALL' || s.unit === filterUnit.value
    const matchesSupplier =
      filterSupplier.value === 'ALL' || s.supplier === filterSupplier.value

    let matchesAlert = true
    if (filterAlert.value === 'LOW_STOCK') matchesAlert = isLowStock(s)
    else if (filterAlert.value === 'EXPIRING') matchesAlert = isExpiringSoon(s)
    else if (filterAlert.value === 'EXPIRED') matchesAlert = isExpired(s)

    return matchesSearch && matchesUnit && matchesSupplier && matchesAlert
  })
})

const hasActiveFilters = computed(() => {
  return (
    searchQuery.value.trim() !== '' ||
    filterUnit.value !== 'ALL' ||
    filterSupplier.value !== 'ALL' ||
    filterAlert.value !== 'ALL'
  )
})

const clearFilters = () => {
  searchQuery.value = ''
  filterUnit.value = 'ALL'
  filterSupplier.value = 'ALL'
  filterAlert.value = 'ALL'
}

// ---- KPI header ----
const alertCounts = computed(() => {
  let low = 0, soon = 0, exp = 0
  for (const s of supplies.value) {
    if (isLowStock(s)) low++
    if (isExpired(s)) exp++
    else if (isExpiringSoon(s)) soon++
  }
  return { low, soon, exp }
})

// ---- Fetch ----
const fetchSupplies = async () => {
  try {
    await suppliesStore.fetchSupplies()
  } catch (error) {
    toastStore.error('No se pudieron cargar los insumos.', 'Error')
  }
}

onMounted(() => {
  fetchSupplies()
})

// ---- Modal ----
const openCreateModal = () => {
  // ── Verificar límite del plan antes de abrir el modal ──
  if (subscriptionStore.isOverDeviceLimit) {
    showDeviceLimitModal.value = true
    return
  }
  isEditMode.value = false
  editingId.value = null
  supplyName.value = ''
  quantity.value = 0
  unit.value = 'unidad'
  supplier.value = ''
  price.value = 0
  date.value = new Date().toISOString().split('T')[0]
  expirationDate.value = ''
  isModalOpen.value = true
}

const openEditModal = (supply) => {
  isEditMode.value = true
  editingId.value = supply.id
  supplyName.value = supply.supplyName
  quantity.value = supply.quantity
  unit.value = supply.unit
  supplier.value = supply.supplier
  price.value = supply.price
  date.value = supply.date ? supply.date.split('T')[0] : ''
  expirationDate.value = getExpiration(supply.id) || ''
  isModalOpen.value = true
}

const closeModal = () => {
  if (isSaving.value) return
  isModalOpen.value = false
}

// ---- Save ----
const saveSupply = async () => {
  if (!supplyName.value.trim() || !supplier.value.trim()) {
    toastStore.warning('Complete el nombre y el proveedor.', 'Campos requeridos')
    return
  }

  isSaving.value = true
  const basePayload = {
    supplyName: supplyName.value.trim(),
    quantity: Number(quantity.value),
    unit: unit.value,
    supplier: supplier.value.trim(),
    price: Number(price.value),
    date: date.value ? new Date(date.value).toISOString() : new Date().toISOString()
  }

  try {
    let savedId
    if (isEditMode.value) {
      await suppliesStore.updateSupply(editingId.value, basePayload)
      savedId = editingId.value
      toastStore.success(`Insumo "${basePayload.supplyName}" actualizado.`, 'Actualizado')
    } else {
      const data = await suppliesStore.createSupply(basePayload)
      savedId = data?.id
      toastStore.success(`Insumo "${basePayload.supplyName}" creado.`, 'Creado')
      subscriptionStore.incrementDeviceCount()
    }

    // Guardar fecha de vencimiento en localStorage (no persiste en backend aún)
    if (savedId != null) {
      if (expirationDate.value) setExpiration(savedId, expirationDate.value)
      else clearExpiration(savedId)
    }

    isModalOpen.value = false
  } catch (error) {
    console.error('Error saving supply:', error)
    toastStore.error(
      error.response?.data?.message || 'No se pudo guardar el insumo.',
      'Error'
    )
  } finally {
    isSaving.value = false
  }
}

// ---- Delete ----
const deleteSupply = async (supply) => {
  if (!confirm(`¿Eliminar "${supply.supplyName}"?`)) return

  deletingIds.value.add(supply.id)
  try {
    await suppliesStore.deleteSupply(supply.id)
    clearExpiration(supply.id)
    toastStore.success(`Insumo "${supply.supplyName}" eliminado.`, 'Eliminado')
    subscriptionStore.decrementDeviceCount()
  } catch (error) {
    console.error('Error deleting supply:', error)
    toastStore.error('No se pudo eliminar el insumo.', 'Error')
  } finally {
    deletingIds.value.delete(supply.id)
  }
}

// ---- Helpers ----
const getSupplyIcon = (name = '') => {
  const n = name.toLowerCase()
  if (n.includes('ron') || n.includes('vodka') || n.includes('gin') || n.includes('whisky')) return 'liquor'
  if (n.includes('jugo') || n.includes('agua') || n.includes('gaseosa')) return 'local_drink'
  if (n.includes('hielo')) return 'ac_unit'
  if (n.includes('corcho') || n.includes('etiqueta')) return 'inventory_2'
  return 'inventory'
}

const formatPrice = (p) => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency', currency: 'PEN', minimumFractionDigits: 2
  }).format(p ?? 0)
}

const formatDate = (d) => {
  if (!d) return '—'
  let parsedDate = d
  if (typeof d === 'string' && d.includes('T')) {
    const timePart = d.split('T')[1]
    const hasTimezone = d.endsWith('Z') || timePart.includes('+') || timePart.includes('-')
    if (!hasTimezone) {
      parsedDate = d + 'Z'
    }
  }
  return new Date(parsedDate).toLocaleDateString('es-PE', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  })
}

// ---- Stock Movement states ----
const isMovementModalOpen = ref(false)
const selectedSupplyForMovement = ref(null)
const movementType = ref('ENTRY') // ENTRY | EXIT
const movementQuantity = ref(1)
const movementReason = ref('')
const movementDate = ref(new Date().toISOString().split('T')[0])
const isSavingMovement = ref(false)

const openMovementModal = (supply) => {
  selectedSupplyForMovement.value = supply
  movementType.value = 'ENTRY'
  movementQuantity.value = 1
  movementReason.value = ''
  movementDate.value = new Date().toISOString().split('T')[0]
  isMovementModalOpen.value = true
}

const saveMovement = async () => {
  if (movementQuantity.value <= 0) {
    toastStore.warning('La cantidad debe ser mayor que 0.', 'Cantidad Inválida')
    return
  }
  if (movementType.value === 'EXIT' && movementQuantity.value > selectedSupplyForMovement.value.quantity) {
    toastStore.warning('No hay suficiente stock para realizar esta salida.', 'Stock Insuficiente')
    return
  }

  isSavingMovement.value = true
  try {
    const dateObj = new Date(movementDate.value)
    const now = new Date()
    dateObj.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds())

    await suppliesStore.createStockMovement({
      supplyId: selectedSupplyForMovement.value.id,
      quantity: Math.floor(movementQuantity.value),
      type: movementType.value,
      reason: movementReason.value.trim(),
      date: dateObj.toISOString()
    })
    toastStore.success('Movimiento de stock registrado con éxito.', 'Éxito')
    isMovementModalOpen.value = false
  } catch (error) {
    toastStore.error(error.response?.data?.error || 'No se pudo registrar el movimiento.', 'Error')
  } finally {
    isSavingMovement.value = false
  }
}

// ---- History Modal states ----
const isHistoryModalOpen = ref(false)
const selectedSupplyForHistory = ref(null)
const isHistoryLoading = ref(false)

const filteredMovements = computed(() => {
  if (!selectedSupplyForHistory.value) return []
  return suppliesStore.movements.filter(m => m.supplyId === selectedSupplyForHistory.value.id)
})

const openHistoryModal = async (supply) => {
  selectedSupplyForHistory.value = supply
  isHistoryModalOpen.value = true
  isHistoryLoading.value = true
  try {
    await suppliesStore.fetchStockMovements()
  } catch (error) {
    toastStore.error('No se pudo cargar el historial de movimientos.', 'Error')
  } finally {
    isHistoryLoading.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="mb-8 flex justify-between items-end">
      <div>
        <h2 class="font-headline-lg text-headline-lg text-on-surface mb-2">Inventario de Insumos</h2>
        <p class="font-body-md text-body-md text-on-surface-variant">
          Gestione los insumos utilizados en la producción de bebidas.
        </p>
      </div>
      <button
        @click="openCreateModal"
        class="bg-primary hover:bg-primary-container text-on-primary hover:text-on-primary-container font-label-md text-label-md py-2px px-4 h-[2.5rem] rounded-lg shadow-sm transition-all duration-200 flex items-center gap-2"
      >
        <span class="material-symbols-outlined text-[18px]">add</span>
        Nuevo Insumo
      </button>
    </div>

    <!-- KPI Alerts Bar (click para filtrar) -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <button
        @click="filterAlert = filterAlert === 'LOW_STOCK' ? 'ALL' : 'LOW_STOCK'"
        class="bg-surface-container-lowest rounded-xl p-4 border-2 flex items-center gap-3 transition-all hover:shadow-md"
        :class="filterAlert === 'LOW_STOCK' ? 'border-amber-500' : 'border-outline-variant'"
      >
        <div class="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
          <span class="material-symbols-outlined text-amber-600 text-[20px]" style="font-variation-settings: 'FILL' 1;">warning</span>
        </div>
        <div class="text-left">
          <p class="font-label-sm text-label-sm text-on-surface-variant">Stock Bajo</p>
          <p class="font-headline-sm text-headline-sm text-amber-600 font-bold">{{ alertCounts.low }}</p>
          <p class="text-[10px] text-on-surface-variant">≤ {{ lowStockThreshold }} unidades</p>
        </div>
      </button>

      <button
        @click="filterAlert = filterAlert === 'EXPIRING' ? 'ALL' : 'EXPIRING'"
        class="bg-surface-container-lowest rounded-xl p-4 border-2 flex items-center gap-3 transition-all hover:shadow-md"
        :class="filterAlert === 'EXPIRING' ? 'border-orange-500' : 'border-outline-variant'"
      >
        <div class="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
          <span class="material-symbols-outlined text-orange-600 text-[20px]" style="font-variation-settings: 'FILL' 1;">hourglass_top</span>
        </div>
        <div class="text-left">
          <p class="font-label-sm text-label-sm text-on-surface-variant">Por Vencer</p>
          <p class="font-headline-sm text-headline-sm text-orange-600 font-bold">{{ alertCounts.soon }}</p>
          <p class="text-[10px] text-on-surface-variant">Próximos {{ expiringWindowDays }} días</p>
        </div>
      </button>

      <button
        @click="filterAlert = filterAlert === 'EXPIRED' ? 'ALL' : 'EXPIRED'"
        class="bg-surface-container-lowest rounded-xl p-4 border-2 flex items-center gap-3 transition-all hover:shadow-md"
        :class="filterAlert === 'EXPIRED' ? 'border-rose-500' : 'border-outline-variant'"
      >
        <div class="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center flex-shrink-0">
          <span class="material-symbols-outlined text-rose-600 text-[20px]" style="font-variation-settings: 'FILL' 1;">event_busy</span>
        </div>
        <div class="text-left">
          <p class="font-label-sm text-label-sm text-on-surface-variant">Vencidos</p>
          <p class="font-headline-sm text-headline-sm text-rose-600 font-bold">{{ alertCounts.exp }}</p>
          <p class="text-[10px] text-on-surface-variant">Requieren revisión</p>
        </div>
      </button>
    </div>

    <!-- Filters Bar -->
    <div class="bg-surface-container-lowest rounded-xl border border-outline-variant p-4">
      <div class="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        <div class="flex-1 relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span class="material-symbols-outlined text-on-surface-variant text-[20px]">search</span>
          </div>
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Buscar por nombre o proveedor..."
            class="w-full pl-10 pr-4 py-2.5 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-body-md text-body-md text-on-surface placeholder-on-surface-variant transition-colors outline-none"
          />
        </div>

        <div class="flex items-center gap-2 bg-surface border border-outline-variant rounded-lg px-3 py-2">
          <span class="material-symbols-outlined text-on-surface-variant text-[18px]">straighten</span>
          <select v-model="filterUnit" class="font-body-sm text-body-sm text-on-surface bg-transparent border-none outline-none cursor-pointer pr-1">
            <option value="ALL">Todas las unidades</option>
            <option v-for="u in availableUnits.slice(1)" :key="u" :value="u">{{ u }}</option>
          </select>
        </div>

        <div class="flex items-center gap-2 bg-surface border border-outline-variant rounded-lg px-3 py-2">
          <span class="material-symbols-outlined text-on-surface-variant text-[18px]">local_shipping</span>
          <select v-model="filterSupplier" class="font-body-sm text-body-sm text-on-surface bg-transparent border-none outline-none cursor-pointer pr-1 max-w-[200px] truncate">
            <option value="ALL">Todos los proveedores</option>
            <option v-for="s in availableSuppliers.slice(1)" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>

        <button
          v-if="hasActiveFilters"
          @click="clearFilters"
          class="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant font-label-sm text-label-sm text-on-surface-variant transition-colors"
        >
          <span class="material-symbols-outlined text-[16px]">filter_alt_off</span>
          Limpiar
        </button>
      </div>
    </div>

    <!-- Data Table -->
    <div class="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant overflow-hidden">
      <div class="p-6 border-b border-outline-variant flex justify-between items-center bg-surface">
        <h3 class="font-headline-sm text-headline-sm text-on-surface">Insumos Registrados</h3>
        <span class="font-label-sm text-label-sm text-on-surface-variant bg-surface-container px-3 py-1 rounded-full">
          <template v-if="hasActiveFilters">{{ filteredSupplies.length }} de {{ supplies.length }} registros</template>
          <template v-else>{{ supplies.length }} registros</template>
        </span>
      </div>

      <div v-if="isLoading" class="p-12 flex flex-col items-center justify-center gap-3">
        <div class="animate-spin rounded-full h-10 w-10 border-4 border-rose-800 border-t-transparent"></div>
        <p class="font-label-md text-on-surface-variant">Cargando insumos...</p>
      </div>

      <div v-else-if="supplies.length === 0" class="p-12 flex flex-col items-center justify-center gap-3 text-center">
        <span class="material-symbols-outlined text-on-surface-variant text-[48px] opacity-40">inventory_2</span>
        <p class="font-label-md text-on-surface-variant">No hay insumos registrados aún.</p>
        <button @click="openCreateModal" class="text-primary underline font-label-md">Crear el primero</button>
      </div>

      <div v-else-if="filteredSupplies.length === 0" class="p-12 flex flex-col items-center justify-center gap-3 text-center">
        <span class="material-symbols-outlined text-on-surface-variant text-[48px] opacity-40">search_off</span>
        <p class="font-label-md text-on-surface-variant">No se encontraron insumos con los filtros aplicados.</p>
        <button @click="clearFilters" class="text-primary underline font-label-md">Limpiar filtros</button>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-outline-variant bg-surface-container-low/50">
              <th class="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Insumo</th>
              <th class="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Cantidad</th>
              <th class="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Proveedor</th>
              <th class="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Precio</th>
              <th class="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Vencimiento</th>
              <th class="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="font-body-sm text-body-sm text-on-surface divide-y divide-outline-variant/50">
            <tr
              v-for="supply in filteredSupplies"
              :key="supply.id"
              class="hover:bg-surface-container-low transition-colors duration-200 group"
              :class="{
                'bg-rose-50/40': isExpired(supply),
                'bg-orange-50/30': !isExpired(supply) && isExpiringSoon(supply),
                'bg-amber-50/30': !isExpired(supply) && !isExpiringSoon(supply) && isLowStock(supply)
              }"
            >
              <td class="py-4 px-6 font-medium">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-md flex items-center justify-center bg-surface-container text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                    <span class="material-symbols-outlined text-[18px]">{{ getSupplyIcon(supply.supplyName) }}</span>
                  </div>
                  <div class="flex flex-col gap-0.5">
                    <span>{{ supply.supplyName }}</span>
                    <div class="flex gap-1 flex-wrap">
                      <span v-if="isLowStock(supply)" class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-medium">
                        <span class="material-symbols-outlined text-[11px]">warning</span> Stock bajo
                      </span>
                      <span v-if="isExpired(supply)" class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-medium">
                        <span class="material-symbols-outlined text-[11px]">event_busy</span> Vencido
                      </span>
                      <span v-else-if="isExpiringSoon(supply)" class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[10px] font-medium">
                        <span class="material-symbols-outlined text-[11px]">hourglass_top</span>
                        Vence en {{ daysUntilExpiration(supply.id) }}d
                      </span>
                    </div>
                  </div>
                </div>
              </td>
              <td class="py-4 px-6 font-mono">
                <span :class="isLowStock(supply) ? 'text-amber-700 font-bold' : ''">
                  {{ supply.quantity }}
                </span>
                <span class="text-on-surface-variant text-[12px]">{{ supply.unit }}</span>
              </td>
              <td class="py-4 px-6 text-on-surface-variant">{{ supply.supplier }}</td>
              <td class="py-4 px-6 font-medium">{{ formatPrice(supply.price) }}</td>
              <td class="py-4 px-6 text-on-surface-variant text-[12px]">
                <template v-if="getExpiration(supply.id)">
                  {{ formatDate(getExpiration(supply.id)) }}
                </template>
                <span v-else class="opacity-40">—</span>
              </td>
              <td class="py-4 px-6 text-right">
                <button
                  @click="openMovementModal(supply)"
                  class="text-secondary hover:text-secondary-container font-label-md transition-colors mr-4"
                >
                  Movimiento
                </button>
                <button
                  @click="openHistoryModal(supply)"
                  class="text-on-surface-variant hover:text-on-surface font-label-md transition-colors mr-4"
                >
                  Historial
                </button>
                <button
                  @click="openEditModal(supply)"
                  class="text-primary hover:text-primary-container font-label-md transition-colors mr-4"
                >
                  Editar
                </button>
                <button
                  @click="deleteSupply(supply)"
                  :disabled="deletingIds.has(supply.id)"
                  class="text-error hover:text-on-error-container font-label-md transition-colors disabled:opacity-50"
                >
                  {{ deletingIds.has(supply.id) ? 'Eliminando...' : 'Eliminar' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <transition name="fade">
      <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-inverse-surface/60 backdrop-blur-sm transition-opacity" @click="closeModal"></div>

        <div class="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-2xl w-full max-w-md overflow-hidden transform transition-all z-10">
          <div class="p-6 border-b border-outline-variant flex justify-between items-center bg-surface">
            <h3 class="font-headline-sm text-headline-sm text-on-surface">
              {{ isEditMode ? 'Editar Insumo' : 'Agregar Nuevo Insumo' }}
            </h3>
            <button @click="closeModal" class="text-on-surface-variant hover:text-on-surface flex items-center justify-center">
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <div class="p-6 space-y-4 bg-surface-container-lowest">
            <div>
              <label class="block font-label-md text-label-md text-on-surface mb-1" for="supply-name">Nombre del Insumo</label>
              <input
                id="supply-name"
                type="text"
                v-model="supplyName"
                :disabled="isSaving"
                class="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-body-md text-body-md text-on-surface transition-colors outline-none"
                placeholder="Ej: Ron Blanco"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-label-md text-label-md text-on-surface mb-1" for="supply-quantity">Cantidad</label>
                <input
                  id="supply-quantity"
                  type="number"
                  min="0"
                  step="0.01"
                  v-model.number="quantity"
                  :disabled="isSaving"
                  class="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-body-md text-body-md text-on-surface transition-colors outline-none"
                />
              </div>
              <div>
                <label class="block font-label-md text-label-md text-on-surface mb-1" for="supply-unit">Unidad</label>
                <select
                  id="supply-unit"
                  v-model="unit"
                  :disabled="isSaving"
                  class="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-body-md text-body-md text-on-surface transition-colors outline-none"
                >
                  <option v-for="u in unitOptions" :key="u" :value="u">{{ u }}</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block font-label-md text-label-md text-on-surface mb-1" for="supply-supplier">Proveedor</label>
              <input
                id="supply-supplier"
                type="text"
                v-model="supplier"
                :disabled="isSaving"
                class="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-body-md text-body-md text-on-surface transition-colors outline-none"
                placeholder="Ej: Distribuidora Havana"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-label-md text-label-md text-on-surface mb-1" for="supply-price">Precio Unit. (S/)</label>
                <input
                  id="supply-price"
                  type="number"
                  min="0"
                  step="0.01"
                  v-model.number="price"
                  :disabled="isSaving"
                  class="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-body-md text-body-md text-on-surface transition-colors outline-none"
                />
              </div>
              <div>
                <label class="block font-label-md text-label-md text-on-surface mb-1" for="supply-date">Fecha de Ingreso</label>
                <input
                  id="supply-date"
                  type="date"
                  v-model="date"
                  :disabled="isSaving"
                  class="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-body-md text-body-md text-on-surface transition-colors outline-none"
                />
              </div>
            </div>

            <div>
              <label class="block font-label-md text-label-md text-on-surface mb-1" for="supply-expiration">
                Fecha de Vencimiento
                <span class="text-[10px] text-on-surface-variant font-normal">(opcional)</span>
              </label>
              <input
                id="supply-expiration"
                type="date"
                v-model="expirationDate"
                :disabled="isSaving"
                class="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-body-md text-body-md text-on-surface transition-colors outline-none"
              />
              <p class="text-[10px] text-on-surface-variant mt-1">
                Se alertará cuando falten ≤ {{ expiringWindowDays }} días
              </p>
            </div>
          </div>

          <div class="bg-surface p-6 border-t border-outline-variant flex justify-end gap-3">
            <button
              type="button"
              @click="closeModal"
              :disabled="isSaving"
              class="px-4 py-2 border border-outline-variant rounded-lg bg-surface text-on-surface hover:bg-surface-container font-label-md text-label-md transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              @click="saveSupply"
              :disabled="isSaving"
              class="px-4 py-2 bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <span v-if="isSaving" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
              {{ isSaving ? 'Guardando...' : (isEditMode ? 'Actualizar' : 'Crear') }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Modal de Movimiento (Entrada / Salida) -->
    <transition name="fade">
      <div v-if="isMovementModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-inverse-surface/60 backdrop-blur-sm transition-opacity" @click="isMovementModalOpen = false"></div>

        <div class="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-2xl w-full max-w-md overflow-hidden transform transition-all z-10">
          <div class="p-6 border-b border-outline-variant flex justify-between items-center bg-surface">
            <h3 class="font-headline-sm text-headline-sm text-on-surface">
              Registrar Movimiento: {{ selectedSupplyForMovement?.supplyName }}
            </h3>
            <button @click="isMovementModalOpen = false" class="text-on-surface-variant hover:text-on-surface flex items-center justify-center">
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <div class="p-6 space-y-4 bg-surface-container-lowest">
            <div>
              <label class="block font-label-md text-label-md text-on-surface mb-1">Tipo de Movimiento</label>
              <div class="flex gap-4">
                <label class="flex items-center gap-2 cursor-pointer font-body-md text-body-md text-on-surface">
                  <input type="radio" value="ENTRY" v-model="movementType" class="text-primary focus:ring-primary h-4 w-4" />
                  <span>Entrada (+)</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer font-body-md text-body-md text-on-surface">
                  <input type="radio" value="EXIT" v-model="movementType" class="text-primary focus:ring-primary h-4 w-4" />
                  <span>Salida (-)</span>
                </label>
              </div>
            </div>

            <div>
              <label class="block font-label-md text-label-md text-on-surface mb-1" for="movement-quantity">Cantidad</label>
              <input
                id="movement-quantity"
                type="number"
                min="1"
                step="1"
                v-model.number="movementQuantity"
                :disabled="isSavingMovement"
                class="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-body-md text-body-md text-on-surface transition-colors outline-none"
              />
            </div>

            <div>
              <label class="block font-label-md text-label-md text-on-surface mb-1" for="movement-reason">Motivo / Razón</label>
              <input
                id="movement-reason"
                type="text"
                v-model="movementReason"
                placeholder="Ej: Lote de compra #43, Consumo"
                :disabled="isSavingMovement"
                class="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-body-md text-body-md text-on-surface transition-colors outline-none"
              />
            </div>

            <div>
              <label class="block font-label-md text-label-md text-on-surface mb-1" for="movement-date">Fecha de Movimiento</label>
              <input
                id="movement-date"
                type="date"
                v-model="movementDate"
                :disabled="isSavingMovement"
                class="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-body-md text-body-md text-on-surface transition-colors outline-none"
              />
            </div>
          </div>

          <div class="bg-surface p-6 border-t border-outline-variant flex justify-end gap-3">
            <button
              type="button"
              @click="isMovementModalOpen = false"
              :disabled="isSavingMovement"
              class="px-4 py-2 border border-outline-variant rounded-lg bg-surface text-on-surface hover:bg-surface-container font-label-md text-label-md transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              @click="saveMovement"
              :disabled="isSavingMovement"
              class="px-4 py-2 bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <span v-if="isSavingMovement" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
              Registrar
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Modal de Historial de Movimientos -->
    <transition name="fade">
      <div v-if="isHistoryModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-inverse-surface/60 backdrop-blur-sm transition-opacity" @click="isHistoryModalOpen = false"></div>

        <div class="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all z-10">
          <div class="p-6 border-b border-outline-variant flex justify-between items-center bg-surface">
            <h3 class="font-headline-sm text-headline-sm text-on-surface">
              Historial de Movimientos: {{ selectedSupplyForHistory?.supplyName }}
            </h3>
            <button @click="isHistoryModalOpen = false" class="text-on-surface-variant hover:text-on-surface flex items-center justify-center">
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <div class="p-6 bg-surface-container-lowest max-h-[60vh] overflow-y-auto">
            <div v-if="isHistoryLoading" class="p-8 flex flex-col items-center justify-center gap-3">
              <div class="animate-spin rounded-full h-8 w-8 border-4 border-rose-800 border-t-transparent"></div>
              <p class="font-label-md text-on-surface-variant">Cargando movimientos...</p>
            </div>
            
            <div v-else-if="filteredMovements.length === 0" class="p-8 text-center text-on-surface-variant font-body-md opacity-60">
              No hay movimientos registrados para este insumo.
            </div>

            <table v-else class="w-full text-left border-collapse text-left">
              <thead>
                <tr class="border-b border-outline-variant bg-surface-container-low/50">
                  <th class="py-2.5 px-4 font-label-sm text-label-sm text-on-surface-variant uppercase">Fecha</th>
                  <th class="py-2.5 px-4 font-label-sm text-label-sm text-on-surface-variant uppercase">Tipo</th>
                  <th class="py-2.5 px-4 font-label-sm text-label-sm text-on-surface-variant uppercase">Cantidad</th>
                  <th class="py-2.5 px-4 font-label-sm text-label-sm text-on-surface-variant uppercase">Motivo</th>
                </tr>
              </thead>
              <tbody class="font-body-sm text-body-sm text-on-surface divide-y divide-outline-variant/30">
                <tr v-for="m in filteredMovements" :key="m.id" class="hover:bg-surface-container-low transition-colors duration-150">
                  <td class="py-3 px-4 text-on-surface-variant">{{ formatDate(m.date) }}</td>
                  <td class="py-3 px-4">
                    <span
                      class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold"
                      :class="m.type === 'ENTRY' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'"
                    >
                      {{ m.type === 'ENTRY' ? 'Entrada' : 'Salida' }}
                    </span>
                  </td>
                  <td class="py-3 px-4 font-mono font-bold" :class="m.type === 'ENTRY' ? 'text-emerald-700' : 'text-rose-700'">
                    {{ m.type === 'ENTRY' ? '+' : '-' }}{{ m.quantity }}
                  </td>
                  <td class="py-3 px-4 text-on-surface-variant">{{ m.reason || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="bg-surface p-4 border-t border-outline-variant flex justify-end">
            <button
              type="button"
              @click="isHistoryModalOpen = false"
              class="px-4 py-2 bg-surface border border-outline-variant rounded-lg text-on-surface hover:bg-surface-container font-label-md text-label-md transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Device Limit Modal (local trigger from this view) -->
    <DeviceLimitModal
      :show="showDeviceLimitModal"
      @close="showDeviceLimitModal = false"
    />
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
