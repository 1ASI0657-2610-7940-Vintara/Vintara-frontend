<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { subDays, startOfMonth, endOfMonth } from 'date-fns';

const { t } = useI18n();

const emit = defineEmits(['close', 'generate']);

const selectedDates = ref([new Date(new Date().setDate(new Date().getDate() - 30)), new Date()]);

const availableWidgets = ref([
  { label: t('analytics.ordersTitle'), value: 'PurchaseOrders', selected: true },
  { label: t('analytics.supplyLevelsTitle'), value: 'SupplyLevels', selected: true },
  { label: t('analytics.alertsTitle'), value: 'LowStockAlerts', selected: true },
  { label: t('analytics.dailyRotationTitle'), value: 'SupplyRotation', selected: true },
  { label: t('analytics.monthlyCostsTitle'), value: 'CostsSummary', selected: true }
]);

const selectedLanguage = ref('en');

const languageOptions = [
  { label: 'English', value: 'en' },
  { label: 'Español', value: 'es' }
];

const isValid = computed(() => {
  return selectedDates.value &&
      selectedDates.value.length === 2 &&
      selectedDates.value[0] &&
      selectedDates.value[1] &&
      availableWidgets.value.some(w => w.selected);
});

const toggleWidget = (widget) => {
  widget.selected = !widget.selected;
};

const selectAll = () => {
  availableWidgets.value.forEach(w => w.selected = true);
};

const deselectAll = () => {
  availableWidgets.value.forEach(w => w.selected = false);
};

const handleGenerate = () => {
  if (!isValid.value) return;

  const selectedWidgetValues = availableWidgets.value
      .filter(w => w.selected)
      .map(w => w.value);

  emit('generate', {
    startDate: selectedDates.value[0],
    endDate: selectedDates.value[1],
    widgets: selectedWidgetValues,
    language: selectedLanguage.value
  });
};

const handleClose = () => {
  emit('close');
};
</script>

<template>
  <pv-dialog :visible="true" modal :header="t('analytics.generateReport')" :style="{ width: '600px' }" @update:visible="handleClose">
    <div class="pdf-modal-content">
      <div class="field">
        <label for="dateRange" class="field-label">{{ t('analytics.reportPeriod') }}</label>
        <pv-date-picker
            id="dateRange"
            v-model="selectedDates"
            selectionMode="range"
            dateFormat="dd/mm/yy"
            showIcon
            class="w-full"
        />
      </div>

      <div class="field">
        <label class="field-label">{{ t('analytics.selectWidgets') }}</label>
        <div class="widget-actions mb-2">
          <pv-button :label="t('analytics.selectAll')" text size="small" @click="selectAll" />
          <pv-button :label="t('analytics.deselectAll')" text size="small" @click="deselectAll" />
        </div>
        <div class="widget-list">
          <div
              v-for="widget in availableWidgets"
              :key="widget.value"
              class="widget-item"
              :class="{ 'widget-selected': widget.selected }"
              @click="toggleWidget(widget)"
          >
            <pv-checkbox v-model="widget.selected" :binary="true" />
            <span class="widget-label">{{ widget.label }}</span>
          </div>
        </div>
      </div>

      <div class="field">
        <label for="language" class="field-label">{{ t('analytics.reportLanguage') }}</label>
        <pv-select
            id="language"
            v-model="selectedLanguage"
            :options="languageOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full"
        />
      </div>
    </div>

    <template #footer>
      <pv-button :label="t('analytics.cancel')" text severity="secondary" @click="handleClose" />
      <pv-button
          :label="t('analytics.generateReport')"
          icon="pi pi-file-pdf"
          :disabled="!isValid"
          @click="handleGenerate"
      />
    </template>
  </pv-dialog>
</template>

<style scoped>
.pdf-modal-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-label {
  font-weight: 600;
  font-size: 0.95rem;
  color: #333;
}

.widget-actions {
  display: flex;
  gap: 0.5rem;
}

.widget-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 250px;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 0.75rem;
  background: #f9f9f9;
}

.widget-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  background: #fff;
}

.widget-item:hover {
  background-color: #f0f0f0;
}

.widget-item.widget-selected {
  background-color: #e8f5e9;
  border: 1px solid #4caf50;
}

.widget-label {
  font-size: 0.95rem;
  color: #333;
}
</style>