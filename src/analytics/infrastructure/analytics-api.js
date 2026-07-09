import apiClient from '@/shared/infrastructure/api-client'

const REPORTS_PATH = import.meta.env.VITE_REPORTS_ENDPOINT_PATH || '/analytics/reports'

export const AnalyticsApi = {
  exportReport: (payload) => apiClient.post(REPORTS_PATH, payload, { responseType: 'blob' })
}
