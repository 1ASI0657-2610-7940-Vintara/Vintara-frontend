<script setup>
import { computed, ref } from 'vue'
import { useSubscriptionStore } from '../../application/subscription.store'

const props = defineProps({
  plan: {
    type: Object,
    required: true,
  },
  isCurrentPlan: {
    type: Boolean,
    default: false,
  },
  isPopular: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['upgrade'])

const subscriptionStore = useSubscriptionStore()

const isFree = computed(() => props.plan.price === 0)
const isEnterprise = computed(() => props.plan.id === 'ENTERPRISE')

const handleUpgrade = () => {
  if (props.isCurrentPlan) return
  emit('upgrade', props.plan)
}
</script>

<template>
  <div
    class="relative flex flex-col rounded-2xl border-2 transition-all duration-300 overflow-hidden"
    :class="{
      'border-amber-400 shadow-xl shadow-amber-100 scale-[1.03]': isPopular && !isCurrentPlan,
      'border-purple-400 shadow-xl shadow-purple-100': isEnterprise && !isCurrentPlan,
      'border-primary shadow-lg shadow-primary/20': isCurrentPlan,
      'border-outline-variant hover:border-outline hover:shadow-md': !isPopular && !isEnterprise && !isCurrentPlan,
    }"
  >
    <!-- Popular badge -->
    <div
      v-if="isPopular"
      class="absolute top-0 left-0 right-0 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-center font-label-sm text-[11px] py-1 tracking-widest uppercase flex items-center justify-center gap-1"
    >
      <span class="material-symbols-outlined text-[14px]" style="font-variation-settings: 'FILL' 1;">star</span>
      Más Popular
    </div>

    <!-- Enterprise badge -->
    <div
      v-else-if="isEnterprise"
      class="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-violet-500 text-white text-center font-label-sm text-[11px] py-1 tracking-widest uppercase flex items-center justify-center gap-1"
    >
      <span class="material-symbols-outlined text-[14px]" style="font-variation-settings: 'FILL' 1;">workspace_premium</span>
      Premium
    </div>

    <!-- Current plan ribbon -->
    <div
      v-if="isCurrentPlan"
      class="absolute top-0 left-0 right-0 bg-primary text-on-primary text-center font-label-sm text-[11px] py-1 tracking-widest uppercase flex items-center justify-center gap-1"
    >
      <span class="material-symbols-outlined text-[14px]" style="font-variation-settings: 'FILL' 1;">check_circle</span>
      Plan Actual
    </div>

    <!-- Card content -->
    <div
      class="flex-1 flex flex-col p-6"
      :class="{ 'pt-10': isPopular || isEnterprise || isCurrentPlan }"
    >
      <!-- Plan name & icon -->
      <div class="flex items-center gap-3 mb-4">
        <div
          class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          :class="{
            'bg-surface-container text-on-surface-variant': isFree,
            'bg-amber-100 text-amber-700': isPopular,
            'bg-purple-100 text-purple-700': isEnterprise,
          }"
        >
          <span
            class="material-symbols-outlined text-[20px]"
            style="font-variation-settings: 'FILL' 1;"
          >
            {{ isFree ? 'layers' : isPopular ? 'rocket_launch' : 'diamond' }}
          </span>
        </div>
        <div>
          <h3 class="font-headline-sm text-headline-sm text-on-surface">{{ plan.name }}</h3>
          <p class="font-body-sm text-[12px] text-on-surface-variant">
            {{ isFree ? 'Para empezar' : isPopular ? 'Para tu negocio' : 'Sin límites' }}
          </p>
        </div>
      </div>

      <!-- Price -->
      <div class="mb-6">
        <div class="flex items-end gap-1">
          <span
            class="font-headline-xl text-headline-xl font-bold"
            :class="{
              'text-on-surface-variant': isFree,
              'text-amber-600': isPopular,
              'text-purple-600': isEnterprise,
              'text-primary': isCurrentPlan && !isPopular && !isEnterprise,
            }"
          >
            {{ isFree ? '$0' : isEnterprise ? '$99' : '$29' }}
          </span>
          <span class="text-on-surface-variant font-body-sm mb-1.5">/mes</span>
        </div>
        <p v-if="isFree" class="font-label-sm text-[11px] text-on-surface-variant">Siempre gratuito</p>
        <p v-else class="font-label-sm text-[11px] text-on-surface-variant">Facturado mensualmente</p>
      </div>

      <!-- Device limit highlight -->
      <div
        class="flex items-center gap-2 rounded-lg px-3 py-2 mb-5 border"
        :class="{
          'bg-surface-container border-outline-variant': isFree,
          'bg-amber-50 border-amber-200': isPopular,
          'bg-purple-50 border-purple-200': isEnterprise,
        }"
      >
        <span
          class="material-symbols-outlined text-[18px]"
          :class="{
            'text-on-surface-variant': isFree,
            'text-amber-600': isPopular,
            'text-purple-600': isEnterprise,
          }"
          style="font-variation-settings: 'FILL' 1;"
        >sensors</span>
        <span
          class="font-label-md text-label-md"
          :class="{
            'text-on-surface': isFree,
            'text-amber-800': isPopular,
            'text-purple-800': isEnterprise,
          }"
        >
          {{
            plan.deviceLimit === Infinity
              ? 'Dispositivos IoT ilimitados'
              : `${plan.deviceLimit} dispositivos IoT`
          }}
        </span>
      </div>

      <!-- Features list -->
      <ul class="space-y-2.5 flex-1">
        <li
          v-for="feature in plan.features"
          :key="feature"
          class="flex items-start gap-2 font-body-sm text-body-sm text-on-surface"
        >
          <span
            class="material-symbols-outlined text-[18px] flex-shrink-0 mt-0.5"
            :class="{
              'text-tertiary': !isPopular && !isEnterprise,
              'text-amber-500': isPopular,
              'text-purple-500': isEnterprise,
            }"
            style="font-variation-settings: 'FILL' 1;"
          >check_circle</span>
          {{ feature }}
        </li>
        <li
          v-for="missing in plan.notIncluded"
          :key="missing"
          class="flex items-start gap-2 font-body-sm text-body-sm text-on-surface-variant opacity-50"
        >
          <span class="material-symbols-outlined text-[18px] flex-shrink-0 mt-0.5">remove</span>
          {{ missing }}
        </li>
      </ul>
    </div>

    <!-- CTA Button -->
    <div class="px-6 pb-6">
      <button
        v-if="isCurrentPlan"
        disabled
        class="w-full py-2.5 rounded-xl border-2 border-primary text-primary font-label-md text-label-md flex items-center justify-center gap-2 opacity-70 cursor-not-allowed"
      >
        <span class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' 1;">check_circle</span>
        Plan actual
      </button>
      <button
        v-else-if="isFree"
        disabled
        class="w-full py-2.5 rounded-xl bg-surface-container text-on-surface-variant font-label-md text-label-md cursor-not-allowed opacity-60"
      >
        Plan gratuito
      </button>
      <button
        v-else
        @click="handleUpgrade"
        class="w-full py-2.5 rounded-xl font-label-md text-label-md transition-all duration-200 flex items-center justify-center gap-2"
        :class="{
          'bg-amber-500 hover:bg-amber-600 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5': isPopular,
          'bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5': isEnterprise,
        }"
      >
        <span class="material-symbols-outlined text-[18px]">upgrade</span>
        Activar {{ plan.name }}
      </button>
    </div>
  </div>
</template>
