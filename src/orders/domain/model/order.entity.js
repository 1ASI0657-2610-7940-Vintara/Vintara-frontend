/**
 * Order Entity
 * Represents an order made to a supplier.
 * @class
 * @property {Number|null} id - The unique identifier of the order.
 * @property {Number} productId - The ID of the product being ordered.
 * @property {string} supplier - The name of the supplier.
 * @property {Number} quantity - The quantity ordered.
 * @property {string} status - The current status of the order (e.g., 'pending', 'in-transit', 'delivered').
 *
 * @example
 * const order = new Order({
 * id: 1,
 * productId: 1,
 * supplier: 'Distribuidora X',
 * quantity: 200,
 * status: 'pending'
 * });
 */
export class Order {
    /**
     * Creates an instance of Order.
     * @param {Object} param0
     * @param {Number|null} param0.id
     * @param {Number} param0.productId
     * @param {string} param0.supplier
     * @param {Number} param0.quantity
     * @param {string} param0.status
     */
    constructor({ id = null, productId, supplier, quantity, status }) {
        this.id = id;
        this.productId = productId;
        this.supplier = supplier;
        this.quantity = quantity;
        this.status = status;
    }
}