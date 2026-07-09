import apiClient from '@/shared/infrastructure/api-client'

const SUPPLIES_PATH = import.meta.env.VITE_SUPPLIES_ENDPOINT_PATH || '/inventory/supplies'

export const InventoryApi = {
  getSupplies: () => apiClient.get(SUPPLIES_PATH),
  createSupply: (payload) => apiClient.post(SUPPLIES_PATH, payload),
  updateSupply: (id, payload) => apiClient.put(`${SUPPLIES_PATH}/${id}`, payload),
  deleteSupply: (id) => apiClient.delete(`${SUPPLIES_PATH}/${id}`)
}
