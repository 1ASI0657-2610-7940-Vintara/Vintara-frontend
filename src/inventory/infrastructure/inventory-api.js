import apiClient from '@/shared/infrastructure/api-client'

const SUPPLIES_PATH = import.meta.env.VITE_SUPPLIES_ENDPOINT_PATH || '/inventory/supplies'

const STOCK_MOVEMENTS_PATH = '/inventory/stock-movements'

export const InventoryApi = {
  getSupplies: () => apiClient.get(SUPPLIES_PATH),
  createSupply: (payload) => apiClient.post(SUPPLIES_PATH, payload),
  updateSupply: (id, payload) => apiClient.put(`${SUPPLIES_PATH}/${id}`, payload),
  deleteSupply: (id) => apiClient.delete(`${SUPPLIES_PATH}/${id}`),
  getStockMovements: () => apiClient.get(STOCK_MOVEMENTS_PATH),
  createStockMovement: (payload) => apiClient.post(STOCK_MOVEMENTS_PATH, payload)
}
