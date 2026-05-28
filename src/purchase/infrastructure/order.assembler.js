import { Order } from "../domain/model/order.entity.js";

export class OrderAssembler {
    static toEntityFromResource(resource) {
        return {
            id: resource.id,
            productId: resource.productId,
            productName: resource.productName,
            supplier: resource.supplier,
            quantity: resource.quantity,
            status: resource.status,
            createdDate: resource.createdDate
        };
    }

    static toEntitiesFromResponse(response) {
        return response.data.map(r => this.toEntityFromResource(r));
    }
}