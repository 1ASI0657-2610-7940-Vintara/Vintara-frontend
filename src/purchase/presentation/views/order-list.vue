<script setup>
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useConfirm } from "primevue";
import usePurchaseStore from "../../application/purchase.store.js";
import { onMounted } from "vue";

const { t } = useI18n();
const router = useRouter();
const confirm = useConfirm();
const store = usePurchaseStore();

onMounted(() => {
  store.fetchOrders();
});

const getStatusLabel = (status) => status; // Puedes agregar lógica de traducción
</script>

<template>
  <div class="p-4">
    <h1>{{ t("orders.title") }}</h1>
    <pv-button :label="t('orders.new')" icon="pi pi-plus" class="mb-3" @click="router.push({ name: 'purchase-order-new' })" />

    <pv-data-table :value="store.orders" striped-rows paginator :rows="5">
      <pv-column field="id" :header="t('orders.id')" sortable />
      <pv-column field="productName" header="Insumo" sortable />
      <pv-column field="supplier" :header="t('orders.supplier')" sortable />
      <pv-column field="quantity" :header="t('orders.quantity')" />
      <pv-column field="status" :header="t('orders.status')">
        <template #body="slotProps">
          <pv-tag :value="getStatusLabel(slotProps.data.status)" :severity="slotProps.data.status === 'DELIVERED' ? 'success' : 'warning'" />
        </template>
      </pv-column>
      <pv-column :header="t('orders.actions')">
        <template #body="slotProps">
          <pv-button icon="pi pi-pencil" text rounded @click="router.push({ name: 'purchase-order-edit', params: { id: slotProps.data.id } })" />
          <pv-button icon="pi pi-trash" text rounded severity="danger" @click="confirm.require({ message: t('orders.confirm-delete', { id: slotProps.data.id }), header: t('orders.delete-header'), accept: () => store.deleteOrder(slotProps.data.id) })" />
        </template>
      </pv-column>
    </pv-data-table>
    <pv-confirm-dialog />
  </div>
</template>