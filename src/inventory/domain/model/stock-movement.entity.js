/**
 * StockMovement Entity
 * Represents a movement in stock (inflow or outflow) in the inventory domain.
 * @class
 * @property {Number|null} id - The unique identifier of the stock movement.
 * @property {Number} productId - The ID of the product involved.
 * @property {Number} quantity - The quantity moved.
 * @property {'IN'|'OUT'} type - The type of movement (IN for inflow, OUT for outflow).
 * @property {string} reason - The reason for the movement (sale, return, damage, etc).
 * @property {string} date - The movement date (ISO format).
 *
 * @example
 * const movement = new StockMovement({
 *   id: 1,
 *   productId: 10,
 *   quantity: 5,
 *   type: 'OUT',
 *   reason: 'Customer sale',
 *   date: '2025-10-05'
 * });
 * console.log(movement.type); // 'OUT'
 */
export class StockMovement {
    /**
     * Creates an instance of StockMovement.
     * @param {Object} param0
     * @param {Number|null} param0.id - The unique identifier of the stock movement.
     * @param {Number} param0.productId - The ID of the product involved.
     * @param {Number} param0.quantity - The quantity moved.
     * @param {'IN'|'OUT'} param0.type - The type of movement (IN or OUT).
     * @param {string} param0.reason - The reason for the movement.
     * @param {string} param0.date - The movement date (ISO format).
     */
    constructor({ id = null, productId, quantity, type, reason, date }) {
        this.id = id;
        this.productId = productId;
        this.quantity = quantity;
        this.type = type;
        this.reason = reason;
        this.date = date;
    }
}
