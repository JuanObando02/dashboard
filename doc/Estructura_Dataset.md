# Estructura de Datos: Gobierno_TI_data.json

El archivo `Gobierno_TI_data.json` contiene un arreglo de objetos JSON, donde cada objeto representa un Indicador Clave de Rendimiento (KPI) relacionado con el gobierno de TI.

A continuación, se detalla la estructura y los tipos de datos de cada uno de los campos principales:

## Campos Principales

| Campo | Tipo de Dato | Descripción |
|---|---|---|
| `id_kpi` | `number` | Identificador único del KPI. |
| `kpi` | `string` | Nombre descriptivo del KPI. |
| `perspectiva` | `string` | Perspectiva del Balanced Scorecard (BSC). |
| `obj_bsc` | `string` | Código del objetivo del BSC. |
| `responsable` | `string` | Cargo del responsable del KPI. |
| `principio_iso` | `string` | Principio de la norma ISO/IEC 38500 asociado. |
| `unidad` | `string` | Unidad de medida (ej. "%", "Horas"). |
| `tipo` | `string` | Tipo de optimización (ej. "MAX" para maximizar, "MIN" para minimizar). |
| `frecuencia` | `string` | Frecuencia de medición (ej. "Mensual", "Semestral"). |
| `valor_actual` | `number` | Último valor medido del KPI. |
| `fecha_valor_actual` | `string` | Fecha de la última medición (formato YYYY-MM-DD). |
| `meta_2026` a `meta_2029` | `number` | Valores objetivo (metas) para los respectivos años. |
| `linea_base_2025` | `number` | Valor inicial de referencia en 2025. |
| `umbral_critico` | `number` | Valor límite que define un estado crítico. |
| `umbral_moderado`| `number` | Valor límite que define un estado moderado. |
| `estado` | `string` | Estado actual del KPI (ej. "Crítico"). |
| `estado_codigo` | `string` | Código de color del estado (ej. "ROJO"). |
| `cumplimiento_meta_pct`| `number` | Porcentaje de cumplimiento de la meta actual. |
| `tendencia` | `string` | Tendencia del KPI (ej. "Mejorando"). |
| `requiere_auditoria` | `boolean` | Indica si el KPI requiere auditoría. |
| `justificacion_iso` | `string` | Justificación técnica en base a la norma ISO. |
| `total_mediciones` | `number` | Cantidad total de mediciones registradas. |
| `fecha_auditoria` | `string` | Fecha en la que se generó la auditoría (timestamp). |

## Objetos Anidados

### `ultima_medicion` y Elementos de `mediciones` (Array)
Contiene los detalles de la medición más reciente y el histórico de mediciones.

| Subcampo | Tipo | Descripción |
|---|---|---|
| `fecha` | `string` | Fecha de la medición. |
| `valor` | `number` | Valor medido en dicha fecha. |
| `observaciones` | `string` | Notas adicionales (a menudo vacío). |
| `row_number` | `number` | Número de fila de origen. |
| `Procesado` | `string` | Estado de procesamiento. |

### `contexto`
Agrupa información estratégica y de origen del KPI.

| Subcampo | Tipo | Descripción |
|---|---|---|
| `objetivo_bsc` | `object` | Contiene el `id` y el `objetivo` (descripción). |
| `objetivos_estrategicos` | `array` | Lista de objetos con `id`, `nombre` y `ruta`. |
| `iniciativas` | `array` | Lista de proyectos relacionados (campos: `id`, `nombre`, `presupuesto`, `inicio`, `fin`, `obj_bsc`). |
| `fuente` | `object` | Fuente de la información (`id`, `descripcion`, `linea_base`). |

### `resumen_global`
Proporciona estadísticas globales del total de KPIs en el conjunto de datos.

| Subcampo | Tipo | Descripción |
|---|---|---|
| `total_kpis` | `number` | Total de KPIs. |
| `criticos` | `number` | Cantidad en estado crítico. |
| `moderados` | `number` | Cantidad en estado moderado. |
| `normales` | `number` | Cantidad en estado normal. |
| `sin_mediciones` | `number` | Cantidad sin datos de medición. |

### `auditoria`
Detalles de la evaluación automatizada sobre el KPI.

| Subcampo | Tipo | Descripción |
|---|---|---|
| `nivel_alerta` | `string` | Nivel de criticidad de la auditoría. |
| `hallazgo` | `string` | Descripción detallada del problema o incumplimiento encontrado. |
| `impacto_operacional` | `string` | Consecuencias en la operación derivadas del hallazgo. |
| `causa_probable` | `string` | Hipótesis sobre la raíz del problema. |
| `plan_accion` | `array` | Lista de pasos recomendados (`string`) para mitigar el problema. |
| `plazo_revision` | `string` | Tiempo recomendado para revisar la acción. |
| `responsable_seguimiento`| `string` | Cargo del responsable de ejecutar el plan de acción. |
