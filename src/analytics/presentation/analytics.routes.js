export const analyticsRoutes = [
  {
    path: 'dashboard',
    name: 'Dashboard',
    component: () => import('./views/DashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: 'reports',
    name: 'Reports',
    component: () => import('./views/RegulatoryReportsView.vue'),
    meta: { requiresAuth: true }
  }
]
