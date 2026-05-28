const analyticsView = () => import('./views/analytics-view.vue');

const analyticsRoutes = [
    {
        path: '',
        name: 'analytics',
        component: analyticsView,
        meta: { title: 'Analytics' }
    },
];

export default analyticsRoutes;