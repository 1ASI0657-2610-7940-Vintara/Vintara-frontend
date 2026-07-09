import { defineStore } from 'pinia'
import { ref } from 'vue'
import { InventoryApi } from '../infrastructure/inventory-api'
import { SupplyAssembler } from '../infrastructure/supply.assembler'

export const useInventoryStore = defineStore('inventory', () => {
  const supplies = ref([])
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

  return {
    supplies,
    isLoading,
    fetchSupplies,
    createSupply,
    updateSupply,
    deleteSupply
  }
})
