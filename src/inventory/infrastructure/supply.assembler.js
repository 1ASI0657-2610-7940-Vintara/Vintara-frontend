import { Supply } from "../domain/model/supply.entity.js";

/**
 * SupplyAssembler
 * Converts supply resources and responses into Supply domain entities.
 * @class
 *
 * @example
 * // Convert a single resource to an entity
 * const resource = {
 *   id: 1,
 *   supplyName: 'Whisky Jack Daniel's',
 *   quantity: 50,
 *   unit: 'bottles',
 *   supplier: 'Distribuidora Andina',
 *   date: '2025-10-05'
 * };
 * const entity = SupplyAssembler.toEntityFromResource(resource);
 *
 * // Convert a response containing multiple resources to entities
 * const response = {
 *   status: 200,
 *   data: [
 *     { id: 1, supplier: "Distribuidora X", supplyName: "Whisky Jack Daniels", quantity: 50, unit: "bottles", date: "2025-10-01" },
 *     { id: 2, supplier: "Proveedor Y", supplyName: "Vodka Absolut", quantity: 30, unit: "boxes", date: "2025-10-02" }
 *   ]
 * };
 * const entities = SupplyAssembler.toEntitiesFromResponse(response);
 */
export class SupplyAssembler {
    /**
     * Converts a single supply resource into a Supply entity.
     * Includes liquorName instead of productId for better readability in the UI.
     * @param {Object} resource - The supply resource object.
     * @returns {Supply} - The converted Supply entity.
     */
    static toEntityFromResource(resource) {
        return new Supply({
            id: resource.id,
            supplyName: resource.supplyName,
            quantity: resource.quantity ?? 0,
            unit: resource.unit ?? "",
            supplier: resource.supplier,
            price: resource.price ?? 0,
            date: resource.date ? new Date(resource.date) : null
        });
    }

    /**
     * Converts an API response containing multiple supply resources into Supply entities.
     * @param {Object} response - The response object containing supply data.
     * @returns {Supply[]} - Array of Supply entities.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}: ${response.statusText}`);
            return [];
        }

        const resources = Array.isArray(response.data)
            ? response.data
            : response.data?.supplies ?? [];

        return resources.map(resource => this.toEntityFromResource(resource));
    }
}
