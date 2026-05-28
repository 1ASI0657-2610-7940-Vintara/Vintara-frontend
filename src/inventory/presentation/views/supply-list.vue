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

const { supplies, suppliesLoaded, errors, fetchSupplies, deleteSupply } = store;

onMounted(() => {
  if (!suppliesLoaded) fetchSupplies();
});

const navigateToNew = () => {
  router.push({ name: "inventory-supply-new" });
};

const navigateToEdit = (id) => {
  router.push({ name: "inventory-supply-edit", params: { id } });
};

const confirmDelete = (supply) => {
  confirm.require({
    message: t("supplies.confirm-delete", { id: supply.id }),
    header: t("supplies.delete-header"),
    icon: "pi pi-exclamation-triangle",
    accept: () => {
      deleteSupply(supply.id);
    },
  });
};
</script>

<template>
  <div class="p-4">
    <h1>{{ t("supplies.title") }}</h1>
    <pv-button
        :label="t('supplies.new')"
        icon="pi pi-plus"
        class="mb-3"
        @click="navigateToNew"
    />
    <pv-data-table
        :value="supplies"
        :loading="!suppliesLoaded"
        striped-rows
        table-style="min-width: 60rem"
        paginator
        :rows="5"
        :rows-per-page-options="[5, 10, 20]"
    >
      <pv-column field="id" :header="t('supplies.id')" sortable />
      <pv-column field="supplyName" :header="t('supplies.supplyName')" />
      <pv-column field="quantity" :header="t('supplies.quantity')" />
      <pv-column field="unit" :header="t('supplies.unit')" />
      <pv-column field="supplier" :header="t('supplies.supplier')" />
      <pv-column field="price" :header="t('supplies.price')" />
      <pv-column field="date" :header="t('supplies.date')">
        <template #body="slotProps">
          {{ new Date(slotProps.data.date).toLocaleDateString('es-PE', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }) }}
        </template>
      </pv-column>
      <pv-column :header="t('supplies.actions')">
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
