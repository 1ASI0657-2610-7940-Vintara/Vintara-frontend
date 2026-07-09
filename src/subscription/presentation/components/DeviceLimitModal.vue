<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSubscriptionStore } from '../../application/subscription.store'

defineProps({
  show: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close'])
const router = useRouter()
const subscriptionStore = useSubscriptionStore()

const deviceLimit = computed(() => subscriptionStore.deviceLimit)
const deviceCount = computed(() => subscriptionStore.deviceCount)
const currentPlan = computed(() => subscriptionStore.currentPlan)
const usagePercent = computed(() => subscriptionStore.usagePercent)

const goToPlans = () => {
  emit('close')
  router.push('/plans')
}
</script>

<template>
  <transition name="modal-fade">
    <div
      v-if="show"
      class="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="device-limit-modal-title"
    >
      <!-- Backdrop -->
      <div
        class="fixed inset-0 bg-inverse-surface/70 backdrop-blur-sm"
        @click="emit('close')"
      ></div>

      <!-- Modal card -->
      <transition name="modal-scale">
        <div
          v-if="show"
          class="relative z-10 w-full max-w-md bg-surface rounded-2xl shadow-2xl border border-outline-variant overflow-hidden"
        >
          <!-- Header gradient strip -->
          <div class="h-1 bg-gradient-to-r from-primary via-rose-400 to-amber-400"></div>

          <div class="p-6">
            <!-- Icon + Title -->
            <div class="flex items-start gap-4 mb-5">
              <div class="w-12 h-12 rounded-xl bg-error/10 flex items-center justify-center flex-shrink-0">
                <span
                  class="material-symbols-outlined text-error text-[28px]"
                  style="font-variation-settings: 'FILL' 1;"
                >device_hub</span>
              </div>
              <div>
                <h3
                  id="device-limit-modal-title"
                  class="font-headline-sm text-headline-sm text-on-surface"
                >
                  Límite de dispositivos alcanzado
                </h3>
                <p class="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  Tu plan <strong>{{ currentPlan.name }}</strong> permite hasta
                  <strong>{{ deviceLimit }} dispositivo{{ deviceLimit !== 1 ? 's' : '' }}</strong>.
                </p>
              </div>
            </div>

            <!-- Usage bar -->
            <div class="bg-surface-container rounded-xl p-4 mb-5">
              <div class="flex justify-between items-center mb-2">
                <span class="font-label-sm text-label-sm text-on-surface-variant">Dispositivos usados</span>
                <span class="font-label-md text-label-md text-error font-bold">
                  {{ deviceCount }} / {{ deviceLimit }}
                </span>
              </div>
              <div class="h-2 bg-surface-container-high rounded-full overflow-hidden">
                <div
                  class="h-full bg-error rounded-full transition-all duration-500"
                  :style="{ width: `${usagePercent}%` }"
                ></div>
              </div>
              <p class="text-[11px] text-error mt-1.5 flex items-center gap-1">
                <span class="material-symbols-outlined text-[14px]" style="font-variation-settings: 'FILL' 1;">warning</span>
                Has alcanzado el límite máximo de tu plan actual.
              </p>
            </div>

            <!-- Plan comparison teaser -->
            <div class="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 mb-6 border border-amber-200">
              <p class="font-label-md text-label-md text-amber-800 mb-2.5 flex items-center gap-2">
                <span class="material-symbols-outlined text-[16px] text-amber-600" style="font-variation-settings: 'FILL' 1;">rocket_launch</span>
                Upgradeando a <strong>Pro</strong> obtienes:
              </p>
              <ul class="space-y-1.5">
                <li class="flex items-center gap-2 font-body-sm text-[13px] text-amber-900">
                  <span class="material-symbols-outlined text-[14px] text-amber-600" style="font-variation-settings: 'FILL' 1;">check_circle</span>
                  Hasta <strong>15 dispositivos IoT</strong>
                </li>
                <li class="flex items-center gap-2 font-body-sm text-[13px] text-amber-900">
                  <span class="material-symbols-outlined text-[14px] text-amber-600" style="font-variation-settings: 'FILL' 1;">check_circle</span>
                  Alertas críticas habilitadas
                </li>
                <li class="flex items-center gap-2 font-body-sm text-[13px] text-amber-900">
                  <span class="material-symbols-outlined text-[14px] text-amber-600" style="font-variation-settings: 'FILL' 1;">check_circle</span>
                  Reportes + exportación PDF
                </li>
              </ul>
            </div>

            <!-- Actions -->
            <div class="flex gap-3">
              <button
                @click="emit('close')"
                class="flex-1 py-2.5 border border-outline-variant rounded-xl font-label-md text-label-md text-on-surface-variant hover:bg-surface-container transition-colors"
              >
                Cancelar
              </button>
              <button
                @click="goToPlans"
                class="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500 text-white rounded-xl font-label-md text-label-md shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <span class="material-symbols-outlined text-[18px]">upgrade</span>
                Ver planes
              </button>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </transition>
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
  transition: all 0.2s ease-in;
}
.modal-scale-enter-from,
.modal-scale-leave-to {
  opacity: 0;
  transform: scale(0.85);
}
</style>
