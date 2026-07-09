# Instrucciones para Antigravity — Refactor a arquitectura Feature-Based (DDD)

## Contexto

El proyecto Vintara (Vue 3 + Tailwind) tiene actualmente una estructura plana:

```
src/
├── views/        → todo mezclado en una carpeta plana
├── store/        → stores que mezclan estado + llamadas HTTP
├── layouts/
├── plugins/
└── router/
```

El objetivo es migrarla a la arquitectura **Feature-Based + DDD** que tenía el frontend
anterior, **sin cambiar el stack** (se mantiene Vue 3, Pinia y Tailwind — NO se vuelve a
PrimeVue). Solo se reorganiza la estructura de carpetas y se separan responsabilidades.

## Estructura objetivo

Los bounded contexts deben coincidir con los microservicios del backend
(Vintara-backend), para mantener el mismo vocabulario entre ambos lados:

- `analytics`   → AnalyticsService
- `auth`        → AuthService (WinesoftPlatform.AuthService) — **antes de crear la
  carpeta, buscar en el proyecto actual cómo se llama hoy el contexto de login/
  autenticación (puede estar como `identity`, `auth`, `login`, etc. dentro de
  `views/` o `store/`) y renombrarlo a `auth` para que coincida con el backend**
- `inventory`   → InventoryService
- `iot`         → IoTSimulatorService (el frontend sí tiene vistas/estado propios
  para esto — sensores/dispositivos — así que también debe migrarse a esta
  estructura)
- `profiles`    → ProfilesService
- `shared`      → Shared

Nota: `GatewayService` es infraestructura pura del backend (enrutamiento entre
microservicios) y normalmente no tiene un contexto equivalente en el frontend — no
crear una carpeta para esto salvo que exista lógica específica que lo amerite.

Para cada uno de estos bounded contexts existentes (identificar cuáles hay
realmente en `views/` y `store/` actuales, y si aparece alguno adicional que no
esté en esta lista, preguntar antes de asumir a qué contexto pertenece), crear:

```
src/
├── inventory/
│   ├── application/
│   │   └── inventory.store.js      → Pinia store: SOLO estado y acciones que
│   │                                  orquestan, sin lógica de Axios/HTTP directa
│   ├── infrastructure/
│   │   ├── inventory-api.js        → todas las llamadas Axios de este contexto
│   │   └── supply.assembler.js     → transforma JSON crudo de la API en
│   │                                  entidades de dominio tipadas
│   └── presentation/
│       ├── views/
│       │   ├── supply-list.vue
│       │   └── supply-form.vue
│       └── inventory.routes.js     → sub-rutas de este contexto
├── analytics/            → misma estructura (application/infrastructure/presentation)
├── auth/                 → misma estructura
├── iot/                  → misma estructura
├── profiles/             → misma estructura
└── shared/               → componentes, composables y servicios comunes a
                            varios contextos (ej. cliente Axios base, utils,
                            componentes UI genéricos)
```

## Pasos a ejecutar (en orden)

### 1. Auditoría inicial
- Listar todos los archivos actuales en `src/views/` y `src/store/`.
- Localizar específicamente el contexto de autenticación/login (puede llamarse
  `identity`, `auth`, `login`, `session`, etc. en el código actual — no se sabe con
  certeza el nombre actual) y confirmar qué archivos le pertenecen. Este contexto se
  renombrará a `auth` para coincidir con `AuthService` del backend.
- Agrupar el resto de archivos por bounded context según su dominio: `analytics`,
  `auth`, `inventory`, `iot`, `profiles`. Si algún archivo no encaja claramente en
  ninguno, dejarlo pendiente de decisión y preguntarme antes de moverlo.
- No tocar `router/`, `layouts/` ni `plugins/` todavía; eso se ajusta al final.

### 2. Crear el esqueleto de carpetas
Por cada bounded context identificado, crear las carpetas:
`application/`, `infrastructure/`, `presentation/views/`.

### 3. Extraer las llamadas HTTP de los stores
Para cada store actual en `src/store/`:
- Identificar todas las llamadas `axios.get/post/put/delete` (o `fetch`) dentro del store.
- Moverlas a un archivo nuevo `infrastructure/<contexto>-api.js`, exportando funciones
  puras, por ejemplo:
  ```js
  // infrastructure/inventory-api.js
  import apiClient from '@/shared/infrastructure/api-client'

  export const InventoryApi = {
    getSupplies: () => apiClient.get('/supplies'),
    createSupply: (payload) => apiClient.post('/supplies', payload),
    // ...
  }
  ```
- El store (`application/<contexto>.store.js`) debe quedar SOLO con estado, getters
  y acciones que llaman a las funciones de `infrastructure/`, sin conocer Axios
  directamente.

### 4. Crear los Assemblers
- Para cada entidad relevante (Supply, Purchase, Profile, etc.), crear un archivo
  `infrastructure/<entidad>.assembler.js` con un método estático que transforme la
  respuesta cruda del backend en un objeto de dominio, por ejemplo:
  ```js
  // infrastructure/supply.assembler.js
  export class SupplyAssembler {
    static toEntityFromResource(resource) {
      return {
        id: resource.id,
        name: resource.name,
        stock: resource.stock,
        // mapear/normalizar campos según haga falta
      }
    }
    static toEntitiesFromResponse(response) {
      return response.data.map(SupplyAssembler.toEntityFromResource)
    }
  }
  ```
- Usar el assembler dentro de la acción del store, nunca directamente en las vistas:
  ```js
  // application/inventory.store.js
  async fetchSupplies() {
    const response = await InventoryApi.getSupplies()
    this.supplies = SupplyAssembler.toEntitiesFromResponse(response)
  }
  ```
- Mantener el mismo vocabulario que usa el backend en su capa `Transform/Assembler`,
  para conservar la consistencia mencionada en el análisis previo.

### 5. Mover las vistas
- Mover cada `.vue` de `src/views/` a `presentation/views/` dentro de su contexto
  correspondiente.
- Actualizar los imports internos de esas vistas (ahora deben importar el store desde
  `../../application/<contexto>.store.js`, no desde una ruta plana).

### 6. Separar las rutas por contexto
- Crear `<contexto>/presentation/<contexto>.routes.js` exportando solo las rutas de
  ese contexto.
- En `src/router/index.js`, importar y combinar esos archivos de rutas (con
  `...inventoryRoutes`, etc.) en vez de tener todas las rutas declaradas en un único
  archivo plano.

### 7. Shared
- Mover a `src/shared/` cualquier componente, composable o servicio (por ejemplo el
  cliente Axios base) que sea usado por más de un contexto.
- El cliente Axios base debería vivir en `src/shared/infrastructure/api-client.js` y
  ser importado por los `*-api.js` de cada contexto.

### 8. Verificación final
- Ejecutar el proyecto (`npm run dev`) y comprobar que no queden imports rotos.
- Revisar que ningún archivo dentro de `presentation/views/` importe Axios
  directamente — toda llamada HTTP debe pasar por `infrastructure/`.
- Revisar que ningún store use `response.data` crudo sin pasar por un assembler.
- Confirmar que las rutas siguen funcionando igual que antes del refactor.

## Restricciones importantes

- **NO** cambiar Tailwind por PrimeVue ni tocar el sistema de estilos.
- **NO** cambiar la lógica de negocio ni el comportamiento visible de la app — es un
  refactor estructural, no funcional.
- **NO** eliminar funcionalidad existente; si algo no encaja claramente en la nueva
  estructura, preguntar antes de decidir dónde va.
- Ir contexto por contexto (empezar por uno solo, por ejemplo `inventory`, verificar
  que compila y funciona, y recién después seguir con el resto) en vez de mover todo
  de una sola vez.

## Nota sobre i18n (opcional, fuera del alcance de este refactor)

El frontend anterior usaba `vue-i18n` y el actual no. Esto es una decisión aparte —
no está incluido en este refactor de arquitectura. Si se quiere reincorporar,
conviene hacerlo como una tarea independiente después de terminar la reorganización
de carpetas.