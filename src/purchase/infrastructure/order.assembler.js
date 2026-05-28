import { Order } from "../domain/model/order.entity.js";

export class OrderAssembler {
    static toEntityFromResource(resource) {
        return new Order({
            id: resource.id,
            productId: resource.productId,
            productName: resource.productName,
            supplier: resource.supplier,
            quantity: resource.quantity,
            status: resource.status,
            createdDate: resource.createdDate
        });
    }

    static toEntitiesFromResponse(response) {
        if (!response || response.status !== 200) {
            console.error(response ? `${response.status}: ${response.statusText}` : 'Empty response');
            return [];
        }
        const data = Array.isArray(response.data) ? response.data : response.data?.orders || [];
        return data.map(r => this.toEntityFromResource(r));
    }
}