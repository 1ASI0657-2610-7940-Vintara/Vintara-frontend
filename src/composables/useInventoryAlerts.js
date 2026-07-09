// composables/useInventoryAlerts.js
// Lógica de alertas de inventario: stock bajo + vencimientos.
// Todo el estado se persiste en localStorage porque el backend
// no soporta estos campos aún.
import { ref, computed } from 'vue'

// Claves de localStorage
const LS_THRESHOLD = 'inv_low_stock_threshold'
const LS_EXPIRATIONS = 'inv_supply_expirations' // { [supplyId]: 'YYYY-MM-DD' }
const LS_EXPIRING_DAYS = 'inv_expiring_days'    // días de anticipación

const DEFAULT_THRESHOLD = 10
const DEFAULT_EXPIRING_DAYS = 15

// ---- Umbral de stock bajo (global) ----
const lowStockThreshold = ref(
  Number(localStorage.getItem(LS_THRESHOLD)) || DEFAULT_THRESHOLD
)

const setLowStockThreshold = (value) => {
  const num = Math.max(0, Number(value) || 0)
  lowStockThreshold.value = num
  localStorage.setItem(LS_THRESHOLD, String(num))
}

// ---- Días de anticipación de vencimiento ----
const expiringWindowDays = ref(
  Number(localStorage.getItem(LS_EXPIRING_DAYS)) || DEFAULT_EXPIRING_DAYS
)

const setExpiringWindowDays = (value) => {
  const num = Math.max(1, Number(value) || 1)
  expiringWindowDays.value = num
  localStorage.setItem(LS_EXPIRING_DAYS, String(num))
}

// ---- Fechas de vencimiento por insumo ----
const loadExpirations = () => {
  try {
    const raw = localStorage.getItem(LS_EXPIRATIONS)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

const expirations = ref(loadExpirations())

const getExpiration = (supplyId) => expirations.value[supplyId] || null

const setExpiration = (supplyId, dateStr) => {
  if (dateStr) {
    expirations.value = { ...expirations.value, [supplyId]: dateStr }
  } else {
    const copy = { ...expirations.value }
    delete copy[supplyId]
    expirations.value = copy
  }
  localStorage.setItem(LS_EXPIRATIONS, JSON.stringify(expirations.value))
}

const clearExpiration = (supplyId) => setExpiration(supplyId, null)

// ---- Helpers de estado ----
const isLowStock = (supply) => {
  if (!supply || supply.quantity == null) return false
  return supply.quantity <= lowStockThreshold.value
}

const daysUntilExpiration = (supplyId) => {
  const exp = getExpiration(supplyId)
  if (!exp) return null
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const expDate = new Date(exp)
  expDate.setHours(0, 0, 0, 0)
  const diffMs = expDate - now
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}

const isExpiringSoon = (supply) => {
  const days = daysUntilExpiration(supply.id)
  return days !== null && days >= 0 && days <= expiringWindowDays.value
}

const isExpired = (supply) => {
  const days = daysUntilExpiration(supply.id)
  return days !== null && days < 0
}

/**
 * Genera lista de alertas a partir de un array de supplies.
 * @param {Array} supplies
 * @returns {{ lowStock: Array, expiringSoon: Array, expired: Array }}
 */
const buildAlerts = (supplies) => {
  const low = []
  const soon = []
  const expired = []
  for (const s of supplies) {
    if (isLowStock(s)) low.push(s)
    if (isExpired(s)) expired.push(s)
    else if (isExpiringSoon(s)) soon.push(s)
  }
  return { lowStock: low, expiringSoon: soon, expired }
}

export function useInventoryAlerts() {
  return {
    // config
    lowStockThreshold,
    setLowStockThreshold,
    expiringWindowDays,
    setExpiringWindowDays,
    // fechas por insumo
    expirations,
    getExpiration,
    setExpiration,
    clearExpiration,
    // helpers de estado
    isLowStock,
    isExpiringSoon,
    isExpired,
    daysUntilExpiration,
    buildAlerts
  }
}