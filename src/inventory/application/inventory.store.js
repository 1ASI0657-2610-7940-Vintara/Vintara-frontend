import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { InventoryApi } from "../infrastructure/inventory-api.js";
import { SupplyAssembler } from "../infrastructure/supply.assembler.js";
import { StockMovementAssembler } from "../infrastructure/stock-movement.assembler.js";

const inventoryApi = new InventoryApi();

/**
 * Pinia store for managing inventory state, including supplies and stock movements.
 * Provides state, getters, and actions for fetching, adding, updating, and deleting supplies and movements.
 *
 * @store
 * @example
 * import { useInventoryStore } from '@/inventory/application/inventory.store.js';
 * const inventoryStore = useInventoryStore();
 * inventoryStore.fetchSupplies();
 * console.log(inventoryStore.supplies);
 */
const useInventoryStore = defineStore("inventory", () => {
    // State
    const supplies = ref([]);
    const stockMovements = ref([]);
    const errors = ref([]);
    const suppliesLoaded = ref(false);
    const stockMovementsLoaded = ref(false);

    // Properties
    const suppliesCount = computed(() =>
        suppliesLoaded.value ? supplies.value.length : 0
    );

    const movementsCount = computed(() =>
        stockMovementsLoaded.value ? stockMovements.value.length : 0
    );

    // Actions
    function fetchSupplies() {
        inventoryApi
            .getSupplies()
            .then((response) => {
                supplies.value = SupplyAssembler.toEntitiesFromResponse(response);
                suppliesLoaded.value = true;
            })
            .catch((error) => {
                errors.value.push(error);
            });
    }

    function fetchStockMovements() {
        inventoryApi
            .getStockMovements()
            .then((response) => {
                stockMovements.value =
                    StockMovementAssembler.toEntitiesFromResponse(response);
                stockMovementsLoaded.value = true;
            })
            .catch((error) => {
                errors.value.push(error);
            });
    }

    function getSupplyById(id) {
        let idNum = parseInt(id);
        return supplies.value.find((s) => s.id === idNum);
    }

    function addSupply(supply) {
        inventoryApi
            .createSupply(supply)
            .then((response) => {
                const resource = response.data;
                const newSupply = SupplyAssembler.toEntityFromResource(resource);
                supplies.value.push(newSupply);
            })
            .catch((error) => {
                errors.value.push(error);
            });
    }

    function updateSupply(supply) {
        inventoryApi
            .updateSupply(supply)
            .then((response) => {
                const resource = response.data;
                const updatedSupply = SupplyAssembler.toEntityFromResource(resource);
                const index = supplies.value.findIndex(
                    (s) => s.id === updatedSupply.id
                );
                if (index !== -1) supplies.value[index] = updatedSupply;
            })
            .catch((error) => {
                errors.value.push(error);
            });
    }

    function deleteSupply(supplyId) {
        inventoryApi
            .deleteSupply(supplyId)
            .then(() => {
                const index = supplies.value.findIndex((s) => s.id === supplyId);
                if (index !== -1) supplies.value.splice(index, 1);
            })
            .catch((error) => {
                errors.value.push(error);
            });
    }

    function getStockMovementById(id) {
        let idNum = parseInt(id);
        return stockMovements.value.find((m) => m.id === idNum);
    }

    function addStockMovement(movement) {
        inventoryApi
            .createStockMovement(movement)
            .then((response) => {
                const resource = response.data;
                const newMovement =
                    StockMovementAssembler.toEntityFromResource(resource);
                stockMovements.value.push(newMovement);
            })
            .catch((error) => {
                errors.value.push(error);
            });
    }

    function updateStockMovement(movement) {
        inventoryApi
            .updateStockMovement(movement)
            .then((response) => {
                const resource = response.data;
                const updatedMovement =
                    StockMovementAssembler.toEntityFromResource(resource);
                const index = stockMovements.value.findIndex(
                    (m) => m.id === updatedMovement.id
                );
                if (index !== -1) stockMovements.value[index] = updatedMovement;
            })
            .catch((error) => {
                errors.value.push(error);
            });
    }

    function deleteStockMovement(movementId) {
        inventoryApi
            .deleteStockMovement(movementId)
            .then(() => {
                const index = stockMovements.value.findIndex((m) => m.id === movementId);
                if (index !== -1) stockMovements.value.splice(index, 1);
            })
            .catch((error) => {
                errors.value.push(error);
            });
    }

    return {
        // State
        supplies,
        stockMovements,
        errors,
        suppliesLoaded,
        stockMovementsLoaded,
        // Properties
        suppliesCount,
        movementsCount,
        // Actions
        fetchSupplies,
        fetchStockMovements,
        addSupply,
        updateSupply,
        deleteSupply,
        getSupplyById,
        addStockMovement,
        updateStockMovement,
        deleteStockMovement,
        getStockMovementById,
    };
});

export default useInventoryStore;
