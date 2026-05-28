import { createApp } from 'vue'
import './style.css'
import App from './app.vue'
import i18n from "./i18n.js";
import PrimeVue from 'primevue/config';
import Material from '@primeuix/themes/material';
import { definePreset } from '@primeuix/themes';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import {
    Button, DatePicker,
    Card, Popover,
    Checkbox,
    Column,
    ConfirmationService,
    ConfirmDialog, DataTable, Dialog,
    DialogService, Drawer, FileUpload, FloatLabel, IconField, InputIcon, InputNumber, InputText, Menu,
    Rating, Row, Select, SelectButton, Tag, Textarea, ProgressSpinner, Toast,
    ToastService, Toolbar, Tooltip, Calendar
} from "primevue";
import router from "./router.js";
import pinia from "./pinia.js";
import Chart from "primevue/chart";

const WineSoftPreset = definePreset(Material, {
    semantic: {
        primary: {
            50:  '#f3f0ff',
            100: '#e6e0ff',
            200: '#cdbbff',
            300: '#b399ff',
            400: '#9476ff',
            500: '#6C4CF6',
            600: '#5a3fe0',
            700: '#482fa8',
            800: '#342170',
            900: '#211338'
        },
        surface: {
            0:   '#0B1D39',
            50:  '#0f263f',
            100: '#142a46',
            200: '#172f52'
        }
    },
    colorScheme: {
        dark: {
            surface: '#0B1D39',
            textColor: '#FFFFFF',
            primaryColor: '#3A4FFF',
            primaryColorText: '#ffffff'
        }
    }
});

createApp(App)
    .use(PrimeVue, {
        theme: {
            preset: WineSoftPreset,
            options: {
                darkModeSelector: '.dark'
            }
        }
    })
    .use(ConfirmationService)
    .use(DialogService)
    .use(ToastService)
    .component('pv-button', Button)
    .component('pv-card', Card)
    .component('pv-calendar', Calendar)
    .component('pv-date-picker', DatePicker)
    .component('pv-popover', Popover)
    .component('pv-column', Column)
    .component('pv-confirm-dialog', ConfirmDialog)
    .component('pv-checkbox', Checkbox)
    .component('pv-data-table', DataTable)
    .component('pv-dialog', Dialog)
    .component('pv-select', Select)
    .component('pv-select-button', SelectButton)
    .component('pv-file-upload', FileUpload)
    .component('pv-float-label', FloatLabel)
    .component('pv-icon-field', IconField)
    .component('pv-input-icon', InputIcon)
    .component('pv-input-text', InputText)
    .component('pv-input-number', InputNumber)
    .component('pv-menu', Menu)
    .component('pv-rating', Rating)
    .component('pv-row', Row)
    .component('pv-drawer', Drawer)
    .component('pv-tag', Tag)
    .component('pv-textarea', Textarea)
    .component('pv-toolbar', Toolbar)
    .component('pv-toast', Toast)
    .component('pv-chart', Chart)
    .component('pv-spinner', ProgressSpinner)
    .directive('tooltip', Tooltip)
    .use(i18n)
    .use(router)
    .use(pinia)
    .mount('#app')
