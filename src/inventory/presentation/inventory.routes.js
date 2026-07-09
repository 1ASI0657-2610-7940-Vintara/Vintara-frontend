export const inventoryRoutes = [
  {
    path: 'assets',
    name: 'Assets',
    component: () => import('./views/AssetManagementView.vue'),
    meta: { requiresAuth: true }
  }
]
