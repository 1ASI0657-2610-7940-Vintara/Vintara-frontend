const list = () => import('./views/order-list.vue');
const form = () => import('./views/order-form.vue');

export default [
    { path: '', name: 'purchase-order-list', component: list },
    { path: 'new', name: 'purchase-order-new', component: form },
    { path: ':id/edit', name: 'purchase-order-edit', component: form, props: true }
];