import { BaseApi } from "../../shared/infrastructure/base-api.js";
import { BaseEndpoint } from "../../shared/infrastructure/base-endpoint.js";

const analyticsEndpointPath = import.meta.env.VITE_ANALYTICS_ENDPOINT_PATH;

/**
 * Analytics API class to interact with the analytics endpoint.
 * @extends BaseApi
 */
export class AnalyticsApi extends BaseApi {
    #analyticsEndpointPath;

    constructor() {
        super();
        this.#analyticsEndpointPath = analyticsEndpointPath;
    }

    getPurchaseOrders() {
        return this.http.get(`${this.#analyticsEndpointPath}/last-week-purchase-orders`);
    }


    getSupplyLevels() {
        return this.http.get(`${this.#analyticsEndpointPath}/supply-levels`);
    }

    getLowStockAlerts() {
        return this.http.get(`${this.#analyticsEndpointPath}/low-stock-alerts`);
    }

    getSupplyRotation(startDate = null, endDate = null) {
        const params = {};
        if (startDate) params.StartDate = startDate;
        if (endDate) params.EndDate = endDate;
        return this.http.get(`${this.#analyticsEndpointPath}/supply-rotation-metrics`, { params });
    }

    getCostsSummary(startDate = null, endDate = null) {
        const params = {};
        if (startDate) params.StartDate = startDate;
        if (endDate) params.EndDate = endDate;
        return this.http.get(`${this.#analyticsEndpointPath}/inventory-kpis`, { params });
    }

    generateReport(startDate, endDate, widgets, language) {
        return this.http.post(`/analytics/reports`, {
            startDate,
            endDate,
            widgets,
            language
        }, {
            responseType: 'arraybuffer'
        });
    }
}
