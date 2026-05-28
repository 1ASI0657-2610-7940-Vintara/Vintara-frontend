const orderList = () => import('./views/order-list.vue');
const orderForm = () => import('./views/order-form.vue');

const ordersRoutes = [
    { path: '',            name: 'order-list',    component: orderList,},
    { path: 'new',         name: 'order-new',     component: orderForm,},
    { path: ':id/edit',    name: 'order-edit',    component: orderForm, props: true,},
];

export default ordersRoutes;