export class Order {
    constructor({ id = null, supplyName, supplier, quantity, status, date }) {
        this.id = id;
        this.supplyName = supplyName;
        this.supplier = supplier;
        this.quantity = quantity;
        this.status = status;
        this.date = date;
    }
}