export class Order {
    constructor({ id = null, productId = null, productName = '', supplier = '', quantity = 0, status = 'Pending', createdDate = null }) {
        this.id = id;
        this.productId = productId;
        this.productName = productName;
        this.supplier = supplier;
        this.quantity = quantity;
        this.status = status;
        this.createdDate = createdDate;
    }
}