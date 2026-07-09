<script setup>
import { onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
  },
  closeOnEsc: {
    type: Boolean,
    default: true
  },
  closeOnBackdrop: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['close'])

const handleClose = () => {
  emit('close')
}

const handleBackdropClick = (e) => {
  if (props.closeOnBackdrop && e.target === e.currentTarget) {
    handleClose()
  }
}

const handleKeyDown = (e) => {
  if (props.closeOnEsc && e.key === 'Escape' && props.show) {
    handleClose()
  }
}

// Watch 'show' to toggle scroll on body
watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  },
  { immediate: true }
)

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  document.body.style.overflow = '' // Ensure clean up
})
</script>

<template>
  <teleport to="body">
    <transition name="modal-fade">
      <div
        v-if="show"
        class="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto"
        @click="handleBackdropClick"
      >
        <transition name="modal-scale">
          <div
            v-if="show"
            class="bg-white w-full rounded-2xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] text-slate-900 overflow-hidden transform transition-all duration-300"
            :class="[
              size === 'sm' ? 'max-w-md' : '',
              size === 'md' ? 'max-w-lg' : '',
              size === 'lg' ? 'max-w-2xl' : '',
              size === 'xl' ? 'max-w-4xl' : ''
            ]"
            role="dialog"
            aria-modal="true"
          >
            <!-- Modal Header -->
            <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 class="font-semibold font-headline-sm text-headline-sm text-slate-900">
                {{ title }}
              </h3>
              <button
                @click="handleClose"
                class="text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-full hover:bg-slate-100 flex items-center justify-center"
                aria-label="Cerrar modal"
              >
                <span class="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <!-- Modal Body -->
            <div class="p-6 overflow-y-auto flex-1 font-body-md text-body-md text-slate-700">
              <slot></slot>
            </div>

            <!-- Modal Footer -->
            <div v-if="$slots.footer" class="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
              <slot name="footer"></slot>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </teleport>
</template>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-scale-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.modal-scale-leave-active {
  transition: all 0.2s ease;
}

.modal-scale-enter-from,
.modal-scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
