export const iotRoutes = [
  {
    path: 'telemetry',
    name: 'Telemetry',
    component: () => import('./views/TelemetryAlertsView.vue'),
    meta: { requiresAuth: true }
  }
]
