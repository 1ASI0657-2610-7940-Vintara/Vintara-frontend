export class SupplyAssembler {
  static toEntityFromResource(resource) {
    if (!resource) return null
    return {
      id: resource.id,
      supplyName: resource.supplyName,
      quantity: resource.quantity,
      unit: resource.unit,
      supplier: resource.supplier,
      price: resource.price,
      date: resource.date
    }
  }

  static toEntitiesFromResponse(response) {
    const data = response.data
    const items = Array.isArray(data) ? data : (data?.items ?? [])
    return items.map(SupplyAssembler.toEntityFromResource).filter(Boolean)
  }
}
