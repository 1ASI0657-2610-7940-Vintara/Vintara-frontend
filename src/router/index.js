import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../store/auth'
import DashboardLayout from '../layouts/DashboardLayout.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: DashboardLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/dashboard' },
      { path: 'dashboard', name: 'Dashboard', component: () => import('../views/DashboardView.vue') },
      { path: 'assets', name: 'Assets', component: () => import('../views/AssetManagementView.vue') },
      { path: 'telemetry', name: 'Telemetry', component: () => import('../views/TelemetryAlertsView.vue') },
      { path: 'compliance', name: 'Compliance', component: () => import('../views/ComplianceView.vue') },
      { path: 'reports', name: 'Reports', component: () => import('../views/RegulatoryReportsView.vue') }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isAuthenticated()) {
    next('/login')
  } else if (to.path === '/login' && authStore.isAuthenticated()) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
