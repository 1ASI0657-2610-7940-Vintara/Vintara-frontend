import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useIotStore = defineStore('iot', () => {
  const alerts = ref([])
  const serviceOffline = ref(false)

  const criticalCount = computed(
    () => alerts.value.filter((a) => a.status === 'CRITICAL' && !a.acknowledged).length
  )

  const anomalyCount = computed(() => alerts.value.filter((a) => a.isAnomaly).length)

  const systemStatus = computed(() => {
    if (criticalCount.value > 0) return 'Crítico'
    if (alerts.value.some((a) => a.status === 'WARNING' && !a.acknowledged)) return 'Advertencia'
    return 'Estable'
  })

  const setAlerts = (newAlerts) => {
    alerts.value = newAlerts
  }

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
