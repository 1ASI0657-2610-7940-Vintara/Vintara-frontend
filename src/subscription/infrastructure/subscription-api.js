/**
 * subscription-api.js
 * Mock de API de suscripción. Cuando el backend implemente el endpoint real,
 * solo hay que reemplazar las funciones aquí sin tocar el store ni las vistas.
 */

import { PLANS } from '../application/subscription.store'

// Simula latencia de red
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

export const SubscriptionApi = {
  /**
   * Obtiene el plan actual del usuario autenticado.
   * @returns {Promise<{planId: string, deviceCount: number}>}
   */
  getCurrentPlan: async () => {
    await delay(200)
    const planId = localStorage.getItem('winesoft_plan') || 'FREE'
    const deviceCount = Number(localStorage.getItem('winesoft_device_count') || 0)
    return { data: { planId, deviceCount } }
  },

  /**
   * Retorna todos los planes disponibles.
   * @returns {Promise<Array>}
   */
  getPlans: async () => {
    await delay(100)
    return { data: Object.values(PLANS) }
  },

  /**
   * Simula el upgrade de plan.
   * En producción: POST /api/v1/subscriptions/upgrade
   * @param {string} planId - ID del plan destino ('PRO' | 'ENTERPRISE')
   * @returns {Promise<{success: boolean, planId: string}>}
   */
  upgradePlan: async (planId) => {
    await delay(600)
    if (!PLANS[planId]) throw new Error(`Plan inválido: ${planId}`)
    // TODO: Reemplazar con llamada real:
    // return apiClient.post('/api/v1/subscriptions/upgrade', { planId })
    return { data: { success: true, planId } }
  },
}
