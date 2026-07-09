import apiClient from '@/shared/infrastructure/api-client'

const authPath = () => import.meta.env.VITE_AUTH_ENDPOINT_PATH || '/auth'

export const ProfilesApi = {
  fetchMe: () => apiClient.get(`${authPath()}/me`),
  updateProfile: (payload) => apiClient.put(`${authPath()}/me`, payload),
  changePassword: (payload) => apiClient.post(`${authPath()}/change-password`, payload)
}
