export class AlertAssembler {
  static toEntityFromResource(resource) {
    if (!resource) return null
    return {
      id: resource.id,
      deviceId: resource.deviceId,
      sensorType: resource.sensorType,
      value: resource.value,
      unit: resource.unit,
      timestamp: resource.timestamp,
      status: resource.status,
      isAnomaly: !!resource.isAnomaly,
      acknowledged: !!resource.acknowledged
    }
  }

  static toEntitiesFromResponse(response) {
    const data = response.data
    const items = Array.isArray(data) ? data : (data?.items ?? [])
    return items.map(AlertAssembler.toEntityFromResource).filter(Boolean)
  }
}
