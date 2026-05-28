<script setup>
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import useOrdersStore from "../../application/orders.store.js";
import useInventoryStore from "../../../inventory/application/inventory.store.js"; // 1. IMPORTAR INVENTORY STORE
import { computed, onMounted, ref } from "vue";
import { Order } from "../../domain/model/order.entity.js";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

// 2. CONFIGURAR AMBOS STORES
const ordersStore = useOrdersStore();
const inventoryStore = useInventoryStore();
const { errors, addOrder, updateOrder } = ordersStore;

// 3. DEFINIR EL NUEVO FORM REF
const form = ref({
  productId: null,
  supplier: null,
  quantity: 0,
  status: "pending"
});

const isEdit = computed(() => !!route.params.id);

// Opciones de Status (como antes)
const statusOptions = ref([
  { label: t('orders.status-pending'), value: 'pending' },
  { label: t('orders.status-in-transit'), value: 'in-transit' },
  { label: t('orders.status-delivered'), value: 'delivered' }
]);

// 4. CREAR LISTAS DE OPCIONES DESDE EL INVENTORY STORE
const productOptions = computed(() => {
  // Crea una lista única de IDs de producto
  const productIds = [...new Set(inventoryStore.supplies.map(s => s.productId))];
  return productIds.map(id => ({
    label: `${t('supplies.productId')}: ${id}`, // Ej: "ID del Producto: 1"
    value: id
  }));
});

const supplierOptions = computed(() => {
  // Crea una lista única de nombres de proveedores
  const supplierNames = [...new Set(inventoryStore.supplies.map(s => s.supplier))];
  return supplierNames.map(name => ({
    label: name, // Ej: "Distribuidora X"
    value: name
  }));
});


onMounted(() => {
  // 5. ASEGURARSE DE CARGAR LOS SUMINISTROS (PARA LOS DROPDOWNS)
  if (!inventoryStore.suppliesLoaded) {
    inventoryStore.fetchSupplies();
  }

  if (isEdit.value) {
    const order = ordersStore.getOrderById(route.params.id);
    if (order) {
      form.value.productId = order.productId;
      form.value.supplier = order.supplier;
      form.value.quantity = order.quantity;
      form.value.status = order.status;
    } else router.push({ name: "order-list" });
  }
});

// 6. ACTUALIZAR SAVEORDER CON EL NUEVO MODELO
const saveOrder = () => {
  const order = new Order({
    id: isEdit.value ? parseInt(route.params.id) : null,
    productId: form.value.productId,
    supplier: form.value.supplier,
    quantity: form.value.quantity,
    status: form.value.status,
  });
  if (isEdit.value) updateOrder(order);
  else addOrder(order);
  navigateBack();
};

const navigateBack = () => {
  router.push({ name: "order-list" });
};
</script>

<template>
  <div class="p-4">
    <h1>{{ isEdit ? t("orders.edit") : t("orders.new") }}</h1>
    <form @submit.prevent="saveOrder">

      <div class="field mb-3">
        <label for="productId">{{ t("supplies.productId") }}</label>
        <pv-select
            id="productId"
            v-model="form.productId"
            :options="productOptions"
            :loading="!inventoryStore.suppliesLoaded"
            option-label="label"
            option-value="value"
            :placeholder="t('supplies.productId')"
            required
            class="w-full"
        />
      </div>

      <div class="field mb-3">
        <label for="supplier">{{ t("supplies.supplier") }}</label>
        <pv-select
            id="supplier"
            v-model="form.supplier"
            :options="supplierOptions"
            :loading="!inventoryStore.suppliesLoaded"
            option-label="label"
            option-value="value"
            :placeholder="t('supplies.supplier')"
            required
            class="w-full"
        />
      </div>

      <div class="field mb-3">
        <label for="quantity">{{ t("orders.quantity") }}</label>
        <pv-input-number id="quantity" v-model="form.quantity" required class="w-full" />
      </div>

      <div class="field mb-3">
        <label for="status">{{ t("orders.status") }}</label>
        <pv-select
            id="status"
            v-model="form.status"
            :options="statusOptions"
            option-label="label"
            option-value="value"
            class="w-full"
        />
      </div>

      <pv-button type="submit" :label="t('orders.save')" icon="pi pi-save" />
      <pv-button :label="t('orders.cancel')" severity="secondary" class="ml-2" @click="navigateBack" />
    </form>
    <div v-if="errors.length" class="text-red-500 mt-3">
      {{ t("errors.occurred") }}: {{ errors.map((e) => e.message).join(", ") }}
    </div>
  </div>
</template>