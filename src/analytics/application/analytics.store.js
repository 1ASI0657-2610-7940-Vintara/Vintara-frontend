import { defineStore } from "pinia";
import { ref } from "vue";
import { AnalyticsApi } from "../infrastructure/analytics-api.js";
import { AnalyticsAssembler } from "../infrastructure/analytics.assembler.js";
import { Analytics } from "../domain/model/analytics.entity.js";
import { formatISO } from 'date-fns';

const analyticsApi = new AnalyticsApi();

/**
 * Pinia store for managing analytics state.
 */
export const useAnalyticsStore = defineStore("analytics", () => {
    // State
    const data = ref(new Analytics());
    const errors = ref([]);
    const dataLoaded = ref(false);

    // Actions
    async function fetchAnalyticsData(startDate = null, endDate = null) {
        dataLoaded.value = false;
        errors.value = [];

        const startStr = startDate ? formatISO(startDate, { representation: 'date' }) : null;
        const endStr = endDate ? formatISO(endDate, { representation: 'date' }) : null;

        try {
            const [
                levelsRes,
                alertsRes,
                rotationRes,
                costsRes
            ] = await Promise.all([
                analyticsApi.getSupplyLevels(),
                analyticsApi.getLowStockAlerts(),
                analyticsApi.getSupplyRotation(startStr, endStr),
                analyticsApi.getCostsSummary(startStr, endStr)
            ]);

            data.value = new Analytics({
                orders: data.value.orders,  // mantener las órdenes sin recargar
                supplyLevels: AnalyticsAssembler.toSupplyLevelsFromResponse(levelsRes),
                lowStockAlerts: AnalyticsAssembler.toLowStockAlertsFromResponse(alertsRes),
                supplyRotation: AnalyticsAssembler.toSupplyRotationFromResponse(rotationRes),
                costsSummary: AnalyticsAssembler.toCostsSummaryFromResponse(costsRes)
            });

            dataLoaded.value = true;
        } catch (error) {
            errors.value.push(error);
            dataLoaded.value = true;
        }
    }

    async function loadInitialData() {
        try {
            const [ordersRes] = await Promise.all([
                analyticsApi.getPurchaseOrders()
            ]);

            data.value.orders = AnalyticsAssembler.toOrdersFromResponse(ordersRes);
        } catch (error) {
            errors.value.push(error);
        }
    }


    async function generatePdfReport(startDate, endDate, widgets, language) {
        try {
            const startStr = formatISO(startDate, { representation: 'date' });
            const endStr = formatISO(endDate, { representation: 'date' });

            const response = await analyticsApi.generateReport(startStr, endStr, widgets, language);
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            link.download = `analytics-report-${startStr}_to_${endStr}.pdf`;
            link.click();
            window.URL.revokeObjectURL(url);
            return true;
        } catch (error) {
            errors.value.push(error);
            return false;
        }
    }

    return {
        data,
        errors,
        dataLoaded,
        fetchAnalyticsData,
        loadInitialData,
        generatePdfReport
    };
});