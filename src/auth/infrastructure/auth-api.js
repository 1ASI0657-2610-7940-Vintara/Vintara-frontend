import apiClient from '@/shared/infrastructure/api-client'

const authPath = () => import.meta.env.VITE_AUTH_ENDPOINT_PATH || '/auth'

export const AuthApi = {
  login: (username, password) => apiClient.post(`${authPath()}/login`, { username, password }),
  register: (username, email, password) => apiClient.post(`${authPath()}/register`, { username, email, password })
}
