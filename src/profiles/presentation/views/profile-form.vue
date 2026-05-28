<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useProfileStore } from '../../application/profile.store';
import { useToast } from 'primevue/usetoast';

const props = defineProps({
  visible: Boolean
});
const emit = defineEmits(['update:visible']);

const { t } = useI18n();
const store = useProfileStore();
const toast = useToast();

const submitted = ref(false);

const form = ref({
  businessName: '',
  branch: '',
  legalId: '', // Match backend 'LegalId'
  phone: '',
  street: '',
  number: '',
  city: '',
  postalCode: '',
  country: ''
});

const close = () => {
  emit('update:visible', false);
  submitted.value = false;
};

const saveProfile = async () => {
  submitted.value = true;

  if (!form.value.businessName || !form.value.legalId || !form.value.street || !form.value.city || !form.value.phone) {
    return;
  }

  const success = await store.createProfile(form.value);

  if (success) {
    toast.add({
      severity: 'success',
      summary: t('profiles.toast.createdSummary'),
      detail: t('profiles.toast.createdDetail'),
      life: 3000
    });

    form.value = {
      businessName: '', branch: '', legalId: '', phone: '',
      street: '', number: '', city: '', postalCode: '', country: ''
    };
    close();
  } else {
    toast.add({
      severity: 'error',
      summary: t('profiles.toast.errorSummary'),
      detail: t('profiles.toast.errorDetail'),
      life: 3000
    });
  }
};
</script>

<template>
  <pv-dialog
      :visible="visible"
      @update:visible="close"
      :header="t('profiles.form.title')"
      :modal="true"
      class="p-fluid"
      :style="{ width: '600px' }"
  >
    <div class="field mt-3">
      <label for="businessName">{{ t('profiles.form.businessName') }} <span class="text-red-500">*</span></label>
      <pv-input-text id="businessName" v-model.trim="form.businessName" required autofocus :class="{'p-invalid': submitted && !form.businessName}" />
      <small class="p-error" v-if="submitted && !form.businessName">{{ t('profiles.form.validations.requiredName') }}</small>
    </div>

    <div class="formgrid grid">
      <div class="field col-6">
        <label for="branch">{{ t('profiles.form.branch') }}</label>
        <pv-input-text id="branch" v-model.trim="form.branch" :placeholder="t('profiles.form.branchPlaceholder')" />
      </div>
      <div class="field col-6">
        <label for="legalId">{{ t('profiles.form.taxId') }} <span class="text-red-500">*</span></label>
        <pv-input-text id="legalId" v-model.trim="form.legalId" required :class="{'p-invalid': submitted && !form.legalId}" />
        <small class="p-error" v-if="submitted && !form.legalId">{{ t('profiles.form.validations.requiredTaxId') }}</small>
      </div>
    </div>

    <pv-divider align="left" type="dashed"><b>{{ t('profiles.form.fiscalAddressTitle') }}</b></pv-divider>

    <div class="formgrid grid">
      <div class="field col-8">
        <label for="street">{{ t('profiles.form.street') }} <span class="text-red-500">*</span></label>
        <pv-input-text id="street" v-model.trim="form.street" required :class="{'p-invalid': submitted && !form.street}" />
        <small class="p-error" v-if="submitted && !form.street">{{ t('profiles.form.validations.requiredAddress') }}</small>
      </div>
      <div class="field col-4">
        <label for="number">{{ t('profiles.form.number') }}</label>
        <pv-input-text id="number" v-model.trim="form.number" />
      </div>
      <div class="field col-6">
        <label for="city">{{ t('profiles.form.city') }} <span class="text-red-500">*</span></label>
        <pv-input-text id="city" v-model.trim="form.city" required :class="{'p-invalid': submitted && !form.city}" />
      </div>
      <div class="field col-6">
        <label for="country">{{ t('profiles.form.country') }}</label>
        <pv-input-text id="country" v-model.trim="form.country" />
      </div>
      <div class="field col-12">
        <label for="postalCode">{{ t('profiles.form.postalCode') }}</label>
        <pv-input-text id="postalCode" v-model.trim="form.postalCode" />
      </div>
    </div>

    <div class="field mt-3">
      <label for="phone">{{ t('profiles.form.phone') }} <span class="text-red-500">*</span></label>
      <pv-input-text id="phone" v-model.trim="form.phone" required :class="{'p-invalid': submitted && !form.phone}" />
      <small class="p-error" v-if="submitted && !form.phone">{{ t('profiles.form.validations.requiredPhone') }}</small>
    </div>

    <template #footer>
      <pv-button :label="t('shared.cancel')" icon="pi pi-times" class="p-button-text" @click="close" />
      <pv-button :label="t('shared.save')" icon="pi pi-check" class="p-button-text" @click="saveProfile" :loading="store.loading" />
    </template>
  </pv-dialog>
</template>