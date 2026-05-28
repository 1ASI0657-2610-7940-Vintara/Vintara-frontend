const profileList = () => import('./views/profile-view.vue');
const profileForm = () => import('./views/profile-form.vue');

const profileRoutes = [
    {
        path: '/profiles',
        name: 'profile-list',
        component: profileList
    },
    {
        path: '/profiles/new',
        name: 'profile-create',
        component: profileForm
    },
    {
        path: '/profiles/:id/edit',
        name: 'profile-edit',
        component: profileForm,
        props: true
    }
];

export default profileRoutes;