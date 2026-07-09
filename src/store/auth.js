import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiClient from '../plugins/axios'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null)

  let initialUser = null
  try {
    const storedUser = localStorage.getItem('user')
    if (storedUser) initialUser = JSON.parse(storedUser)
  } catch (e) {
    localStorage.removeItem('user')
  }
  const user = ref(initialUser)

  const authPath = () => import.meta.env.VITE_AUTH_ENDPOINT_PATH || '/auth'

  const persistUser = (u) => {
    user.value = u
    localStorage.setItem('user', JSON.stringify(u))
  }

  /**
   * Login real contra AuthService vía Gateway
   */
  const login = async (credentials) => {
    try {
      const { data } = await apiClient.post(`${authPath()}/login`, {
        username: credentials.username,
        password: credentials.password
      })

      if (!data?.token) throw new Error('El backend no devolvió un token válido')

      const userData = {
        username: data.username,
        email: data.email,
        role: null,
        name: data.username
      }

      token.value = data.token
      localStorage.setItem('token', data.token)
      persistUser(userData)
      return true
    } catch (error) {
      console.error('Login failed:', error.response?.data || error.message)
      return false
    }
  }

  /**
   * GET /auth/me — traer datos completos del usuario logueado
   */
  const fetchMe = async () => {
    try {
      const { data } = await apiClient.get(`${authPath()}/me`)
      const merged = {
        ...user.value,
        id: data.id,
        username: data.username,
        email: data.email,
        fullName: data.fullName,
        phone: data.phone,
        name: data.fullName || data.username
      }
      persistUser(merged)
      return merged
    } catch (error) {
      console.error('fetchMe failed:', error.response?.data || error.message)
      throw error
    }
  }

  /**
   * PUT /auth/me — actualizar nombre, teléfono, email
   */
  const updateProfile = async ({ fullName, phone, email }) => {
    try {
      const { data } = await apiClient.put(`${authPath()}/me`, {
        fullName,
        phone,
        email
      })
      const merged = {
        ...user.value,
        id: data.id,
        username: data.username,
        email: data.email,
        fullName: data.fullName,
        phone: data.phone,
        name: data.fullName || data.username
      }
      persistUser(merged)
      return { success: true, user: merged }
    } catch (error) {
      console.error('updateProfile failed:', error.response?.data || error.message)
      return {
        success: false,
        message: error.response?.data?.message || 'No se pudo actualizar el perfil.'
      }
    }
  }

  /**
   * POST /auth/change-password — cambiar contraseña
   */
  const changePassword = async ({ currentPassword, newPassword }) => {
    try {
      const { data } = await apiClient.post(`${authPath()}/change-password`, {
        currentPassword,
        newPassword
      })
      return { success: true, message: data?.message || 'Contraseña actualizada.' }
    } catch (error) {
      console.error('changePassword failed:', error.response?.data || error.message)
      const status = error.response?.status
      let message = error.response?.data?.message || 'No se pudo cambiar la contraseña.'
      if (status === 401) message = 'La contraseña actual es incorrecta.'
      return { success: false, message }
    }
  }

  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const isAuthenticated = () => !!token.value

  return {
    token,
    user,
    login,
    fetchMe,
    updateProfile,
    changePassword,
    logout,
    isAuthenticated
  }
})