// store/alerts.js
// Store Pinia para el estado global de alertas críticas de sensores IoT.
// Centraliza el criticalCount para que el DashboardLayout y TelemetryAlertsView
// compartan el mismo estado sin re-fetch duplicado.
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAlertsStore = defineStore('alerts', () => {
  /** @type {import('vue').Ref<Array>} Lista completa de alertas (actualizada por TelemetryAlertsView) */
  const alerts = ref([])

  /** @type {import('vue').Ref<boolean>} true si el InventoryService no responde */
  const serviceOffline = ref(false)

  /** Número de alertas CRITICAL no reconocidas */
  const criticalCount = computed(
    () => alerts.value.filter((a) => a.status === 'CRITICAL' && !a.acknowledged).length
  )

  /** Número total de alertas con isAnomaly=true */
  const anomalyCount = computed(() => alerts.value.filter((a) => a.isAnomaly).length)

  /** Estado general del sistema basado en alertas */
  const systemStatus = computed(() => {
    if (criticalCount.value > 0) return 'Crítico'
    if (alerts.value.some((a) => a.status === 'WARNING' && !a.acknowledged)) return 'Advertencia'
    return 'Estable'
  })

  /**
   * Actualizar la lista de alertas desde el composable useSensorAlerts.
   * @param {Array} newAlerts - Array de alertas del API
   */
  const setAlerts = (newAlerts) => {
    alerts.value = newAlerts
  }

  /**
   * Marcar una alerta como reconocida localmente (optimistic update).
   * @param {number} id
   */
  const markAcknowledged = (id) => {
    const alert = alerts.value.find((a) => a.id === id)
    if (alert) alert.acknowledged = true
  }

  const setServiceOffline = (status) => {
    serviceOffline.value = status
  }

  return {
    alerts,
    serviceOffline,
    criticalCount,
    anomalyCount,
    systemStatus,
    setAlerts,
    markAcknowledged,
    setServiceOffline
  }
})
