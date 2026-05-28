import { StockMovement } from "../domain/model/stock-movement.entity.js";

/**
 * Assembler class to convert stock movement resources and responses into StockMovement entities.
 * @class
 *
 * @example
 * const resource = { id: 1, liquorName: "Whisky", quantity: 5, movementType: "OUT", date: "2025-10-03", reason: "Sale" };
 * const movementEntity = StockMovementAssembler.toEntityFromResource(resource);
 */
export class StockMovementAssembler {
    /**
     * Convert a single stock movement resource into a StockMovement entity.
     * @param {Object} resource - The stock movement resource object.
     * @returns {StockMovement} - The converted StockMovement entity.
     */
    static toEntityFromResource(resource) {
        return new StockMovement({
            ...resource,
            date: resource.date ? new Date(resource.date) : null
        });
    }

    /**
     * Convert a response containing multiple stock movement resources into an array of StockMovement entities.
     * @param {Object} response - The response object containing stock movement resources.
     * @returns {StockMovement[]} - An array of converted StockMovement entities.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}: ${response.statusText}`);
            return [];
        }
        let resources = Array.isArray(response.data) ? response.data : response.data['stockMovements'];
        return resources.map(resource => this.toEntityFromResource(resource));
    }
}
