export class StockMovementAssembler {
  static toEntityFromResource(resource) {
    if (!resource) return null
    return {
      id: resource.id,
      supplyId: resource.supplyId,
      supplyName: resource.supplyName,
      quantity: resource.quantity,
      type: resource.type,
      reason: resource.reason,
      date: resource.date,
      ownerId: resource.ownerId
    }
  }

  static toEntitiesFromResponse(response) {
    const data = response.data
    const items = Array.isArray(data) ? data : (data?.items ?? [])
    return items.map(StockMovementAssembler.toEntityFromResource).filter(Boolean)
  }
}
