import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// --- IoT Backend Simulator State ---
let alertIdCounter = 1
const sensorAlerts = []

const devices = [
  { id: 'TANK-FERM-001', type: 'temperature', unit: '°C', normalMin: 14, normalMax: 18 },
  { id: 'TANK-FERM-002', type: 'temperature', unit: '°C', normalMin: 14, normalMax: 18 },
  { id: 'WAREHOUSE-001', type: 'humidity', unit: '%HR', normalMin: 50, normalMax: 60 },
  { id: 'BARREL-002', type: 'level', unit: '%', normalMin: 80, normalMax: 95 },
  { id: 'BARREL-003', type: 'pressure', unit: 'bar', normalMin: 1.0, normalMax: 1.5 },
  { id: 'EQUIP-NOISE-001', type: 'noise', unit: 'dB', normalMin: 40, normalMax: 65 },
  { id: 'SENSOR-MOV-001', type: 'movement', unit: 'evt/h', normalMin: 0, normalMax: 30 }
]

function generateReading(device, customStatus = null, isAnomaly = false) {
  let status = customStatus
  let value

  if (!status) {
    const roll = Math.random()
    if (roll < 0.82) {
      status = 'NORMAL'
    } else if (roll < 0.94) {
      status = 'WARNING'
    } else {
      status = 'CRITICAL'
    }
  }

  if (status === 'NORMAL') {
    value = device.normalMin + Math.random() * (device.normalMax - device.normalMin)
  } else if (status === 'WARNING') {
    value = Math.random() > 0.5
      ? device.normalMax + 0.5 + Math.random() * (device.normalMax * 0.1)
      : device.normalMin - 0.5 - Math.random() * (device.normalMin * 0.1)
  } else {
    value = Math.random() > 0.5
      ? device.normalMax + 5 + Math.random() * (device.normalMax * 0.2)
      : device.normalMin - 5 - Math.random() * (device.normalMin * 0.2)
  }

  value = parseFloat(value.toFixed(2))

  return {
    id: alertIdCounter++,
    deviceId: device.id,
    sensorType: device.type,
    value,
    unit: device.unit,
    timestamp: new Date().toISOString(),
    status,
    isAnomaly: isAnomaly || status === 'CRITICAL',
    acknowledged: false
  }
}

// Pre-fill history (last 7 days)
// We want approx 6 readings per hour per device -> 7 days = 168 hours -> 1008 readings per device
const NOW = Date.now()
const readingsPerDevice = 1008
const intervalMs = 10 * 60 * 1000 // 10 minutes
for (let i = readingsPerDevice; i >= 0; i--) {
  for (const device of devices) {
    const alert = generateReading(device)
    alert.timestamp = new Date(NOW - i * intervalMs).toISOString()
    sensorAlerts.unshift(alert) // newest at the front (index 0)
  }
}

// Periodically append new readings (every 4 seconds)
setInterval(() => {
  const device = devices[Math.floor(Math.random() * devices.length)]
  const alert = generateReading(device)
  sensorAlerts.unshift(alert)
  if (sensorAlerts.length > 10000) {
    sensorAlerts.pop()
  }
}, 4000)

// --- Vite Configuration ---
export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'mock-backend-simulator',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = new URL(req.url || '', `http://${req.headers.host}`)
          
          // Endpoint: GET /api/v1/sensor-alerts
          if (req.method === 'GET' && url.pathname === '/api/v1/sensor-alerts') {
            const size = parseInt(url.searchParams.get('size') || '50')
            const page = parseInt(url.searchParams.get('page') || '1')
            const status = url.searchParams.get('status')
            const sensorType = url.searchParams.get('sensorType')

            let filtered = [...sensorAlerts]
            if (status && status !== 'ALL') {
              filtered = filtered.filter(a => a.status === status)
            }
            if (sensorType && sensorType !== 'ALL') {
              filtered = filtered.filter(a => a.sensorType === sensorType)
            }

            const start = (page - 1) * size
            const items = filtered.slice(start, start + size)

            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({
              items,
              page,
              size,
              totalItems: filtered.length,
              totalPages: Math.ceil(filtered.length / size)
            }))
            return
          }

          // Endpoint: PATCH /api/v1/sensor-alerts/:id/acknowledge
          const ackMatch = url.pathname.match(/^\/api\/v1\/sensor-alerts\/(\d+)\/acknowledge$/)
          if (req.method === 'PATCH' && ackMatch) {
            const id = parseInt(ackMatch[1])
            const alert = sensorAlerts.find(a => a.id === id)
            if (alert) {
              alert.acknowledged = true
              res.writeHead(200, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({
                id,
                acknowledged: true,
                acknowledgedAt: new Date().toISOString()
              }))
            } else {
              res.writeHead(404, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ error: 'Alert not found' }))
            }
            return
          }

          // Let Vite handle other assets
          next()
        })
      }
    }
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
