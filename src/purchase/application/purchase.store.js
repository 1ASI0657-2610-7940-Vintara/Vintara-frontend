import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { PurchaseOrdersApi } from "../infrastructure/purchase-orders-api.js";
import { OrderAssembler } from "../infrastructure/order.assembler.js";

const api = new PurchaseOrdersApi();

export const usePurchaseStore = defineStore("purchase", () => {
    const orders = ref([]);
    const errors = ref([]);
    const ordersLoaded = ref(false);

    const fetchOrders = () => {
        api.getAll()
            .then((response) => {
                orders.value = OrderAssembler.toEntitiesFromResponse(response);
                ordersLoaded.value = true;
            })
            .catch((error) => errors.value.push(error));
    };

    const addOrder = (order) => {
        api.create(order)
            .then((response) => {
                orders.value.push(OrderAssembler.toEntityFromResource(response.data));
            })
            .catch((error) => errors.value.push(error));
    };

    const updateOrder = (order) => {
        api.update(order.id, order)
            .then((response) => {
                const updated = OrderAssembler.toEntityFromResource(response.data);
                const index = orders.value.findIndex(o => o.id === updated.id);
                if (index !== -1) orders.value[index] = updated;
            })
            .catch((error) => errors.value.push(error));
    };

    const deleteOrder = (id) => {
        api.delete(id)
            .then(() => {
                const index = orders.value.findIndex(o => o.id === id);
                if (index !== -1) orders.value.splice(index, 1);
            })
            .catch((error) => errors.value.push(error));
    };

    const getOrderById = (id) => orders.value.find(o => o.id === parseInt(id));

    return {
        orders,
        ordersLoaded,
        errors,
        fetchOrders,
        addOrder,
        updateOrder,
        deleteOrder,
        getOrderById
    };
});

export default usePurchaseStore;