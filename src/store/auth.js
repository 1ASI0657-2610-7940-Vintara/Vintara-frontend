import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null)
  
  // Safe parsing of localStorage
  let initialUser = null
  try {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      initialUser = JSON.parse(storedUser)
    }
  } catch (error) {
    console.error('Failed to parse user from localStorage:', error)
    localStorage.removeItem('user')
  }
  const user = ref(initialUser)

  const login = async (credentials) => {
    // Simulating API call using environment variables
    const adminEmail = import.meta.env.VITE_DEFAULT_ADMIN_EMAIL || 'admin@winesoft.com'
    const adminPassword = import.meta.env.VITE_DEFAULT_ADMIN_PASSWORD || '123456'

    const isDefaultAdmin = credentials.email === adminEmail && credentials.password === adminPassword
    const isUserCredentials = credentials.email === 'joan.teves@huawei.com' && credentials.password === 'loco123@'

    if (isDefaultAdmin || isUserCredentials) {
      const fakeToken = 'ey.fake.jwt.token'
      const fakeUser = { 
        name: isUserCredentials ? 'Joan Teves' : 'Admin', 
        email: credentials.email, 
        role: isUserCredentials ? 'manager' : 'admin' 
      }
      
      token.value = fakeToken
      user.value = fakeUser
      
      localStorage.setItem('token', fakeToken)
      localStorage.setItem('user', JSON.stringify(fakeUser))
      return true
    }
    return false
  }

  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const isAuthenticated = () => {
    return !!token.value
  }

  return { token, user, login, logout, isAuthenticated }
})
