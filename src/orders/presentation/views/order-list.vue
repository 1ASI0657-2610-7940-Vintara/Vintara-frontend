<script setup>
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useConfirm } from "primevue";
import useOrdersStore from "../../application/orders.store.js"; // RUTA ACTUALIZADA
import { onMounted } from "vue";

const { t } = useI18n();
const router = useRouter();
const confirm = useConfirm();
const store = useOrdersStore(); // STORE ACTUALIZADO

const { orders, ordersLoaded, errors, fetchOrders, deleteOrder } = store;

onMounted(() => {
  if (!ordersLoaded) fetchOrders();
});

const navigateToNew = () => {
  router.push({ name: "order-new" }); // RUTA ACTUALIZADA
};

const navigateToEdit = (id) => {
  router.push({ name: "order-edit", params: { id } }); // RUTA ACTUALIZADA
};

const confirmDelete = (order) => {
  confirm.require({
    message: t("orders.confirm-delete", { id: order.id }),
    header: t("orders.delete-header"),
    icon: "pi pi-exclamation-triangle",
    accept: () => {
      deleteOrder(order.id);
    },
  });
};

const getStatusLabel = (status) => {
  switch (status) {
    case 'pending':
      return t('orders.status-pending');
    case 'in-transit':
      return t('orders.status-in-transit');
    case 'delivered':
      return t('orders.status-delivered');
    default:
      return status;
  }
};
</script>

<template>
  <div class="p-4">
    <h1>{{ t("orders.title") }}</h1>
    <pv-button
        :label="t('orders.new')"
        icon="pi pi-plus"
        class="mb-3"
        @click="navigateToNew"
    />
    <pv-data-table
        :value="orders"
        :loading="!ordersLoaded"
        striped-rows
        table-style="min-width: 60rem"
        paginator
        :rows="5"
        :rows-per-page-options="[5, 10, 20]"
    >
      <pv-column field="id" :header="t('orders.id')" sortable />
      <pv-column field="supplyId" :header="t('orders.supplyId')" sortable />
      <pv-column field="supplierId" :header="t('orders.supplierId')" sortable />
      <pv-column field="quantity" :header="t('orders.quantity')" />
      <pv-column field="status" :header="t('orders.status')">
        <template #body="slotProps">
          <pv-tag :value="getStatusLabel(slotProps.data.status)" :severity="
             slotProps.data.status === 'delivered' ? 'success' : (slotProps.data.status === 'pending' ? 'warning' : 'info')
           " />
        </template>
      </pv-column>

      <pv-column :header="t('orders.actions')">
        <template #body="slotProps">
          <pv-button
              icon="pi pi-pencil"
              text
              rounded
              @click="navigateToEdit(slotProps.data.id)"
          />
          <pv-button
              icon="pi pi-trash"
              text
              rounded
              severity="danger"
              @click="confirmDelete(slotProps.data)"
          />
        </template>
      </pv-column>
    </pv-data-table>
    <div v-if="errors.length" class="text-red-500 mt-3">
      {{ t("errors.occurred") }}:
      {{ errors.map((e) => e.message).join(", ") }}
    </div>
    <pv-confirm-dialog />
  </div>
</template>