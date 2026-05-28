<script setup>
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useConfirm } from "primevue";
import useInventoryStore from "../../application/inventory.store.js";
import { onMounted } from "vue";

const { t } = useI18n();
const router = useRouter();
const confirm = useConfirm();
const store = useInventoryStore();

const {
  stockMovements,
  stockMovementsLoaded,
  errors,
  fetchStockMovements,
  deleteStockMovement,
} = store;

onMounted(() => {
  if (!stockMovementsLoaded) fetchStockMovements();
});

const navigateToNew = () => {
  router.push({ name: "inventory-stock-movement-new" });
};

const navigateToEdit = (id) => {
  router.push({ name: "inventory-stock-movement-edit", params: { id } });
};

const confirmDelete = (movement) => {
  confirm.require({
    message: t("stockMovements.confirm-delete", { id: movement.id }),
    header: t("stockMovements.delete-header"),
    icon: "pi pi-exclamation-triangle",
    accept: () => {
      deleteStockMovement(movement.id);
    },
  });
};
</script>

<template>
  <div class="p-4">
    <h1>{{ t("stockMovements.title") }}</h1>
    <pv-button
        :label="t('stockMovements.new')"
        icon="pi pi-plus"
        class="mb-3"
        @click="navigateToNew"
    />
    <pv-data-table
        :value="stockMovements"
        :loading="!stockMovementsLoaded"
        striped-rows
        table-style="min-width: 50rem"
        paginator
        :rows="5"
        :rows-per-page-options="[5, 10, 20]"
    >
      <pv-column field="id" :header="t('stockMovements.id')" sortable />
      <pv-column field="productId" :header="t('stockMovements.productId')" sortable />
      <pv-column field="quantity" :header="t('stockMovements.quantity')" sortable />
      <pv-column field="type" :header="t('stockMovements.type')" />
      <pv-column field="reason" :header="t('stockMovements.reason')" />
      <pv-column field="date" :header="t('stockMovements.date')">
        <template #body="slotProps">
          {{ new Date(slotProps.data.date).toLocaleDateString('es-PE', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }) }}
        </template>
      </pv-column>

      <pv-column :header="t('stockMovements.actions')">
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
      {{ t("errors.occurred") }}: {{ errors.map((e) => e.message).join(", ") }}
    </div>
    <pv-confirm-dialog />
  </div>
</template>
