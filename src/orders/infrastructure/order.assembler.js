import { Order } from "../domain/model/order.entity.js";

/**
 * Assembler class to convert order resources and responses into Order entities.
 * @class
 */
export class OrderAssembler {
    /**
     * Convert a single order resource into an Order entity.
     * @param {Object} resource - The order resource object.
     * @returns {Order} - The converted Order entity.
     */
    static toEntityFromResource(resource) {
        // El resource de la API simulada ahora coincide con la entidad
        return new Order({ ...resource });
    }

    /**
     * Convert a response containing multiple order resources into an array of Order entities.
     * @param {Object} response - The response object containing order resources.
     * @returns {Order[]} - An array of converted Order entities.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}: ${response.statusText}`);
            return [];
        }
        let resources = Array.isArray(response.data) ? response.data : response.data['orders'];
        return resources.map(resource => this.toEntityFromResource(resource));
    }
}