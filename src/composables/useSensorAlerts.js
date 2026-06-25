// composables/useSensorAlerts.js
// Composable para consumir el endpoint de alertas de sensores IoT del InventoryService.
// Implementa polling HTTP cada 5s con manejo de errores y backoff exponencial.
import { ref, onMounted, onUnmounted } from 'vue'
import axios from 'axios'

const INVENTORY_BASE = import.meta.env.VITE_INVENTORY_API_URL
const ALERTS_PATH = import.meta.env.VITE_SENSOR_ALERTS_ENDPOINT_PATH || '/sensor-alerts'

// Backoff exponencial: 500ms → 1s → 2s → 4s ... máx 30s
const getBackoffDelay = (attempt) => Math.min(500 * Math.pow(2, attempt), 30000)

export function useSensorAlerts(pollIntervalMs = 5000) {
  const alerts = ref([])
  const criticalCount = ref(0)
  const isLoading = ref(true)
  const serviceOffline = ref(false)
  const errorCount = ref(0)

  let timer = null
  // Guardamos los IDs de alertas críticas ya notificadas para no duplicar toasts
  const notifiedIds = new Set()

  /**
   * Llama a GET /api/v1/sensor-alerts y actualiza el estado reactivo.
   * @param {Function} onNewCritical - Callback opcional que recibe la alerta nueva crítica
   */
  const fetchAlerts = async (onNewCritical = null) => {
    try {
      const { data } = await axios.get(`${INVENTORY_BASE}${ALERTS_PATH}`, {
        params: { size: 50, page: 1 }
      })

      alerts.value = data.items ?? []
      criticalCount.value = alerts.value.filter(
        (a) => a.status === 'CRITICAL' && !a.acknowledged
      ).length

      // Detectar nuevas alertas críticas no notificadas
      if (onNewCritical) {
        alerts.value.forEach((alert) => {
          if (alert.status === 'CRITICAL' && !alert.acknowledged && !notifiedIds.has(alert.id)) {
            notifiedIds.add(alert.id)
            onNewCritical(alert)
          }
        })
        // Limpiar IDs de alertas ya reconocidas del set para no acumular
        alerts.value
          .filter((a) => a.acknowledged)
          .forEach((a) => notifiedIds.delete(a.id))
      }

      serviceOffline.value = false
      errorCount.value = 0
      isLoading.value = false
    } catch (error) {
      console.error('[useSensorAlerts] Error fetching alerts:', error)
      errorCount.value++
      serviceOffline.value = true
      isLoading.value = false

      // Backoff exponencial: reprogramar el siguiente intento con delay mayor
      if (timer) {
        clearInterval(timer)
        const delay = getBackoffDelay(errorCount.value)
        timer = setTimeout(() => {
          fetchAlerts(onNewCritical)
          // Reanudar polling normal después del reintento
          timer = setInterval(() => fetchAlerts(onNewCritical), pollIntervalMs)
        }, delay)
      }
    }
  }

  /**
   * Marca una alerta como reconocida/resuelta.
   * @param {number} id - ID de la alerta
   */
  const acknowledgeAlert = async (id) => {
    try {
      await axios.patch(`${INVENTORY_BASE}${ALERTS_PATH}/${id}/acknowledge`)
      // Actualizar localmente para respuesta inmediata en UI
      const alert = alerts.value.find((a) => a.id === id)
      if (alert) {
        alert.acknowledged = true
        criticalCount.value = alerts.value.filter(
          (a) => a.status === 'CRITICAL' && !a.acknowledged
        ).length
      }
    } catch (error) {
      console.error('[useSensorAlerts] Error acknowledging alert:', error)
      throw error
    }
  }

  const startPolling = (onNewCritical = null) => {
    fetchAlerts(onNewCritical)
    timer = setInterval(() => fetchAlerts(onNewCritical), pollIntervalMs)
  }

  const stopPolling = () => {
    if (timer) {
      clearInterval(timer)
      clearTimeout(timer)
      timer = null
    }
  }

  onMounted(() => startPolling())
  onUnmounted(() => stopPolling())

  return {
    alerts,
    criticalCount,
    isLoading,
    serviceOffline,
    fetchAlerts,
    acknowledgeAlert,
    startPolling,
    stopPolling
  }
}
