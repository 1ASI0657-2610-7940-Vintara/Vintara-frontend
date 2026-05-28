import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { OrdersApi } from "../infrastructure/orders-api.js";
import { OrderAssembler } from "../infrastructure/order.assembler.js";

const ordersApi = new OrdersApi();

/**
 * Pinia store for managing orders state.
 */
export const useOrdersStore = defineStore("orders", () => {
    // State
    const orders = ref([]);
    const errors = ref([]);
    const ordersLoaded = ref(false);

    // Properties
    const ordersCount = computed(() =>
        ordersLoaded.value ? orders.value.length : 0
    );

    // Actions
    function fetchOrders() {
        ordersApi
            .getOrders()
            .then((response) => {
                orders.value = OrderAssembler.toEntitiesFromResponse(response);
                ordersLoaded.value = true;
            })
            .catch((error) => {
                errors.value.push(error);
            });
    }

    function getOrderById(id) {
        let idNum = parseInt(id);
        return orders.value.find((o) => o.id === idNum);
    }

    function addOrder(order) {
        ordersApi
            .createOrder(order)
            .then((response) => {
                const resource = response.data;
                const newOrder = OrderAssembler.toEntityFromResource(resource);
                orders.value.push(newOrder);
            })
            .catch((error) => {
                errors.value.push(error);
            });
    }

    function updateOrder(order) {
        ordersApi
            .updateOrder(order)
            .then((response) => {
                const resource = response.data;
                const updatedOrder = OrderAssembler.toEntityFromResource(resource);
                const index = orders.value.findIndex(
                    (o) => o.id === updatedOrder.id
                );
                if (index !== -1) orders.value[index] = updatedOrder;
            })
            .catch((error) => {
                errors.value.push(error);
            });
    }

    function deleteOrder(orderId) {
        ordersApi
            .deleteOrder(orderId)
            .then(() => {
                const index = orders.value.findIndex((o) => o.id === orderId);
                if (index !== -1) orders.value.splice(index, 1);
            })
            .catch((error) => {
                errors.value.push(error);
            });
    }

    return {
        // State
        orders,
        errors,
        ordersLoaded,
        // Properties
        ordersCount,
        // Actions
        fetchOrders,
        getOrderById,
        addOrder,
        updateOrder,
        deleteOrder,
    };
});

export default useOrdersStore;