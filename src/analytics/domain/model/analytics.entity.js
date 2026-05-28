/** Order Entity (Value Object for Analytics)
* @property {number} id
* @property {string} status
* @property {string} orderDate
* @property {number} productId
* @property {number} quantity
*/
export class Order {
    constructor({ orderId, status, date, productId, quantity, supplier }) {
        this.orderId = orderId;
        this.status = status;
        this.date = date;
        this.productId = productId;
        this.quantity = quantity;
        this.supplier = supplier;
    }
}

/**
 * SupplyLevel: Represents the stock level for one supply item.
 * Think of it like a small container holding info about one product's stock.
 * Used inside the main Analytics data.
 * @property {number} id - The unique ID number for the supply.
 * @property {string} name - The name of the supply.
 * @property {number} current - How much of this supply we currently have.
 * @property {number} minStock - The minimum amount we want to have before it's considered low.
 */
export class SupplyLevel {
    constructor({ name, currentStock }) {
        this.name = name;
        this.currentStock = currentStock;
    }
}

export class LowStockAlert {
    constructor({ productName, currentStock, threshold }) {
        this.productName = productName;
        this.currentStock = currentStock;
        this.threshold = threshold;
    }
}

/**
 * DailyRotation: Represents how many movements happened on a specific date.
 * Like a daily log entry for supply activity.
 * Used inside the main Analytics data.
 * @property {string} date - The date this activity happened.
 * @property {number} movements - How many total movements (in or out) occurred on this date.
 */
export class SupplyRotation {
    constructor({ day, movements }) {
        this.day = day;
        this.movements = movements;
    }
}

export class CostsSummary {
    constructor({ totalCost, startDate, endDate }) {
        this.totalCost = totalCost;
        this.startDate = startDate;
        this.endDate = endDate;
    }
}
/**
 * Analytics: The main structure holding all the data needed for the analytics page.
 * It combines summary info, supply levels, and daily activity.
 * This is the primary data object for this feature.
 */
export class Analytics {
    /**
     * @param {Object} param0 - The data object used to create the Analytics.
     * @param {Object} param0.summary - Quick summary numbers.
     * @param {number} param0.summary.monthlyCosts - Estimated costs for the month.
     * @param {SupplyLevel[]} param0.supplyLevels - A list of SupplyLevel objects.
     * @param {DailyRotation[]} param0.dailyRotation - A list of DailyRotation objects.
     * @param {Order[]} param0.orders
     */
    // This runs when we create the main Analytics object.
    // It sets default values if nothing is provided.
    constructor({costsSummary = null, supplyLevels = [], lowStockAlerts = [],
                    supplyRotation = [], orders = []} = {}) {
        this.costsSummary = costsSummary;
        this.supplyLevels = supplyLevels;
        this.lowStockAlerts = lowStockAlerts;
        this.supplyRotation = supplyRotation;
        this.orders = orders;
    }
}