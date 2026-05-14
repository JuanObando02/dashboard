# 📊 Dashboard Estratégico HDPUV — PETI 2026–2029

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)

## 📝 Descripción
Este es el **Dashboard Estratégico de TI** para el Hospital Departamental Psiquiátrico Universitario del Valle (HDPUV), diseñado para el seguimiento del Plan Estratégico de Tecnologías de la Información (PETI) 2026-2029. 

La herramienta proporciona una visualización de alto nivel (Balance Scorecard) para el CIO, permitiendo monitorear métricas clave en tiempo real a través de una interfaz moderna, oscura y altamente interactiva.

## 🚀 Características Principales

### 🎯 Perspectivas del Balanced Scorecard (BSC)
El dashboard visualiza indicadores en cuatro dimensiones críticas:
1.  **👥 Clientes**: Nivel de satisfacción, servicios digitales y trazabilidad clínica.
2.  **⚙️ Procesos Internos**: Gobernanza TI, interoperabilidad, arquitectura y seguridad.
3.  **🌱 Aprendizaje y Crecimiento**: Competencias digitales y cultura de apropiación.
4.  **💰 Finanzas**: Ejecución presupuestal PETI y reducción de costos operativos.

### ✨ Estética y UX
- **Premium Dark Theme**: Diseño optimizado para baja fatiga visual con estética de vanguardia.
- **Glassmorphism**: Componentes con efectos de transparencia y desenfoque.
- **Carga Dinámica**: Los datos se cargan de forma asíncrona desde un archivo JSON externo, desacoplando la lógica de la información.
- **Interactividad Total**: Filtrado por periodos, tooltips detallados y modales de análisis profundo para cada KPI.

## 🛠️ Stack Tecnológico
- **Core**: HTML5 semántico y CSS3 (Vanilla) con variables modernas.
- **Lógica**: JavaScript ES6+ (Fetch API para datos dinámicos).
- **Visualización**: [Chart.js](https://www.chartjs.org/) para gráficos dinámicos y responsivos.

## 📂 Estructura de Archivos
- `index.html`: Aplicación principal (Estructura, Estilos y Lógica).
- `data_BSC_HDPUV.json`: Dataset centralizado que alimenta el dashboard.
- `assets/`: (Opcional) Imágenes y recursos visuales.

## 📦 Ejecución Local

Debido a que el dashboard utiliza la Fetch API para cargar datos externos (`.json`), los navegadores bloquean la carga por políticas de seguridad (CORS) si se abre el archivo directamente desde el sistema de archivos (`file://`).

**Para ejecutarlo correctamente:**

1. Abre una terminal en la carpeta del proyecto.
2. Inicia un servidor web local (ejemplo con Python):
   ```bash
   python -m http.server 8080
   ```
3. Abre tu navegador en: [http://localhost:8080](http://localhost:8080)

---
Desarrollado para el fortalecimiento tecnológico del HDPUV.