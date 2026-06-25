## 4. Planificación del Sprint 3

### Sprint Goal
> Implementar el **IoT Mocking Engine** como microservicio independiente, integrar el **Alert Engine** basado en Observer Pattern dentro del InventoryService, y habilitar endpoints de Health Check en todos los servicios.

### Sprint Backlog

| ID | Tarea | Descripción | Responsable | Complejidad (SP) |
|:---|:---|:---|:---|:---|
| **S3-01** | Crear proyecto `IoTSimulatorService` | Nuevo microservicio .NET con `BackgroundService`. Agregar al `docker-compose.yml` en puerto 5006. | Joan Teves | 5 |
| **S3-02** | Implementar `IDeviceSimulator` + clases concretas | Interfaz base, `BaseDeviceSimulator`, y 4 simuladores (Temp, Humedad, Presión, Nivel) con modo realista 80/20. | Joan Teves | 8 |
| **S3-03** | Implementar `DeviceSimulatorFactory` | Factory Method para instanciar simuladores por tipo. | Joan Teves | 2 |
| **S3-04** | Implementar `SimulationEngine` | `BackgroundService` que genera lecturas periódicas y las envía por HTTP al InventoryService. | Joan Teves | 5 |
| **S3-05** | Crear endpoint `POST /api/v1/sensor-alerts` en InventoryService | Controlador `SensorAlertsController` que recibe telemetría JSON, persiste el evento y evalúa umbrales. | Joan Teves | 5 |
| **S3-06** | Implementar Alert Engine (Observer Pattern) | Servicio de dominio `AlertEngine` que escucha eventos de stock/sensor y genera alertas `CRITICAL`/`WARNING`/`NORMAL`. Persistir alertas en tabla `sensor_alerts`. | Antonio Durán | 8 |
| **S3-07** | Endpoint `GET /api/v1/sensor-alerts` | Listar alertas activas con filtro por estado y tipo de sensor. Incluir paginación. | Antonio Durán | 3 |
| **S3-08** | Endpoint `PATCH /api/v1/sensor-alerts/{id}/acknowledge` | Marcar alerta como leída/resuelta. | Antonio Durán | 2 |
| **S3-09** | Integrar Health Checks en todos los microservicios | Agregar `app.MapHealthChecks("/health")` con checks de DB en Auth, Inventory, Purchase, Profiles. | John Arévalo | 3 |
| **S3-10** | Configurar `IoTSimulatorService` en `docker-compose.yml` | Nuevo servicio con `depends_on: inventory-service`, variable `InventoryServiceUrl`. | John Arévalo | 2 |
| **S3-11** | Pruebas BDD (Gherkin) para flujo IoT | Escenarios: recepción de telemetría normal, generación de alerta crítica, listado de alertas. | John Arévalo | 5 |
| **S3-12** | Documentación Swagger para endpoints IoT | Anotar con `[SwaggerOperation]` los nuevos endpoints de sensor-alerts. | John Arévalo | 2 |
| **S3-13** | Integración Frontend: Dashboard IoT | Conectar Vue.js con `GET /api/v1/sensor-alerts` para mostrar alertas en tiempo real con polling. | Equipo | 5 |
| | | | **Total** | **55 SP** |

---

## 5. Instrucciones para el Equipo de Frontend

### 5.1 Contrato de Datos (API Contract)

#### `POST /api/v1/sensor-alerts` — Recepción de Telemetría (uso interno del simulador)

```json
// Request Body
{
  "deviceId": "TANK-FERM-001",
  "sensorType": "temperature",
  "value": 31.45,
  "unit": "°C",
  "timestamp": "2026-06-25T01:30:00Z",
  "status": "CRITICAL",
  "isAnomaly": true
}
```

#### `GET /api/v1/sensor-alerts` — Listar Alertas (consumido por Frontend)

```json
// Query Params: ?status=CRITICAL&sensorType=temperature&page=1&size=20

// Response 200 OK
{
  "items": [
    {
      "id": 1,
      "deviceId": "TANK-FERM-001",
      "sensorType": "temperature",
      "value": 31.45,
      "unit": "°C",
      "timestamp": "2026-06-25T01:30:00Z",
      "status": "CRITICAL",
      "isAnomaly": true,
      "acknowledged": false
    },
    {
      "id": 2,
      "deviceId": "WAREHOUSE-001",
      "sensorType": "humidity",
      "value": 52.10,
      "unit": "%HR",
      "timestamp": "2026-06-25T01:30:05Z",
      "status": "NORMAL",
      "isAnomaly": false,
      "acknowledged": false
    }
  ],
  "page": 1,
  "size": 20,
  "totalItems": 42,
  "totalPages": 3
}
```

#### `PATCH /api/v1/sensor-alerts/{id}/acknowledge` — Marcar como leída

```json
// Response 200 OK
{
  "id": 1,
  "acknowledged": true,
  "acknowledgedAt": "2026-06-25T02:00:00Z"
}
```

### 5.2 Manejo Visual: Datos Normales vs. Anomalías

| Campo `status` | Color UI | Icono | Acción en Dashboard |
|:---|:---|:---|:---|
| `NORMAL` | 🟢 Verde | ✅ Check | Mostrar en gráfico de líneas como punto estándar |
| `WARNING` | 🟡 Amarillo | ⚠️ Warning | Resaltar en gráfico + agregar badge en panel lateral |
| `CRITICAL` | 🔴 Rojo | 🚨 Alert | **Toast/Modal de alerta** + resaltar en rojo en gráfico + incrementar contador de alertas en el header |

#### Reglas de Visualización

1. **Gráfico en tiempo real (Line Chart)**: Usar polling cada 5-10 segundos a `GET /api/v1/sensor-alerts?size=50`. Los puntos con `isAnomaly: true` se renderizan con un marcador rojo y mayor tamaño.

2. **Panel de Alertas Activas**: Filtrar por `status=CRITICAL&acknowledged=false`. Mostrar en una lista ordenada por `timestamp` descendente. Cada item tiene botón "Reconocer" que invoca `PATCH /acknowledge`.

3. **Badge de Notificaciones**: Contador en el header con el total de alertas `CRITICAL` no reconocidas.

4. **Código de ejemplo (Vue.js Composition API)**:

```javascript
// composables/useSensorAlerts.js
import { ref, onMounted, onUnmounted } from 'vue';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_INVENTORY_API_URL;

export function useSensorAlerts(pollIntervalMs = 5000) {
  const alerts = ref([]);
  const criticalCount = ref(0);
  let timer = null;

  const fetchAlerts = async () => {
    const { data } = await axios.get(`${API_BASE}/api/v1/sensor-alerts`, {
      params: { size: 50, page: 1 }
    });
    alerts.value = data.items;
    criticalCount.value = data.items
      .filter(a => a.status === 'CRITICAL' && !a.acknowledged).length;
  };

  const acknowledgeAlert = async (id) => {
    await axios.patch(`${API_BASE}/api/v1/sensor-alerts/${id}/acknowledge`);
    await fetchAlerts();
  };

  onMounted(() => {
    fetchAlerts();
    timer = setInterval(fetchAlerts, pollIntervalMs);
  });

  onUnmounted(() => clearInterval(timer));

  return { alerts, criticalCount, fetchAlerts, acknowledgeAlert };
}
```

### 5.3 Instrucciones de Integración

1. **Variable de entorno**: Configurar `VITE_INVENTORY_API_URL` apuntando al host del InventoryService (ej: `http://localhost:5002` en desarrollo).

2. **Polling vs WebSockets**: Para Sprint 3, usar **polling HTTP** con intervalo de 5 segundos. WebSockets (SignalR) se reserva para Sprint 4 como mejora de rendimiento.

3. **Manejo de errores**: Si el endpoint no responde, mostrar un banner "Servicio IoT no disponible" y reintentar con backoff exponencial.

4. **Filtrado client-side**: Implementar filtros por `sensorType` y `status` en el componente de Dashboard. El backend ya soporta estos query params.

---

> [!IMPORTANT]
> El simulador IoT es un **microservicio independiente** que NO depende de hardware. Se despliega como un contenedor Docker más dentro del `docker-compose.yml`. El Frontend nunca se comunica directamente con el simulador; solo consume los endpoints de alertas expuestos por el **InventoryService**.
