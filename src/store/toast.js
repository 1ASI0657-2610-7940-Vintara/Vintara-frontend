import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useToastStore = defineStore('toast', () => {
  const toasts = ref([])

  const add = ({ title, message, type = 'success', duration = 4000 }) => {
    const id = Date.now() + Math.random()
    toasts.value.push({ id, title, message, type })
    setTimeout(() => {
      remove(id)
    }, duration)
  }

  const remove = (id) => {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  const success = (message, title = 'Éxito') => {
    add({ title, message, type: 'success' })
  }

  const error = (message, title = 'Error') => {
    add({ title, message, type: 'error' })
  }

  const warning = (message, title = 'Advertencia') => {
    add({ title, message, type: 'warning' })
  }

  const info = (message, title = 'Información') => {
    add({ title, message, type: 'info' })
  }

  return {
    toasts,
    add,
    remove,
    success,
    error,
    warning,
    info
  }
})
