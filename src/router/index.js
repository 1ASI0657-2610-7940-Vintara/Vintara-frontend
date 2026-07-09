import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/auth/application/auth.store'
import DashboardLayout from '../layouts/DashboardLayout.vue'

// Importar rutas de cada Bounded Context
import { authRoutes } from '@/auth/presentation/auth.routes'
import { inventoryRoutes } from '@/inventory/presentation/inventory.routes'
import { iotRoutes } from '@/iot/presentation/iot.routes'
import { profilesRoutes } from '@/profiles/presentation/profiles.routes'
import { analyticsRoutes } from '@/analytics/presentation/analytics.routes'

const routes = [
  ...authRoutes,
  {
    path: '/',
    component: DashboardLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/dashboard' },
      ...analyticsRoutes,
      ...inventoryRoutes,
      ...iotRoutes,
      ...profilesRoutes
    ]
  },
  // Catch-all: cualquier ruta no encontrada
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/dashboard'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isAuth = authStore.isAuthenticated()

  if (to.meta.requiresAuth && !isAuth) {
    // Ruta protegida sin sesión → login
    next('/login')
  } else if (to.path === '/login' && isAuth) {
    // Ya logueado y va a login → dashboard
    next('/dashboard')
  } else {
    next()
  }
})

export default router