import Home from "./shared/presentation/views/home.vue";
import SignUp from "./identity/presentation/views/sign-up.vue";
import SignIn from "./identity/presentation/views/sign-in.vue";
import {createRouter, createWebHistory} from "vue-router";
import inventoryRoutes from "./inventory/presentation/inventory.routes.js";
import analyticsRoutes from "./analytics/presentation/analytics.routes.js";
import purchaseRoutes from "./purchase/presentation/purchase.routes.js";
import profileRoutes from "./profiles/presentation/profile.routes.js";

const pageNotFound = () => import('./shared/presentation/views/page-not-found.vue');

const routes = [
    { path: '/home',            name: 'home',       component: Home,            meta: { title: 'Home' } },
    { path: '/sign-up',         name: 'sign-up',    component: SignUp,          meta: { title: 'Sign Up' } },
    { path: '/sign-in',         name: 'sign-in',    component: SignIn,          meta: { title: 'Sign In' } },
    { path: '/sign-in/user-type', name: 'sign-in-user-type', component: () => import('./identity/presentation/views/sign-in/user-type.vue'), meta: { title: 'Tipo de Usuario' } },
    { path: '/recovery-password', name: 'recovery-password', component: () => import('./identity/presentation/views/recovery-password.vue'), meta: { title: 'Recuperar Contraseña' } },
    { path: '/inventory',      name: 'inventory', children: inventoryRoutes },
    { path: '/analytics', name: 'analytics-main', children: analyticsRoutes },
    { path: '/purchase/orders', name: 'purchase', children: purchaseRoutes },
    { path: '/',                redirect: '/sign-in'},
    { path: '/profiles', name: 'profiles', children: profileRoutes },
    { path: '/',                redirect: '/sign-up'},
    { path: '/:pathMatch(.*)*', name: 'not-found',  component: pageNotFound,    meta: { title: 'Page Not Found' } }
];

const router = createRouter({
    history:    createWebHistory(import.meta.env.BASE_URL),
    routes:     routes,
});

router.beforeEach((to, from, next) => {
    console.log(`Navigating from ${from.name} to ${to.name}`);
    let baseTitle = 'WineSoft';
    document.title = to.meta['title'] ? `${to.meta['title']} - ${baseTitle}` : baseTitle;
    next();
});

export default router;