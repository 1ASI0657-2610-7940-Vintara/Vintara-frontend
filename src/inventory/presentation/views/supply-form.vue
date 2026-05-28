<script setup>
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import useInventoryStore from "../../application/inventory.store.js";
import { computed, onMounted, ref } from "vue";
import { Supply } from "../../domain/model/supply.entity.js";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const store = useInventoryStore();
const { errors, addSupply, updateSupply } = store;

const form = ref({ supplyName: null, quantity: 0, unit:"", supplier: "", price: 0, date: null });
const isEdit = computed(() => !!route.params.id);

onMounted(() => {
  if (isEdit.value) {
    const supply = store.getSupplyById(route.params.id);
    if (supply) {
      form.value.supplyName = supply.supplyName;
      form.value.quantity = supply.quantity;
      form.value.unit = supply.unit;
      form.value.supplier = supply.supplier;
      form.value.price = supply.price;
      form.value.date = supply.date;
    } else router.push({ name: "inventory-supplies" });
  }
});

const saveSupply = () => {
  if (!form.value.date) {
    console.error("La fecha es obligatoria");
    return;
  }
  const supply = new Supply({
    id: isEdit.value ? parseInt(route.params.id) : null,
    supplyName: form.value.supplyName,
    quantity: form.value.quantity,
    unit: form.value.unit,
    supplier: form.value.supplier,
    price: form.value.price,
    date: form.value.date,
  });
  if (isEdit.value) updateSupply(supply);
  else addSupply(supply);
  navigateBack();
};

const navigateBack = () => {
  router.push({ name: "inventory-supplies" });
};
</script>

<template>
  <div class="p-4">
    <h1>{{ isEdit ? t("supplies.edit") : t("supplies.new") }}</h1>
    <form @submit.prevent="saveSupply">
      <div class="field mb-3">
        <label for="supplyName">{{ t("supplies.supplyName") }}</label>
        <pv-input-text id="supplyName" v-model="form.supplyName" required class="w-full" />
      </div>
      <div class="field mb-3">
        <label for="quantity">{{ t("supplies.quantity") }}</label>
        <pv-input-number id="quantity" v-model="form.quantity" required class="w-full" />
      </div>
      <div class="field mb-3">
        <label for="unit">{{ t("supplies.unit") }}</label>
        <pv-input-text id="unit" v-model="form.unit" required class="w-full" />
      </div>
      <div class="field mb-3">
        <label for="supplier">{{ t("supplies.supplier") }}</label>
        <pv-input-text id="supplier" v-model="form.supplier" required class="w-full" />
      </div>
      <div class="field mb-3">
        <label for="price">{{ t("supplies.price") }}</label>
        <pv-input-number id="price" v-model="form.price" required class="w-full" />
      </div>
      <div class="field mb-3">
        <label for="date">{{ t("supplies.date") }}</label>
        <pv-date-picker id="date" v-model="form.date" date-format="yy-mm-dd" show-icon fluid class="w-full" required />
      </div>
      <pv-button type="submit" :label="t('supplies.save')" icon="pi pi-save" />
      <pv-button :label="t('supplies.cancel')" severity="secondary" class="ml-2" @click="navigateBack" />
    </form>
    <div v-if="errors.length" class="text-red-500 mt-3">
      {{ t("errors.occurred") }}: {{ errors.map((e) => e.message).join(", ") }}
    </div>
  </div>
</template>
