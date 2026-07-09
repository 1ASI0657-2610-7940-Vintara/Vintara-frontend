<script setup>
import { ref, computed } from 'vue'
import { SubscriptionApi } from '../../infrastructure/subscription-api'
import { useSubscriptionStore } from '../../application/subscription.store'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  plan: {
    type: Object,
    default: null
  },
  isAnnual: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'success'])

const subscriptionStore = useSubscriptionStore()

// Mock form state
const name = ref('')
const cardNumber = ref('')
const expiry = ref('')
const cvc = ref('')
const isProcessing = ref(false)
const error = ref('')

const finalPrice = computed(() => {
  if (!props.plan) return 0
  if (props.isAnnual) {
    return Math.round(props.plan.price * 12 * 0.8) // 20% discount for annual
  }
  return props.plan.price
})

const formatCardNumber = (e) => {
  let val = e.target.value.replace(/\D/g, '')
  val = val.replace(/(.{4})/g, '$1 ').trim()
  cardNumber.value = val.substring(0, 19)
}

const formatExpiry = (e) => {
  let val = e.target.value.replace(/\D/g, '')
  if (val.length > 2) {
    val = val.substring(0, 2) + '/' + val.substring(2, 4)
  }
  expiry.value = val
}

const formatCVC = (e) => {
  let val = e.target.value.replace(/\D/g, '')
  cvc.value = val.substring(0, 4)
}

const processPayment = async () => {
  if (!name.value || cardNumber.value.length < 19 || expiry.value.length < 5 || cvc.value.length < 3) {
    error.value = 'Por favor completa todos los campos de la tarjeta correctamente.'
    return
  }

  error.value = ''
  isProcessing.value = true

  try {
    // Simulamos el delay de Stripe y el backend
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Llamamos a la API real (mock)
    await SubscriptionApi.upgradePlan(props.plan.id)
    subscriptionStore.upgradePlan(props.plan.id)
    
    emit('success', props.plan.id)
    resetForm()
  } catch (err) {
    error.value = 'El pago fue rechazado. Intenta con otra tarjeta.'
  } finally {
    isProcessing.value = false
  }
}

const resetForm = () => {
  name.value = ''
  cardNumber.value = ''
  expiry.value = ''
  cvc.value = ''
  error.value = ''
  isProcessing.value = false
}

const handleClose = () => {
  if (!isProcessing.value) {
    resetForm()
    emit('close')
  }
}
</script>

<template>
  <transition name="modal-fade">
    <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-inverse-surface/70 backdrop-blur-sm" @click="handleClose"></div>

      <!-- Modal -->
      <transition name="modal-scale">
        <div v-if="show" class="relative z-10 w-full max-w-lg bg-surface rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
          
          <!-- Order Summary Side -->
          <div class="bg-surface-container-low p-6 md:w-[40%] flex flex-col border-r border-outline-variant/30">
            <h3 class="font-headline-sm text-headline-sm text-on-surface mb-6">Resumen</h3>
            
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  :class="plan?.id === 'PRO' ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700'">
                  <span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 1;">
                    {{ plan?.id === 'PRO' ? 'rocket_launch' : 'diamond' }}
                  </span>
                </div>
                <div>
                  <p class="font-label-md text-label-md font-bold text-on-surface">Plan {{ plan?.name }}</p>
                  <p class="font-body-sm text-[12px] text-on-surface-variant">{{ isAnnual ? 'Suscripción Anual' : 'Suscripción Mensual' }}</p>
                </div>
              </div>
            </div>

            <div class="border-t border-outline-variant/50 pt-4 mt-auto">
              <div class="flex justify-between items-center mb-1">
                <span class="font-body-sm text-body-sm text-on-surface-variant">Subtotal</span>
                <span class="font-body-sm text-body-sm text-on-surface">${{ finalPrice }}</span>
              </div>
              <div class="flex justify-between items-center mb-3">
                <span class="font-body-sm text-body-sm text-on-surface-variant">Impuestos (0%)</span>
                <span class="font-body-sm text-body-sm text-on-surface">$0.00</span>
              </div>
              <div class="flex justify-between items-end">
                <span class="font-label-md text-label-md text-on-surface font-bold">Total a pagar</span>
                <div class="text-right">
                  <p class="font-headline-sm text-headline-sm font-bold text-primary">${{ finalPrice }}</p>
                  <p class="text-[10px] text-on-surface-variant">USD</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Payment Form Side -->
          <div class="p-6 md:w-[60%] bg-surface flex flex-col relative">
            <!-- Stripe Logo/Header -->
            <div class="flex justify-between items-center mb-6">
              <h3 class="font-label-md text-label-md text-on-surface font-bold flex items-center gap-2">
                <span class="material-symbols-outlined text-primary text-[20px]">credit_card</span>
                Pago seguro
              </h3>
              <div class="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1 opacity-70">
                <span class="material-symbols-outlined text-[14px]">lock</span>
                Powered by Stripe
              </div>
            </div>

            <div v-if="error" class="mb-4 p-3 bg-error/10 text-error rounded-lg font-body-sm text-[12px] flex items-start gap-2">
              <span class="material-symbols-outlined text-[16px] mt-0.5">error</span>
              {{ error }}
            </div>

            <form @submit.prevent="processPayment" class="space-y-4">
              <!-- Name -->
              <div>
                <label class="block text-[12px] font-semibold text-on-surface-variant mb-1 ml-1">Nombre en la tarjeta</label>
                <input type="text" v-model="name" :disabled="isProcessing"
                  class="w-full px-3 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-body-sm text-on-surface outline-none transition-colors"
                  placeholder="Ej: Juan Pérez" />
              </div>

              <!-- Card Number -->
              <div>
                <label class="block text-[12px] font-semibold text-on-surface-variant mb-1 ml-1">Número de tarjeta</label>
                <div class="relative">
                  <input type="text" v-model="cardNumber" @input="formatCardNumber" :disabled="isProcessing"
                    class="w-full pl-10 pr-3 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-body-sm text-on-surface outline-none transition-colors font-mono tracking-widest"
                    placeholder="0000 0000 0000 0000" />
                  <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-60">credit_card</span>
                </div>
              </div>

              <!-- Expiry & CVC -->
              <div class="flex gap-4">
                <div class="flex-1">
                  <label class="block text-[12px] font-semibold text-on-surface-variant mb-1 ml-1">Vencimiento</label>
                  <input type="text" v-model="expiry" @input="formatExpiry" :disabled="isProcessing"
                    class="w-full px-3 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-body-sm text-on-surface outline-none transition-colors font-mono"
                    placeholder="MM/AA" />
                </div>
                <div class="flex-1">
                  <label class="block text-[12px] font-semibold text-on-surface-variant mb-1 ml-1">CVC</label>
                  <div class="relative">
                    <input type="password" v-model="cvc" @input="formatCVC" :disabled="isProcessing"
                      class="w-full px-3 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-body-sm text-on-surface outline-none transition-colors font-mono"
                      placeholder="123" />
                    <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-60 text-[16px]" title="Código de 3 o 4 dígitos en el reverso">info</span>
                  </div>
                </div>
              </div>

              <!-- Submit Button -->
              <div class="pt-4 mt-2">
                <button type="submit" :disabled="isProcessing"
                  class="w-full py-3 bg-primary hover:bg-primary-container text-on-primary rounded-xl font-label-md text-label-md shadow-md transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                  <span v-if="isProcessing" class="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
                  <span v-if="!isProcessing" class="material-symbols-outlined text-[20px]">lock</span>
                  {{ isProcessing ? 'Procesando pago...' : `Pagar $${finalPrice}` }}
                </button>
              </div>
            </form>

            <button v-if="!isProcessing" @click="handleClose" class="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface transition-colors p-1">
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
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
  transform: scale(0.95) translateY(10px);
}
</style>
