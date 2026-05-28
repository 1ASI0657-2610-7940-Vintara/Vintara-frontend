<script setup>
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import { computed, onMounted, ref } from "vue";
import useInventoryStore from "../../application/inventory.store.js";
import { StockMovement } from "../../domain/model/stock-movement.entity.js";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const store = useInventoryStore();

const {
  errors,
  addStockMovement,
  updateStockMovement,
  getStockMovementById,
} = store;

const form = ref({
  productId: "",
  quantity: 0,
  movementType: "IN",
  date: new Date().toISOString().split("T")[0],
});

const isEdit = computed(() => !!route.params.id);

onMounted(() => {
  if (isEdit.value) {
    const movement = getStockMovementById(route.params.id);
    if (movement) {
      form.value.productId = movement.productId;
      form.value.quantity = movement.quantity;
      form.value.movementType = movement.movementType;
      form.value.date = movement.date;
    } else {
      router.push({ name: "inventory-stock-movements" });
    }
  }
});

const saveMovement = () => {
  const movement = new StockMovement({
    id: isEdit.value ? route.params.id : null,
    productId: form.value.productId,
    quantity: form.value.quantity,
    movementType: form.value.movementType,
    date: form.value.date,
  });
  if (isEdit.value) updateStockMovement(movement);
  else addStockMovement(movement);
  navigateBack();
};

const navigateBack = () => {
  router.push({ name: "inventory-stock-movements" });
};
</script>

<template>
  <div class="p-4">
    <h1>
      {{ isEdit ? t("stockMovements.edit") : t("stockMovements.new") }}
    </h1>
    <form @submit.prevent="saveMovement">
      <div class="field mb-3">
        <label for="productId">{{ t("stockMovements.productId") }}</label>
        <pv-input-text id="productId" v-model="form.productId" required class="w-full" />
      </div>
      <div class="field mb-3">
        <label for="quantity">{{ t("stockMovements.quantity") }}</label>
        <pv-input-number id="quantity" v-model="form.quantity" required class="w-full" />
      </div>
      <div class="field mb-3">
        <label for="movementType">{{ t("stockMovements.type") }}</label>
        <pv-select
            id="movementType"
            v-model="form.movementType"
            :options="[
            { label: t('stockMovements.in'), value: 'IN' },
            { label: t('stockMovements.out'), value: 'OUT' }
          ]"
            option-label="label"
            option-value="value"
            class="w-full"
        />
      </div>
      <div class="field mb-3">
        <label for="date">{{ t("stockMovements.date") }}</label>
        <pv-calendar
            id="date"
            v-model="form.date"
            date-format="yy-mm-dd"
            class="w-full"
        />
      </div>
      <pv-button type="submit" :label="t('stockMovements.save')" icon="pi pi-save" />
      <pv-button
          :label="t('stockMovements.cancel')"
          severity="secondary"
          class="ml-2"
          @click="navigateBack"
      />
    </form>
    <div v-if="errors.length" class="text-red-500 mt-3">
      {{ t("errors.occurred") }}: {{ errors.map((e) => e.message).join(", ") }}
    </div>
  </div>
</template>
