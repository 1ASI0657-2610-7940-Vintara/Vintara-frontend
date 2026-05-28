const supplyList = () => import('./views/supply-list.vue');
const supplyForm = () => import('./views/supply-form.vue');
const stockMovementList = () => import('./views/stock-movement-list.vue');
const stockMovementForm = () => import('./views/stock-movement-form.vue');

const inventoryRoutes = [
    { path: '/inventory/supplies',                 name: 'inventory-supplies',            component: supplyList },
    { path: '/inventory/supplies/new',             name: 'inventory-supply-new',          component: supplyForm,},
    { path: '/inventory/supplies/:id/edit',        name: 'inventory-supply-edit',         component: supplyForm, props: true,},
    { path: '/inventory/stock-movements',          name: 'inventory-stock-movements',     component: stockMovementList,},
    { path: '/inventory/stock-movements/new',      name: 'inventory-stock-movement-new',  component: stockMovementForm,},
    { path: '/inventory/stock-movements/:id/edit', name: 'inventory-stock-movement-edit', component: stockMovementForm, props: true,},
];

export default inventoryRoutes;
