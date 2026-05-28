import {
    Analytics,
    Order,
    SupplyLevel,
    LowStockAlert,
    SupplyRotation,
    CostsSummary
} from "../domain/model/analytics.entity.js";

/**
 * Assembler class: Used to convert raw data coming from the API
 * into objects of our own classes Analytics, SupplyLevel, etc.
 * It's like a translator between the API and our code.
 * @class
 */

export class AnalyticsAssembler {
    static toOrdersFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}: ${response.statusText}`);
            return [];
        }
        const data = Array.isArray(response.data) ? response.data : [];
        return data.map(item => new Order({
            orderId: item.orderId,
            status: item.status,
            date: item.date,
            productId: item.productId,
            quantity: item.quantity,
            supplier: item.supplier || 'N/A'
        }));
    }

    static toSupplyLevelsFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}: ${response.statusText}`);
            return [];
        }
        const data = Array.isArray(response.data) ? response.data : [];
        return data.map(item => new SupplyLevel({
            name: item.name,
            currentStock: item.currentStock
        }));
    }

    static toLowStockAlertsFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}: ${response.statusText}`);
            return [];
        }
        const data = Array.isArray(response.data) ? response.data : [];
        return data.map(item => new LowStockAlert({
            productName: item.productName,
            currentStock: item.currentStock,
            threshold: item.threshold
        }));
    }

    static toSupplyRotationFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}: ${response.statusText}`);
            return [];
        }
        const data = Array.isArray(response.data) ? response.data : [];
        return data.map(item => new SupplyRotation({
            day: item.day,
            movements: item.movements
        }));
    }

    static toCostsSummaryFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}: ${response.statusText}`);
            return null;
        }
        const data = response.data;
        return new CostsSummary({
            totalCost: data.totalCost,
            startDate: data.startDate,
            endDate: data.endDate
        });
    }
}