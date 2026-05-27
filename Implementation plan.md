# Plan de Implementación: Dashboard de Gobierno TI – Hospital

El objetivo de esta implementación es adaptar la base de código actual para cumplir plenamente con los requerimientos del Dashboard de Gobierno TI (ISO 38500 & Balanced Scorecard), utilizando la estructura de datos real proporcionada en el archivo `Gobierno_TI_data.json`.

## User Review Required

> [!IMPORTANT]
> El proyecto ya cuenta con una base sólida de componentes (`ExecutiveTable`, `KpiDetailModal`, `IsoPrincipleCards`, etc.) orientados a este diseño. El plan propuesto aprovechará esta base y se enfocará en integrar la **Auditoría IA**, extender el **Filtrado Avanzado**, y añadir la vista del **Semáforo Global**. Revisa los componentes que se van a modificar para confirmar si estás de acuerdo con el enfoque.

## Open Questions

> [!TIP]
> 1. Para la vista del Semáforo Global (34 Críticos, 10 Moderados, 2 Normales), ¿prefieres que estos contadores se muestren en el `Header` superior de la aplicación o como tarjetas separadas (`Scorecards`) justo debajo de la barra de búsqueda?
> 2. Respecto a la Auditoría de IA, ¿deseas que el Plan de Acción se muestre como una lista con viñetas dentro del modal de detalle del KPI o en un formato de tabla/acordeón?

## Proposed Changes

### Contexto y Gestión del Estado (`DashboardContext`)

Se necesita extender el contexto para soportar los nuevos filtros (perspectiva, estado), además de extraer el resumen global y la auditoría.

#### [MODIFY] [DashboardContext.jsx](file:///c:/Users/juano/Documents/GitHub/dashboard/src/context/DashboardContext.jsx)
- Añadir estados para `perspectiveFilter` y `statusFilter`.
- Actualizar la lista `allKpis` para incluir explícitamente los campos `tendencia` y el objeto `auditoria`.
- Modificar `filteredKpis` para que aplique los filtros de `perspectiva` y `estado` (`semaforo`), en adición al de principio ISO y responsable.
- Calcular (o extraer de `resumen_global`) los conteos globales (Críticos, Moderados, Normales) y exportarlos en el valor del contexto.

---

### Componentes de Interfaz

Se modificarán los componentes visuales para exponer la nueva información (IA, tendencia) y permitir la interacción.

#### [MODIFY] [SmartSearch.jsx](file:///c:/Users/juano/Documents/GitHub/dashboard/src/components/SmartSearch.jsx) (o el componente de barra de filtros equivalente)
- Agregar controles tipo `<select>` o *dropdowns* para filtrar por:
  - **Perspectiva BSC** (Clientes, Procesos Internos, Aprendizaje, Finanzas)
  - **Estado** (Crítico, Moderado, Normal)
- Asegurar que la interfaz se vea premium (estilos oscuros, bordes tenues).

#### [MODIFY] [Header.jsx](file:///c:/Users/juano/Documents/GitHub/dashboard/src/components/Header.jsx) (o un nuevo componente de Resumen Global)
- Implementar la "Vista ejecutiva con semáforo global".
- Mostrar los *badges* con el total de KPIs Críticos (Rojo), Moderados (Amarillo) y Normales (Verde) en la parte superior, utilizando el objeto `resumen_global` del JSON.

#### [MODIFY] [KpiDetailModal.jsx](file:///c:/Users/juano/Documents/GitHub/dashboard/src/components/KpiDetailModal.jsx)
- **Tendencia:** Agregar un indicador visual (ej. una flecha hacia arriba/abajo y el texto "Mejorando" o "Deteriorando") en el área de cabecera o junto al valor actual.
- **Auditoría IA:** Crear una nueva sección dentro del modal que se renderice únicamente cuando el KPI sea Crítico o Moderado (y contenga el objeto `auditoria`).
  - Mostrar `hallazgo`, `impacto_operacional`, `causa_probable` con iconos adecuados.
  - Mostrar el `plan_accion` como una lista.
  - Mostrar `plazo_revision` y `responsable_seguimiento`.

---

## Verification Plan

### Manual Verification
- Cargar la aplicación localmente mediante `npm run dev`.
- Verificar que el semáforo global se muestre correctamente (Ej. 34 Rojos, 10 Amarillos, 2 Verdes).
- Seleccionar un KPI en rojo (Ej. ID 2 o 3) y verificar que en el modal de detalle aparezcan las recomendaciones generadas por la IA y la tendencia actual.
- Interactuar con los nuevos filtros (Responsable, Perspectiva, Estado) y constatar que la tabla y gráficas se actualizan correspondientemente.
