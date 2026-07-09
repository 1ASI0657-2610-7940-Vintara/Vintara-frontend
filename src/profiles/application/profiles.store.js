import { defineStore } from 'pinia'
import { useAuthStore } from '@/auth/application/auth.store'
import { ProfilesApi } from '../infrastructure/profiles-api'

export const useProfilesStore = defineStore('profiles', () => {
  const authStore = useAuthStore()

  const fetchMe = async () => {
    try {
      const response = await ProfilesApi.fetchMe()
      const data = response.data
      const merged = {
        ...authStore.user,
        id: data.id,
        username: data.username,
        email: data.email,
        fullName: data.fullName,
        phone: data.phone,
        name: data.fullName || data.username
      }
      authStore.persistUser(merged)
      return merged
    } catch (error) {
      console.error('fetchMe failed:', error.response?.data || error.message)
      throw error
    }
  }

  const updateProfile = async ({ fullName, phone, email }) => {
    try {
      const response = await ProfilesApi.updateProfile({ fullName, phone, email })
      const data = response.data
      const merged = {
        ...authStore.user,
        id: data.id,
        username: data.username,
        email: data.email,
        fullName: data.fullName,
        phone: data.phone,
        name: data.fullName || data.username
      }
      authStore.persistUser(merged)
      return { success: true, user: merged }
    } catch (error) {
      console.error('updateProfile failed:', error.response?.data || error.message)
      return {
        success: false,
        message: error.response?.data?.message || 'No se pudo actualizar el perfil.'
      }
    }
  }

  const changePassword = async ({ currentPassword, newPassword }) => {
    try {
      const response = await ProfilesApi.changePassword({ currentPassword, newPassword })
      const data = response.data
      return { success: true, message: data?.message || 'Contraseña actualizada.' }
    } catch (error) {
      console.error('changePassword failed:', error.response?.data || error.message)
      const status = error.response?.status
      let message = error.response?.data?.message || 'No se pudo cambiar la contraseña.'
      if (status === 401) message = 'La contraseña actual es incorrecta.'
      return { success: false, message }
    }
  }

  return {
    fetchMe,
    updateProfile,
    changePassword
  }
})
