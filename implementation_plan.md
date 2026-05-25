# Nuevas Funcionalidades: Informe PDF, Análisis de Brecha, Buscador Inteligente

Agregar tres funcionalidades clave al dashboard ISO 38500 orientadas al CIO: generación de informe ejecutivo en PDF, análisis de brecha presupuestaria, y búsqueda inteligente por rol/KPI.

## Datos Disponibles

- **46 KPIs** → 43 en estado Rojo, 0 Amarillo, 3 Verde
- **16 Iniciativas** con presupuesto COP (entre $88M y $1.85B)
- **19 Roles únicos** (CIO, CISO, Jefe de Infraestructura TI, etc.)
- Cada KPI tiene campo `iniciativas` con IDs separados por coma (ej: `"I-03, I-15, I-16"`)
- Cada KPI tiene `rol_responsable` y `principio_iso`

---

## Proposed Changes

### 1. Botón de Descarga de Informe Ejecutivo (jsPDF)

#### Dependencia
- Instalar `jspdf` y `jspdf-autotable` para generar PDFs con tablas profesionales

#### [NEW] [ExecutiveReportButton.jsx](file:///c:/Users/juano/Documents/GitHub/dashboard/dashboard%20iso/iso-dashboard/src/components/ExecutiveReportButton.jsx)

Componente botón que al hacer clic genera un PDF con:
- **Encabezado**: Logo/nombre del hospital, fecha, principio ISO seleccionado
- **Resumen ejecutivo**: Total KPIs rojos/amarillos, cumplimiento promedio
- **Tabla**: KPI, Valor Actual, Meta 2029, Cumplimiento %, Semáforo, Responsable
- **Sección de inversión requerida**: Presupuesto total de iniciativas vinculadas
- Formato A4 horizontal, paleta oscura profesional

Se integrará en el [Header.jsx](file:///c:/Users/juano/Documents/GitHub/dashboard/dashboard%20iso/iso-dashboard/src/components/Header.jsx) junto a la fecha de actualización.

#### [MODIFY] [Header.jsx](file:///c:/Users/juano/Documents/GitHub/dashboard/dashboard%20iso/iso-dashboard/src/components/Header.jsx)
- Agregar el botón `ExecutiveReportButton` al header
- Pasar `filteredKpis`, `activePrinciple`, y `data` como props (o consumir del context)

---

### 2. Análisis de Brecha Presupuestaria

#### [NEW] [GapAnalysisBar.jsx](file:///c:/Users/juano/Documents/GitHub/dashboard/dashboard%20iso/iso-dashboard/src/components/GapAnalysisBar.jsx)

Barra visual que muestra para el KPI seleccionado (o para todos los rojos):
- **Presupuesto total requerido**: Suma de `Presupuesto (COP)` de las iniciativas vinculadas al KPI
- **Barra de progreso**: Conexión visual Adquisición → Rendimiento
- **Tooltip**: Desglose por iniciativa con nombre y monto
- **Indicador de impacto**: Cuántas iniciativas están vinculadas

Lógica:
1. Tomar el KPI seleccionado (o filtrado por principio)
2. Parsear campo `iniciativas` (ej: `"I-03, I-15, I-16"`)
3. Buscar cada ID en `data.iniciativas`
4. Sumar presupuestos → mostrar la brecha

Se ubicará debajo de la sección de métricas en [MainChartArea.jsx](file:///c:/Users/juano/Documents/GitHub/dashboard/dashboard%20iso/iso-dashboard/src/components/MainChartArea.jsx), visible cuando hay un KPI seleccionado en rojo.

#### [MODIFY] [MainChartArea.jsx](file:///c:/Users/juano/Documents/GitHub/dashboard/dashboard%20iso/iso-dashboard/src/components/MainChartArea.jsx)
- Importar y renderizar `GapAnalysisBar` debajo del gráfico cuando el KPI seleccionado está en rojo

---

### 3. Buscador Inteligente (KPI + Rol)

#### [NEW] [SmartSearch.jsx](file:///c:/Users/juano/Documents/GitHub/dashboard/dashboard%20iso/iso-dashboard/src/components/SmartSearch.jsx)

Componente de búsqueda que:
- Campo de texto con ícono de búsqueda, placeholder contextual
- **Búsqueda dual**: por nombre de KPI y por `rol_responsable`
- **Autocompletado**: Muestra sugerencias de roles mientras se escribe
- **Badges**: Muestra el rol activo como filtro removible
- Al escribir "CISO", filtra todos los KPIs donde `rol_responsable` contiene "CISO"
- Al escribir texto libre, busca en `kpi.kpi` (nombre del KPI)

#### [MODIFY] [DashboardContext.jsx](file:///c:/Users/juano/Documents/GitHub/dashboard/dashboard%20iso/iso-dashboard/src/context/DashboardContext.jsx)
- Agregar estado `searchQuery` y `roleFilter`
- Modificar `filteredKpis` para incluir filtrado por búsqueda y por rol
- Exponer `setSearchQuery`, `setRoleFilter`, `uniqueRoles` en el contexto

#### [MODIFY] [App.jsx](file:///c:/Users/juano/Documents/GitHub/dashboard/dashboard%20iso/iso-dashboard/src/App.jsx)
- Agregar `SmartSearch` debajo del header, antes de `IsoPrincipleCards`

---

## Verificación

### Automated Tests
- `npm run build` para verificar compilación sin errores
- Verificar que el PDF se genera correctamente con `jspdf`

### Manual Verification
- Abrir el dashboard, seleccionar un principio ISO, verificar que:
  1. El botón de PDF genera un documento con los KPIs rojos/amarillos
  2. La barra de análisis de brecha muestra el presupuesto correcto
  3. Escribir "CISO" en el buscador filtra los KPIs del CISO
  4. El buscador muestra sugerencias de roles
