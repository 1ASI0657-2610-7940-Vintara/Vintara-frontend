<script setup>
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import usePurchaseStore from "../../application/purchase.store.js";
import useInventoryStore from "../../../inventory/application/inventory.store.js";
import { computed, onMounted, ref } from "vue";
import { Order } from "../../domain/model/order.entity.js";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const purchaseStore = usePurchaseStore();
const inventoryStore = useInventoryStore();

const form = ref({ supplyName: null, supplier: null, quantity: 0, status: "pending" });
const isEdit = computed(() => !!route.params.id);


const statusOptions = computed(() => [
  { label: t('orders.status-pending'), value: 'pending' },
  { label: t('orders.status-shipped'), value: 'shipped' },
  { label: t('orders.status-delivered'), value: 'delivered' },
  { label: t('orders.status-cancelled'), value: 'cancelled' }
]);

const supplyOptions = computed(() =>
    [...new Set(inventoryStore.supplies.map(s => s.supplyName))]
        .map(name => ({ label: name, value: name }))
);

const supplierOptions = computed(() =>
    [...new Set(inventoryStore.supplies.map(s => s.supplier))]
        .map(name => ({ label: name, value: name }))
);

onMounted(() => {
  if (!inventoryStore.suppliesLoaded) inventoryStore.fetchSupplies();

  if (isEdit.value) {
    const order = purchaseStore.getOrderById(route.params.id);
    if (order) form.value = { ...order };
  }
});

const save = () => {
  const order = new Order({
    id: isEdit.value ? parseInt(route.params.id) : null,
    ...form.value,
    date: new Date().toISOString().split('T')[0]
  });

  if (isEdit.value) purchaseStore.updateOrder(order);
  else purchaseStore.addOrder(order);

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
        <pv-select v-model="form.supplyName" :options="supplyOptions" optionLabel="label" optionValue="value" class="w-full" required />
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