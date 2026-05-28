import { defineStore } from 'pinia';

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [
      // Ejemplo de notificaciones iniciales
      // { id: 1, message: '¡Producto X está por vencer!', date: '2025-10-14', read: false },
      // { id: 2, message: 'Stock bajo en Insumo Y', date: '2025-10-13', read: false },
    ],
  }),
  actions: {
    addNotification(notification) {
      this.notifications.unshift({ ...notification, read: false });
    },
    markAsRead(id) {
      const n = this.notifications.find(n => n.id === id);
      if (n) n.read = true;
    },
    markAllAsRead() {
      this.notifications.forEach(n => n.read = true);
    },
    clearAll() {
      this.notifications = [];
    },
  },
});

