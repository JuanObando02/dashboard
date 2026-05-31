# 🎨 Parámetros de Diseño y Estilos del Sistema

Este documento define la guía de estilos, paleta de colores, tipografía y comportamientos de interfaz de usuario utilizados en el Dashboard de Gobierno de TI y Datos. El sistema está construido principalmente sobre **Tailwind CSS v4** con configuraciones personalizadas.

---

## 1. Tipografía
El sistema utiliza una fuente limpia y moderna, optimizada para la legibilidad de datos y paneles de control (dashboards).

* **Fuente Principal:** `Inter`, con fallback a `system-ui, sans-serif`.
* **Pesos utilizados (Weights):**
  * `300` (Light)
  * `400` (Regular)
  * `500` (Medium)
  * `600` (Semi-bold)
  * `700` (Bold)
* **Comportamiento adicional:** Se utiliza la utilidad `.tabular-nums` (`font-variant-numeric: tabular-nums;`) para asegurar que los números y métricas de los KPIs estén perfectamente alineados en tablas y contadores.

---

## 2. Paleta de Colores

El diseño emplea un esquema mixto: un "Dark Mode" para la estructura global (shell) y fondos de pantalla, combinado con elementos corporativos en azules profundos y un sistema de estado semafórico muy marcado.

### 2.1. Fondos Globales y Estructura (Dark Theme)
* **Fondo Principal (Body/Root):** `#0b1829` (Azul medianoche muy oscuro).
* **Fondo Secundario (Paneles/Selects):** `#111e35`.
* **Texto Principal Global:** `#f1f5f9` (Slate 100).
* **Bordes Globales:** `#1e293b` (Slate 800) y `#1e3a5f`.

### 2.2. Colores Corporativos (Header y Botones)
* **Header Gradient:** Gradiente lineal de izquierda a derecha `linear-gradient(to right, #0f2d52, #1e4d8c)`.
* **Botones Principales (Ej. Ver Detalle):** Fondo `#1e4d8c`, Hover `#163d70`, Texto Blanco.
* **Acentos (Activos/Seleccionados):** Azul Tailwind (`#60a5fa` / `blue-400` y `#3b82f6` / `blue-500`).

### 2.3. Sistema Semafórico (Estados y KPIs)
Utilizado de forma consistente para mostrar el estado de cumplimiento (Crítico, Precaución, Óptimo).

| Estado | Color Base | Código Hex | Clases Tailwind / Badges |
| :--- | :--- | :--- | :--- |
| **Óptimo / Normal** | Verde / Emerald | `#22c55e` | `bg-emerald-500`, Fondo Badge: `bg-emerald-100`, Texto: `text-emerald-800` |
| **Precaución / Moderado** | Amarillo | `#eab308` | `bg-yellow-400`, Fondo Badge: `bg-yellow-100`, Texto: `text-yellow-800` |
| **Crítico** | Rojo | `#ef4444` | `bg-red-500`, Fondo Badge: `bg-red-100`, Texto: `text-red-800` |

### 2.4. Colores por Perspectiva (Balanced Scorecard)
Para diferenciar visualmente las perspectivas de las métricas en las tarjetas (`KpiCard`):
* **Finanzas:** Esmeralda (`bg-emerald-100 text-emerald-700`)
* **Clientes:** Azul (`bg-blue-100 text-blue-700`)
* **Procesos Internos:** Violeta (`bg-violet-100 text-violet-700`)
* **Aprendizaje y Crecimiento:** Ámbar (`bg-amber-100 text-amber-700`)

### 2.5. Escala de Grises (Slate)
Se ha sobrescrito la escala de grises de Tailwind en v4 para asegurar consistencia:
* `--color-slate-800`: `#1e293b`
* `--color-slate-700`: `#334155`
* `--color-slate-600`: `#475569`
* `--color-slate-500`: `#64748b`
* `--color-slate-400`: `#94a3b8`
* `--color-slate-300`: `#cbd5e1`
* `--color-slate-200`: `#e2e8f0`
* `--color-slate-100`: `#f1f5f9`

---

## 3. Elementos de Interfaz (UI Components)

### 3.1. Navegación / Tabs (Pestañas)
* **Tab Activo:** Fondo semi-transparente `rgba(255,255,255,0.12)`, borde inferior brillante `2px solid #60a5fa` y una sombra interior/exterior para efecto de profundidad `inset 0 -1px 0 #60a5fa, 0 -2px 10px rgba(96,165,250,0.12)`. Texto color `#fff`.
* **Tab Inactivo:** Fondo `rgba(255,255,255,0.04)`, borde transparente, opacidad en el texto `rgba(255,255,255,0.45)`.
* **Border Radius:** `8px 8px 0 0` (Bordes redondeados solo en la parte superior).

### 3.2. Tarjetas (KpiCard)
A diferencia del contenedor global oscuro, las tarjetas internas (`KpiCard`) utilizan un diseño de modo claro (Light Mode) para resaltar los datos:
* **Fondo:** Blanco (`bg-white`).
* **Borde:** `border-slate-200` con esquinas muy redondeadas (`rounded-xl`).
* **Sombra:** Suave por defecto (`shadow-sm`), que aumenta al pasar el cursor (`hover:shadow-md`).
* **Franja superior (Top strip):** Una línea de color de `4px` (`h-1`) que indica el estado semafórico del KPI.

### 3.3. Elementos Vacíos o "En Desarrollo" (Coming Soon)
* Utilizan iconos grandes centralizados con fondos translúcidos que coinciden con su color. Ej: Icono azul con fondo `rgba(59,130,246,0.1)` y borde `rgba(59,130,246,0.2)`.

---

## 4. Scrollbars y Animaciones Globales

### 4.1. Barras de Desplazamiento (Scrollbars)
Se implementa un estilo de scrollbar customizado (Webkit y Firefox) delgado y oscuro para no romper el diseño del dashboard:
* **Ancho:** `4px` (muy fino).
* **Track (Fondo):** Transparente.
* **Thumb (Barra arrastrable):** `#1e293b` (Slate 800), cambiando a `#334155` en estado `hover`, con bordes totalmente redondeados (`border-radius: 9999px`).

### 4.2. Animaciones
* **Barra de Auto-reproducción (`autoplay-bar`):** Utiliza `@keyframes autoplay-fill` para expandir el ancho de `0%` a `100%`. Tiene un gradiente lineal de `90deg` de azul `#3b82f6` a índigo `#6366f1`.
* **Carga/Actualización (`RefreshCw`):** Animación de giro (`spin 0.8s linear infinite`) al actualizar los datos.

---

## Resumen del Patrón Arquitectónico de UI
El diseño sigue un patrón de **Contraste de Foco (Focus Contrast)**:
1. Un envoltorio principal oscuro e inmersivo (`#0b1829`) que reduce la fatiga visual.
2. Cabeceras con gradientes corporativos clásicos para mantener la identidad institucional.
3. Paneles de datos (como las tarjetas KPI) presentados como "widgets" en modo claro o cajas de alto contraste semafórico para dirigir la atención inmediata a lo importante (Alertas rojas o amarillas).