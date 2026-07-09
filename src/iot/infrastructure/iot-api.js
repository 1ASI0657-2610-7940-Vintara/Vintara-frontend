import apiClient from '@/shared/infrastructure/api-client'

const ALERTS_PATH = import.meta.env.VITE_SENSOR_ALERTS_ENDPOINT_PATH || '/inventory/sensor-alerts'

export const IotApi = {
  getAlerts: (params) => apiClient.get(ALERTS_PATH, { params }),
  acknowledgeAlert: (id) => apiClient.patch(`${ALERTS_PATH}/${id}/acknowledge`)
}
