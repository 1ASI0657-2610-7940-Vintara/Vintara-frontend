import { BaseApi } from "../../shared/infrastructure/base-api.js";
import { BaseEndpoint } from "../../shared/infrastructure/base-endpoint.js";

const orderEndpointPath = import.meta.env.VITE_ORDERS_ENDPOINT_PATH;

/**
 * Orders API class to interact with order endpoints.
 * @extends BaseApi
 */
export class OrdersApi extends BaseApi {
    #orderEndpoint;

    /**
     * Creates an instance of OrdersApi.
     * @constructor
     */
    constructor() {
        super();
        this.#orderEndpoint = new BaseEndpoint(this, orderEndpointPath);
    }

    // =============== ORDER METHODS ===============

    getOrders() {
        return this.#orderEndpoint.getAll();
    }

    getOrderById(id) {
        return this.#orderEndpoint.getById(id);
    }

    createOrder(resource) {
        return this.#orderEndpoint.create(resource);
    }

    updateOrder(resource) {
        return this.#orderEndpoint.update(resource.id, resource);
    }

    deleteOrder(id) {
        return this.#orderEndpoint.delete(id);
    }
}