<script setup>
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useProfileStore } from '../../application/profile.store';
import ProfileForm from './profile-form.vue';

const { t } = useI18n();
const store = useProfileStore();
const showDialog = ref(false);

onMounted(() => {
  store.fetchProfiles();
});

const openNew = () => {
  showDialog.value = true;
};
</script>

<template>
  <div class="card">
    <pv-toast />

    <pv-toolbar class="mb-4">
      <template #start>
        <h2 class="m-0">{{ t('profiles.title') }}</h2>
      </template>
      <template #end>
        <pv-button :label="t('profiles.new')" icon="pi pi-plus" class="p-button-success" @click="openNew" />
      </template>
    </pv-toolbar>

    <pv-data-table
        :value="store.profiles"
        :loading="store.loading"
        responsiveLayout="scroll"
        :paginator="true"
        :rows="10"
        dataKey="id"
    >
      <template #empty>{{ t('profiles.empty') }}</template>

      <pv-column field="id" :header="t('profiles.columns.id')" sortable style="width: 5rem"></pv-column>

      <pv-column field="fullName" :header="t('profiles.columns.entity')" sortable></pv-column>

      <pv-column field="taxIdentity" :header="t('profiles.columns.taxId')"></pv-column>

      <pv-column field="address" :header="t('profiles.columns.address')"></pv-column>

      <pv-column field="phone" :header="t('profiles.columns.phone')"></pv-column>
    </pv-data-table>

    <profile-form v-model:visible="showDialog" />
  </div>
</template>