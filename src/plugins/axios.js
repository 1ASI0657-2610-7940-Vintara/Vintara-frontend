import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://api.winesoft.local',
  headers: {
    'Content-Type': 'application/json'
  }
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Configure global Axios to handle local mock requests gracefully, especially mock POSTs
axios.interceptors.request.use((config) => {
  if (config.url && config.url.includes('/mocks/') && config.method !== 'get') {
    config.adapter = async (cfg) => {
      // Simulate network latency (1.5 seconds)
      await new Promise((resolve) => setTimeout(resolve, 1500))
      return {
        data: { success: true, message: 'Operación simulada con éxito' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: cfg
      }
    }
  }
  return config
})

export default apiClient

