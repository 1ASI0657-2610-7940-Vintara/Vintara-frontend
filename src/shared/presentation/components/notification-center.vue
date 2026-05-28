<template>
  <div>
    <button class="notification-btn" @click="togglePanel">
      <span class="pi pi-bell"></span>
      <span v-if="unreadCount > 0" class="notification-badge">{{ unreadCount }}</span>
    </button>
    <div v-if="showPanel" class="notification-panel">
      <div class="notification-header">
        <span>{{ $t('notifications.title') }}</span>
        <button class="close-btn" @click="togglePanel">&times;</button>
      </div>
      <div v-if="notifications.length === 0" class="notification-empty">
        {{ $t('notifications.empty') }}
      </div>
      <ul v-else class="notification-list">
        <li v-for="n in notifications" :key="n.id" :class="{ unread: !n.read }">
          <div class="notification-content">
            <span>{{ n.message }}</span>
            <small>{{ n.date }}</small>
          </div>
          <button v-if="!n.read" @click="markAsRead(n.id)">{{ $t('notifications.markAsRead') }}</button>
        </li>
      </ul>
      <div v-if="notifications.length > 0" class="notification-actions">
        <button @click="markAllAsRead">{{ $t('notifications.markAllAsRead') }}</button>
        <button @click="clearAll">{{ $t('notifications.clearAll') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useNotificationStore } from '../../../inventory/application/notification.store';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const store = useNotificationStore();
const showPanel = ref(false);

const notifications = computed(() => store.notifications);
const unreadCount = computed(() => store.notifications.filter(n => !n.read).length);

function togglePanel() {
  showPanel.value = !showPanel.value;
}
function markAsRead(id) {
  store.markAsRead(id);
}
function markAllAsRead() {
  store.markAllAsRead();
}
function clearAll() {
  store.clearAll();
}
</script>

<style scoped>
.notification-btn {
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.5rem;
  color: var(--ws-white);
}
.notification-badge {
  position: absolute;
  top: 0;
  right: 0;
  background: var(--ws-blue);
  color: var(--ws-white);
  border-radius: 50%;
  padding: 0 6px;
  font-size: 0.8rem;
}
.notification-panel {
  position: absolute;
  right: 0;
  top: 2.5rem;
  width: 320px;
  background: rgba(11,29,57,0.95);
  color: var(--ws-white);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  z-index: 1000;
  padding: 0.5rem 0;
}
.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  font-weight: bold;
}
.close-btn {
  background: none;
  border: none;
  color: var(--ws-white);
  font-size: 1.2rem;
  cursor: pointer;
}
.notification-empty {
  padding: 1rem;
  text-align: center;
  color: rgba(255,255,255,0.6);
}
.notification-list {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 250px;
  overflow-y: auto;
}
.notification-list li {
  padding: 0.7rem 1rem;
  border-bottom: 1px solid rgba(255,255,255,0.03);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.notification-list li.unread {
  background: rgba(108,76,246,0.08);
}
.notification-content {
  display: flex;
  flex-direction: column;
}
.notification-actions {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 1rem;
}
.notification-actions button {
  background: var(--ws-brand-purple);
  color: var(--ws-white);
  border: none;
  border-radius: 4px;
  padding: 0.3rem 0.7rem;
  cursor: pointer;
  font-size: 0.9rem;
}
</style>
