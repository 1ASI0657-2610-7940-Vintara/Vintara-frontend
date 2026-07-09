import { defineStore } from 'pinia'
import { ref } from 'vue'
import { InventoryApi } from '../infrastructure/inventory-api'
import { SupplyAssembler } from '../infrastructure/supply.assembler'
import { StockMovementAssembler } from '../infrastructure/stock-movement.assembler'

export const useInventoryStore = defineStore('inventory', () => {
  const supplies = ref([])
  const movements = ref([])
  const isLoading = ref(false)

  const fetchSupplies = async () => {
    isLoading.value = true
    try {
      const response = await InventoryApi.getSupplies()
      supplies.value = SupplyAssembler.toEntitiesFromResponse(response)
      return supplies.value
    } catch (error) {
      console.error('[InventoryStore] Error fetching supplies:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const createSupply = async (payload) => {
    try {
      const response = await InventoryApi.createSupply(payload)
      const entity = SupplyAssembler.toEntityFromResource(response.data)
      if (entity) {
        supplies.value.push(entity)
      }
      return entity
    } catch (error) {
      console.error('[InventoryStore] Error creating supply:', error)
      throw error
    }
  }

  const updateSupply = async (id, payload) => {
    try {
      const response = await InventoryApi.updateSupply(id, payload)
      const entity = SupplyAssembler.toEntityFromResource(response.data || payload)
      const index = supplies.value.findIndex((s) => s.id === id)
      if (index !== -1 && entity) {
        supplies.value[index] = entity
      }
      return entity
    } catch (error) {
      console.error('[InventoryStore] Error updating supply:', error)
      throw error
    }
  }

  const deleteSupply = async (id) => {
    try {
      await InventoryApi.deleteSupply(id)
      supplies.value = supplies.value.filter((s) => s.id !== id)
    } catch (error) {
      console.error('[InventoryStore] Error deleting supply:', error)
      throw error
    }
  }

  const fetchStockMovements = async () => {
    isLoading.value = true
    try {
      const response = await InventoryApi.getStockMovements()
      movements.value = StockMovementAssembler.toEntitiesFromResponse(response)
      return movements.value
    } catch (error) {
      console.error('[InventoryStore] Error fetching movements:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const createStockMovement = async (payload) => {
    try {
      const response = await InventoryApi.createStockMovement(payload)
      const entity = StockMovementAssembler.toEntityFromResource(response.data)
      if (entity) {
        movements.value.unshift(entity)
        // Actualizar localmente el stock de la supply
        const supply = supplies.value.find((s) => s.id === entity.supplyId)
        if (supply) {
          if (entity.type === 'ENTRY') {
            supply.quantity += entity.quantity
          } else if (entity.type === 'EXIT') {
            supply.quantity -= entity.quantity
          }
        }
      }
      return entity
    } catch (error) {
      console.error('[InventoryStore] Error creating stock movement:', error)
      throw error
    }
  }

  return {
    supplies,
    movements,
    isLoading,
    fetchSupplies,
    createSupply,
    updateSupply,
    deleteSupply,
    fetchStockMovements,
    createStockMovement
  }
})
