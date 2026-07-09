import { ref, onMounted, onUnmounted } from 'vue'
import { IotApi } from '../../infrastructure/iot-api'
import { AlertAssembler } from '../../infrastructure/alert.assembler'

// Backoff exponencial: 500ms → 1s → 2s → 4s ... máx 30s
const getBackoffDelay = (attempt) => Math.min(500 * Math.pow(2, attempt), 30000)

export function useSensorAlerts(pollIntervalMs = 5000) {
  const alerts = ref([])
  const criticalCount = ref(0)
  const isLoading = ref(true)
  const serviceOffline = ref(false)
  const errorCount = ref(0)

  let timer = null
  const notifiedIds = new Set()

  const fetchAlerts = async (onNewCritical = null) => {
    try {
      const response = await IotApi.getAlerts({ page: 1, size: 50 })
      alerts.value = AlertAssembler.toEntitiesFromResponse(response)
      criticalCount.value = alerts.value.filter(
        (a) => a.status === 'CRITICAL' && !a.acknowledged
      ).length

      if (onNewCritical) {
        alerts.value.forEach((alert) => {
          if (alert.status === 'CRITICAL' && !alert.acknowledged && !notifiedIds.has(alert.id)) {
            notifiedIds.add(alert.id)
            onNewCritical(alert)
          }
        })
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

      if (timer) {
        clearInterval(timer)
        const delay = getBackoffDelay(errorCount.value)
        timer = setTimeout(() => {
          fetchAlerts(onNewCritical)
          timer = setInterval(() => fetchAlerts(onNewCritical), pollIntervalMs)
        }, delay)
      }
    }
  }

  const acknowledgeAlert = async (id) => {
    try {
      await IotApi.acknowledgeAlert(id)
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
