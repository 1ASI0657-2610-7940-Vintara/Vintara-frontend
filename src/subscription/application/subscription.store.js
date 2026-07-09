import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const PLANS = {
  FREE: {
    id: 'FREE',
    name: 'Free',
    price: 0,
    priceLabel: 'Gratis',
    deviceLimit: 3,
    alertTypes: ['NORMAL', 'WARNING'],
    users: 1,
    features: [
      'Hasta 3 dispositivos IoT',
      'Alertas normales y advertencias',
      'Reportes básicos',
      '1 usuario',
      'Soporte por correo',
    ],
    notIncluded: [
      'Alertas críticas',
      'Exportación de reportes',
      'Acceso API',
      'Webhooks',
    ],
  },
  PRO: {
    id: 'PRO',
    name: 'Pro',
    price: 29,
    priceLabel: '$29/mes',
    deviceLimit: 15,
    alertTypes: ['NORMAL', 'WARNING', 'CRITICAL'],
    users: 5,
    features: [
      'Hasta 15 dispositivos IoT',
      'Todas las alertas (CRITICAL incluidas)',
      'Reportes completos + exportación PDF',
      'Hasta 5 usuarios',
      'Soporte prioritario',
    ],
    notIncluded: [
      'Acceso API',
      'Webhooks personalizados',
    ],
  },
  ENTERPRISE: {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    price: 99,
    priceLabel: '$99/mes',
    deviceLimit: Infinity,
    alertTypes: ['NORMAL', 'WARNING', 'CRITICAL'],
    users: Infinity,
    features: [
      'Dispositivos IoT ilimitados',
      'Todas las alertas + webhooks',
      'Reportes custom + acceso API',
      'Usuarios ilimitados',
      'Soporte dedicado 24/7',
    ],
    notIncluded: [],
  },
}

export const useSubscriptionStore = defineStore('subscription', () => {
  // ── Estado ──────────────────────────────────────────────────────────────
  const _stored = localStorage.getItem('winesoft_plan')
  const currentPlanId = ref(_stored && PLANS[_stored] ? _stored : 'FREE')

  // En un sistema real, este contador vendría del backend (número de devices registrados)
  const deviceCount = ref(Number(localStorage.getItem('winesoft_device_count') || 0))

  // ── Getters ──────────────────────────────────────────────────────────────
  const currentPlan = computed(() => PLANS[currentPlanId.value])

  const deviceLimit = computed(() => currentPlan.value.deviceLimit)

  const remainingDevices = computed(() => {
    if (deviceLimit.value === Infinity) return Infinity
    return Math.max(0, deviceLimit.value - deviceCount.value)
  })

  const isOverDeviceLimit = computed(() => {
    if (deviceLimit.value === Infinity) return false
    return deviceCount.value >= deviceLimit.value
  })

  const usagePercent = computed(() => {
    if (deviceLimit.value === Infinity) return 0
    return Math.min(100, Math.round((deviceCount.value / deviceLimit.value) * 100))
  })

  const planBadgeColor = computed(() => {
    switch (currentPlanId.value) {
      case 'FREE': return 'bg-surface-container text-on-surface-variant border-outline-variant'
      case 'PRO': return 'bg-amber-100 text-amber-800 border-amber-300'
      case 'ENTERPRISE': return 'bg-purple-100 text-purple-800 border-purple-300'
      default: return 'bg-surface-container text-on-surface-variant'
    }
  })

  // ── Acciones ──────────────────────────────────────────────────────────────
  const upgradePlan = (planId) => {
    if (!PLANS[planId]) return false
    currentPlanId.value = planId
    localStorage.setItem('winesoft_plan', planId)
    return true
  }

  const incrementDeviceCount = () => {
    deviceCount.value++
    localStorage.setItem('winesoft_device_count', String(deviceCount.value))
  }

  const decrementDeviceCount = () => {
    deviceCount.value = Math.max(0, deviceCount.value - 1)
    localStorage.setItem('winesoft_device_count', String(deviceCount.value))
  }

  const setDeviceCount = (n) => {
    deviceCount.value = n
    localStorage.setItem('winesoft_device_count', String(n))
  }

  return {
    currentPlanId,
    deviceCount,
    currentPlan,
    deviceLimit,
    remainingDevices,
    isOverDeviceLimit,
    usagePercent,
    planBadgeColor,
    upgradePlan,
    incrementDeviceCount,
    decrementDeviceCount,
    setDeviceCount,
    PLANS,
  }
})
