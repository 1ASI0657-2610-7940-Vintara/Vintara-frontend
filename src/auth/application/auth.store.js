import { defineStore } from 'pinia'
import { ref } from 'vue'
import { AuthApi } from '../infrastructure/auth-api'

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

  const persistUser = (u) => {
    user.value = u
    localStorage.setItem('user', JSON.stringify(u))
  }

  const login = async (credentials) => {
    try {
      const response = await AuthApi.login(credentials.username, credentials.password)
      const data = response.data

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

  const register = async ({ username, email, password }) => {
    try {
      await AuthApi.register(username, email, password)
      return { success: true }
    } catch (error) {
      console.error('Registration failed:', error.response?.data || error.message)
      return {
        success: false,
        message: error.response?.data?.message || 'No se pudo registrar la cuenta.'
      }
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
    register,
    logout,
    isAuthenticated,
    persistUser
  }
})
