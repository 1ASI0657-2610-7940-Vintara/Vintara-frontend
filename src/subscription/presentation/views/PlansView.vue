<script setup>
import { ref, computed } from 'vue'
import { useSubscriptionStore, PLANS } from '../../application/subscription.store'
import { useToastStore } from '@/shared/application/toast.store'
import PlanCard from '../components/PlanCard.vue'
import CheckoutModal from '../components/CheckoutModal.vue'

const subscriptionStore = useSubscriptionStore()
const toastStore = useToastStore()

const currentPlanId = computed(() => subscriptionStore.currentPlanId)
const deviceCount = computed(() => subscriptionStore.deviceCount)
const deviceLimit = computed(() => subscriptionStore.deviceLimit)
const usagePercent = computed(() => subscriptionStore.usagePercent)
const isOverLimit = computed(() => subscriptionStore.isOverDeviceLimit)

const plans = [PLANS.FREE, PLANS.PRO, PLANS.ENTERPRISE]

const showCheckout = ref(false)
const selectedPlan = ref(null)

const handleUpgrade = (plan) => {
  selectedPlan.value = plan
  showCheckout.value = true
}

const handlePaymentSuccess = (planId) => {
  const planName = PLANS[planId]?.name
  showCheckout.value = false
  toastStore.success(
    `¡Plan ${planName} activado exitosamente! Ya puedes conectar más dispositivos.`,
    'Pago exitoso 🎉'
  )
}

// Billing toggle (UI only, mock)
const isAnnual = ref(false)
const annualDiscount = 20 // %

const displayPrice = (plan) => {
  if (plan.price === 0) return '$0'
  const p = isAnnual.value ? Math.round(plan.price * (1 - annualDiscount / 100)) : plan.price
  return `$${p}`
}
</script>

<template>
  <div class="space-y-8">
    <!-- Page header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h2 class="font-headline-lg text-headline-lg text-on-surface mb-1">
          Planes y Suscripción
        </h2>
        <p class="font-body-md text-body-md text-on-surface-variant">
          Elige el plan que mejor se adapta a las necesidades de tu viñedo.
        </p>
      </div>

      <!-- Billing toggle -->
      <div class="flex items-center gap-3 bg-surface-container rounded-xl px-4 py-2.5 self-start border border-outline-variant">
        <span class="font-label-sm text-label-sm text-on-surface-variant">Mensual</span>
        <button
          @click="isAnnual = !isAnnual"
          class="relative w-10 h-6 rounded-full transition-colors duration-300"
          :class="isAnnual ? 'bg-primary' : 'bg-outline'"
          id="billing-toggle"
          :aria-pressed="isAnnual"
          aria-label="Cambiar a facturación anual"
        >
          <span
            class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300"
            :class="{ 'translate-x-4': isAnnual }"
          ></span>
        </button>
        <span class="font-label-sm text-label-sm text-on-surface">
          Anual
          <span class="ml-1 px-1.5 py-0.5 bg-tertiary/10 text-tertiary rounded-full text-[10px] font-bold">
            -{{ annualDiscount }}%
          </span>
        </span>
      </div>
    </div>

    <!-- Current usage card -->
    <div
      class="rounded-2xl border p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
      :class="isOverLimit
        ? 'bg-error/5 border-error/30'
        : 'bg-surface-container-lowest border-outline-variant'"
    >
      <div
        class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        :class="isOverLimit ? 'bg-error/10' : 'bg-primary/10'"
      >
        <span
          class="material-symbols-outlined text-[24px]"
          :class="isOverLimit ? 'text-error' : 'text-primary'"
          style="font-variation-settings: 'FILL' 1;"
        >sensors</span>
      </div>

      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1 flex-wrap">
          <p class="font-label-md text-label-md text-on-surface">
            Uso actual de dispositivos IoT
          </p>
          <span
            class="px-2 py-0.5 rounded-full font-label-sm text-[11px] border"
            :class="subscriptionStore.planBadgeColor"
          >
            Plan {{ subscriptionStore.currentPlan.name }}
          </span>
          <span
            v-if="isOverLimit"
            class="flex items-center gap-1 px-2 py-0.5 rounded-full bg-error/10 text-error font-label-sm text-[11px]"
          >
            <span class="material-symbols-outlined text-[12px]" style="font-variation-settings: 'FILL' 1;">warning</span>
            Límite alcanzado
          </span>
        </div>

        <div class="flex items-center gap-3">
          <div class="flex-1 h-2 bg-surface-container-high rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-700"
              :class="isOverLimit ? 'bg-error' : usagePercent > 70 ? 'bg-amber-500' : 'bg-primary'"
              :style="{ width: `${Math.min(usagePercent, 100)}%` }"
            ></div>
          </div>
          <span
            class="font-label-md text-label-md font-bold whitespace-nowrap"
            :class="isOverLimit ? 'text-error' : 'text-on-surface'"
          >
            {{ deviceCount }} / {{ deviceLimit === Infinity ? '∞' : deviceLimit }}
          </span>
        </div>
      </div>
    </div>

    <!-- Plan cards grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
      <PlanCard
        v-for="plan in plans"
        :key="plan.id"
        :plan="plan"
        :is-current-plan="plan.id === currentPlanId"
        :is-popular="plan.id === 'PRO'"
        @upgrade="handleUpgrade"
      />
    </div>

    <!-- FAQ / info strip -->
    <div class="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6">
      <h3 class="font-headline-sm text-headline-sm text-on-surface mb-4 flex items-center gap-2">
        <span class="material-symbols-outlined text-primary text-[22px]" style="font-variation-settings: 'FILL' 1;">help</span>
        Preguntas frecuentes
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        <div>
          <p class="font-label-md text-label-md text-on-surface mb-1">¿Puedo cambiar de plan en cualquier momento?</p>
          <p class="font-body-sm text-body-sm text-on-surface-variant">Sí, el cambio es inmediato y los dispositivos adicionales quedan disponibles al instante.</p>
        </div>
        <div>
          <p class="font-label-md text-label-md text-on-surface mb-1">¿Qué pasa si supero el límite?</p>
          <p class="font-body-sm text-body-sm text-on-surface-variant">El sistema te avisará con un modal antes de permitir agregar más dispositivos. No perderás los existentes.</p>
        </div>
        <div>
          <p class="font-label-md text-label-md text-on-surface mb-1">¿Hay contratos anuales obligatorios?</p>
          <p class="font-body-sm text-body-sm text-on-surface-variant">No. La facturación es mensual por defecto. El plan anual es opcional y ofrece un 20% de descuento.</p>
        </div>
        <div>
          <p class="font-label-md text-label-md text-on-surface mb-1">¿El plan Free tiene limitaciones ocultas?</p>
          <p class="font-body-sm text-body-sm text-on-surface-variant">No. El Free incluye funcionalidad completa para hasta 3 dispositivos y alertas normales/advertencia.</p>
        </div>
      </div>
    </div>

    <!-- Checkout Modal -->
    <CheckoutModal
      :show="showCheckout"
      :plan="selectedPlan"
      :is-annual="isAnnual"
      @close="showCheckout = false"
      @success="handlePaymentSuccess"
    />
  </div>
</template>
