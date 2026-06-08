<script setup>
import { useToastStore } from '../store/toast'

const toastStore = useToastStore()
</script>

<template>
  <div class="fixed top-6 right-6 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
    <transition-group
      name="toast-list"
      tag="div"
      class="flex flex-col gap-3 w-full"
    >
      <div
        v-for="toast in toastStore.toasts"
        :key="toast.id"
        class="pointer-events-auto w-full bg-white rounded-xl shadow-lg border flex p-4 overflow-hidden relative transition-all duration-300 hover:shadow-xl"
        :class="[
          toast.type === 'success' ? 'border-emerald-100 bg-emerald-50/90 backdrop-blur-sm' : '',
          toast.type === 'error' ? 'border-rose-100 bg-rose-50/90 backdrop-blur-sm' : '',
          toast.type === 'warning' ? 'border-amber-100 bg-amber-50/90 backdrop-blur-sm' : '',
          toast.type === 'info' ? 'border-blue-100 bg-blue-50/90 backdrop-blur-sm' : ''
        ]"
      >
        <!-- Icon -->
        <div class="flex-shrink-0 mr-3">
          <span
            v-if="toast.type === 'success'"
            class="material-symbols-outlined text-emerald-600 font-variation-settings-fill"
          >
            check_circle
          </span>
          <span
            v-else-if="toast.type === 'error'"
            class="material-symbols-outlined text-rose-600 font-variation-settings-fill"
          >
            error
          </span>
          <span
            v-else-if="toast.type === 'warning'"
            class="material-symbols-outlined text-amber-600 font-variation-settings-fill"
          >
            warning
          </span>
          <span
            v-else
            class="material-symbols-outlined text-blue-600 font-variation-settings-fill"
          >
            info
          </span>
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0 pr-4">
          <h4
            class="font-semibold font-label-md text-label-md leading-tight mb-1"
            :class="[
              toast.type === 'success' ? 'text-emerald-900' : '',
              toast.type === 'error' ? 'text-rose-900' : '',
              toast.type === 'warning' ? 'text-amber-900' : '',
              toast.type === 'info' ? 'text-blue-900' : ''
            ]"
          >
            {{ toast.title }}
          </h4>
          <p
            class="font-body-sm text-[13px] leading-snug"
            :class="[
              toast.type === 'success' ? 'text-emerald-700' : '',
              toast.type === 'error' ? 'text-rose-700' : '',
              toast.type === 'warning' ? 'text-amber-700' : '',
              toast.type === 'info' ? 'text-blue-700' : ''
            ]"
          >
            {{ toast.message }}
          </p>
        </div>

        <!-- Close Button -->
        <button
          @click="toastStore.remove(toast.id)"
          class="absolute top-3 right-3 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100/50 flex items-center justify-center"
        >
          <span class="material-symbols-outlined text-[16px]">close</span>
        </button>
      </div>
    </transition-group>
  </div>
</template>

<style scoped>
.font-variation-settings-fill {
  font-variation-settings: 'FILL' 1;
}

.toast-list-enter-from {
  opacity: 0;
  transform: translateX(100px) scale(0.95);
}
.toast-list-enter-to {
  opacity: 1;
  transform: translateX(0) scale(1);
}
.toast-list-leave-from {
  opacity: 1;
  transform: translateX(0) scale(1);
}
.toast-list-leave-to {
  opacity: 0;
  transform: translateX(100px) scale(0.9);
}
.toast-list-move {
  transition: transform 0.3s ease;
}
</style>
