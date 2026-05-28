/**
 * Supply Entity
 * Represents a supply batch of liquor products in the inventory domain.
 * @class
 * @property {Number|null} id - The unique identifier of the supply.
 * @property {Number} supplyName - The name of the supply.
 * @property {Number} quantity - The quantity of units supplied.
 * @property {string} unit - The unit of measurement.
 * @property {string} supplier - The supplier name.
 * @property {decimal} price - The price of the supply.
 * @property {Date} date - The supply date (ISO format).
 *
 * @example
 * const supply = new Supply({
 *   id: 1,
 *   supplyName: 'Whisky Jack Daniel's',
 *   quantity: 50,
 *   unit: 'bottles',
 *   supplier: 'Distribuidora Andina',
 *   price: 10.99,
 *   date: '2025-10-05'
 * });
 */
export class Supply {
    /**
     * Creates an instance of Supply.
     * @param {Object} param0
     * @param {Number|null} param0.id - The unique identifier of the supply.
     * @param {string} param0.supplyName - The name of the product supplied.
     * @param {Number} param0.quantity - The quantity supplied.
     * @param {string} param0.unit - The unit of measurement.
     * @param {string} param0.supplier - The supplier name.
     * @param {decimal} param0.price - The price of the supply.
     * @param {Date} param0.date - The supply date (ISO format).
     */
    constructor({ id = null, supplyName, quantity, unit, supplier, price, date }) {
        this.id = id;
        this.supplyName = supplyName;
        this.quantity = quantity;
        this.unit = unit;
        this.supplier = supplier;
        this.price = price;
        this.date = date;
    }
}
