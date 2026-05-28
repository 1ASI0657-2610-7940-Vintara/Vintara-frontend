import { BaseApi } from "../../shared/infrastructure/base-api.js";
import { BaseEndpoint } from "../../shared/infrastructure/base-endpoint.js";

const purchaseEndpoint = import.meta.env.VITE_PURCHASE_ORDERS_ENDPOINT_PATH;

export class PurchaseOrdersApi extends BaseApi {
    #endpointPath;
    #orderEndpoint; // Añadimos referencia para usarlo internamente si se desea

    constructor() {
        super();
        this.#endpointPath = purchaseEndpoint;
        // BaseEndpoint ya tiene la lógica estándar (GET /, POST /, GET /{id}, etc.)
        this.#orderEndpoint = new BaseEndpoint(this, purchaseEndpoint);
    }

    async getAll() {
        // Antes: return this.http.get(`${this.#endpointPath}/get-all-orders`);
        // Ahora: Usamos el estándar REST
        return this.#orderEndpoint.getAll();
    }

    async create(resource) {
        // Antes: return this.http.post(`${this.#endpointPath}/create-order`, resource);
        // Ahora:
        return this.#orderEndpoint.create(resource);
    }

    getById(id) {
        // Antes: return this.http.get(`${this.#endpointPath}/get-order-by-id/${id}`);
        // Ahora:
        return this.#orderEndpoint.getById(id);
    }

    update(id, resource) {
        // Antes: return this.http.put(`${this.#endpointPath}/update-order-by-id/${id}`, resource);
        // Ahora:
        return this.#orderEndpoint.update(id, resource);
    }

    delete(id) {
        // Antes: return this.http.delete(`${this.#endpointPath}/delete-order-by-id/${id}`);
        // Ahora:
        return this.#orderEndpoint.delete(id);
    }
}
