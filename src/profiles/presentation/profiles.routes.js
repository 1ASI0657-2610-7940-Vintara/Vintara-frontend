export const profilesRoutes = [
  {
    path: 'compliance',
    name: 'Compliance',
    component: () => import('./views/ComplianceView.vue'),
    meta: { requiresAuth: true }
  }
]
