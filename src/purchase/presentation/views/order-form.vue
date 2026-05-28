<script setup>
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import usePurchaseStore from "../../application/purchase.store.js";
import useInventoryStore from "../../../inventory/application/inventory.store.js";
import { computed, onMounted, ref, watch } from "vue";
import { Order } from "../../domain/model/order.entity.js";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const purchaseStore = usePurchaseStore();
const inventoryStore = useInventoryStore();

const form = ref({ productId: null, supplier: null, quantity: 0, status: "Pending" });
const isEdit = computed(() => !!route.params.id);

const statusOptions = computed(() => [
  { label: t('orders.status-pending') || 'Pendiente', value: 'Pending' },
  { label: t('orders.status-completed') || 'Completado', value: 'Completed' },
  { label: t('orders.status-cancelled') || 'Cancelado', value: 'Cancelled' }
]);

const supplyOptions = computed(() =>
    inventoryStore.supplies.map(s => ({ 
      label: `${s.supplyName} (${s.supplier})`, 
      value: s.id 
    }))
);

const supplierOptions = computed(() =>
    [...new Set(inventoryStore.supplies.map(s => s.supplier))]
        .map(name => ({ label: name, value: name }))
);

// Auto-fill supplier when product is selected
watch(() => form.value.productId, (newId) => {
  if (newId && !isEdit.value) {
    const selectedSupply = inventoryStore.supplies.find(s => s.id === newId);
    if (selectedSupply) {
      form.value.supplier = selectedSupply.supplier;
    }
  }
});

onMounted(async () => {
  if (!inventoryStore.suppliesLoaded) {
    await inventoryStore.fetchSupplies();
  }

  if (isEdit.value) {
    const order = purchaseStore.getOrderById(route.params.id);
    if (order) {
      form.value = {
        productId: order.productId,
        supplier: order.supplier,
        quantity: order.quantity,
        status: order.status
      };
    }
  }
});

const save = () => {
  const order = new Order({
    id: isEdit.value ? parseInt(route.params.id) : null,
    productId: form.value.productId,
    supplier: form.value.supplier,
    quantity: form.value.quantity,
    status: form.value.status
  });

  if (isEdit.value) {
    purchaseStore.updateOrder(order);
  } else {
    purchaseStore.addOrder(order);
  }

  router.push({ name: 'purchase-order-list' });
};

const goBack = () => {
  router.push({ name: 'purchase-order-list' });
};
</script>

<template>
  <div class="p-4">
    <h1>{{ isEdit ? t("orders.edit") : t("orders.new") }}</h1>

    <form @submit.prevent="save">
      <div class="field mb-3">
        <label>{{ t("orders.supply") }}</label>
        <pv-select v-model="form.productId" :options="supplyOptions" optionLabel="label" optionValue="value" class="w-full" required />
      </div>

      <div class="field mb-3">
        <label>{{ t("orders.supplier") }}</label>
        <pv-select v-model="form.supplier" :options="supplierOptions" optionLabel="label" optionValue="value" class="w-full" required />
      </div>

      <div class="field mb-3">
        <label>{{ t("orders.quantity") }}</label>
        <pv-input-number v-model="form.quantity" class="w-full" required />
      </div>

      <div class="field mb-3">
        <label>{{ t("orders.status") }}</label>
        <pv-select v-model="form.status" :options="statusOptions" optionLabel="label" optionValue="value" class="w-full" />
      </div>

      <pv-button type="submit" :label="t('orders.save')" icon="pi pi-save" />
      <pv-button :label="t('orders.cancel')" severity="secondary" class="ml-2" @click="goBack" />
    </form>
  </div>
</template>