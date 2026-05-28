import { BaseApi } from "../../shared/infrastructure/base-api.js";
import { BaseEndpoint } from "../../shared/infrastructure/base-endpoint.js";

const supplyEndpointPath = import.meta.env.VITE_SUPPLIES_ENDPOINT_PATH;
const stockMovementEndpointPath = import.meta.env.VITE_STOCK_MOVEMENTS_ENDPOINT_PATH;

/**
 * Inventory API class to interact with supply and stock movement endpoints.
 * Provides methods to perform CRUD operations on supplies and stock movements.
 * @extends BaseApi
 * @example
 * const api = new InventoryApi();
 * const supplies = await api.getSupplies();
 * const stock = await api.getStockMovements();
 */
export class InventoryApi extends BaseApi {
    #supplyEndpoint;
    #stockMovementEndpoint;

    /**
     * Creates an instance of InventoryApi.
     * Initializes the supply and stock movement endpoints.
     * @constructor
     */
    constructor() {
        super();
        this.#supplyEndpoint = new BaseEndpoint(this, supplyEndpointPath);
        this.#stockMovementEndpoint = new BaseEndpoint(this, stockMovementEndpointPath);
    }

    // =============== SUPPLY METHODS ===============

    getSupplies() {
        return this.#supplyEndpoint.getAll();
    }

    getSupplyById(id) {
        return this.#supplyEndpoint.getById(id);
    }

    createSupply(resource) {
        return this.#supplyEndpoint.create(resource);
    }

    updateSupply(resource) {
        return this.#supplyEndpoint.update(resource.id, resource);
    }

    deleteSupply(id) {
        return this.#supplyEndpoint.delete(id);
    }

    // =============== STOCK MOVEMENT METHODS ===============

    getStockMovements() {
        return this.#stockMovementEndpoint.getAll();
    }

    getStockMovementById(id) {
        return this.#stockMovementEndpoint.getById(id);
    }

    createStockMovement(resource) {
        return this.#stockMovementEndpoint.create(resource);
    }

    updateStockMovement(resource) {
        return this.#stockMovementEndpoint.update(resource.id, resource);
    }

    deleteStockMovement(id) {
        return this.#stockMovementEndpoint.delete(id);
    }
}