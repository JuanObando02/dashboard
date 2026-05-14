# 📊 HDPUV - CIO Strategic Dashboard

![Python](https://img.shields.io/badge/Python-3.8+-blue?style=for-the-badge&logo=python&logoColor=white)
![Streamlit](https://img.shields.io/badge/Streamlit-FF4B4B?style=for-the-badge&logo=Streamlit&logoColor=white)
![Plotly](https://img.shields.io/badge/Plotly-3F4F75?style=for-the-badge&logo=plotly&logoColor=white)

## 📝 Descripción
Este proyecto es un **Dashboard Estratégico de TI** desarrollado para el Hospital Departamental Psiquiátrico Universitario del Valle (HDPUV). Está diseñado para proporcionar al CIO una visión integral y de alto nivel sobre el desempeño del departamento de tecnología, alineando los indicadores técnicos con los objetivos institucionales.

La herramienta permite visualizar la evolución de indicadores clave (KPIs) desde el año 2024 hasta proyecciones para el 2029, facilitando la toma de decisiones basada en datos.

## 🚀 Características Principales

### 🎯 Perspectivas Estratégicas
El dashboard se organiza en cinco pestañas interactivas:
1.  **💰 Finanzas de TI**: Análisis del TCO (Total Cost of Ownership), ROI de proyectos tecnológicos y cumplimiento del presupuesto.
2.  **🛡️ Ciberseguridad**: Monitoreo de incidentes, métricas de respuesta (MTTD y MTTR) y el índice de postura de seguridad (Cyber Score).
3.  **⚙️ Desempeño Operativo**: Eficiencia del service desk, tasa de resolución en el primer contacto (FCR) y volumen de tickets.
4.  **🤝 Satisfacción Cliente**: Experiencia del usuario medida a través de CSAT, NPS y CES.
5.  **🌐 TI Unificado**: Salud de la infraestructura, disponibilidad de sistemas críticos y cumplimiento de parches.

### Estética 
- **Glassmorphism**: Tarjetas de métricas con efectos de transparencia y desenfoque.
- **Interactividad**: Gráficos dinámicos que responden al filtrado por rango de fechas.
- **Diseño Responsivo**: Adaptable a diferentes tamaños de pantalla y compatible con modo oscuro.

## 🛠️ Stack Tecnológico
- **Frontend/Backend**: [Streamlit](https://streamlit.io/)
- **Visualización**: [Plotly Express](https://plotly.com/python/plotly-express/) & [Plotly Graph Objects](https://plotly.com/python/graph-objects/)
- **Análisis de Datos**: [Pandas](https://pandas.pydata.org/) & [NumPy](https://numpy.org/)

## 📊 Estructura del Dataset
El proyecto utiliza el archivo `Dataset_BSC_HDPUV_Enriquecido.csv`, el cual contiene las siguientes dimensiones:

| Columna | Descripción |
| :--- | :--- |
| `Fecha` | Mes y año del registro (YYYY-MM-DD) |
| `Perspectiva` | Categoría estratégica (Finanzas, Procesos, Clientes, etc.) |
| `KPI` | Nombre del indicador de desempeño |
| `Valor` | Resultado obtenido o proyectado |
| `Meta` | Objetivo esperado para el periodo |
| `Unidad` | Unidad de medida (%, $, Horas, etc.) |

## 📦 Instalación y Ejecución

1.  Asegúrate de tener Python instalado.
2.  Instala las dependencias:
    ```bash
    pip install streamlit pandas numpy plotly
    ```
3.  Ejecuta la aplicación:
    ```bash
    streamlit run dashboard_cio.py
    ```

## 📂 Estructura de Archivos
- `dashboard_cio.py`: Script principal de la aplicación Streamlit.
- `Dataset_BSC_HDPUV_Enriquecido.csv`: Dataset con datos históricos y proyectados.
- `Scrip1.py`: Scripts auxiliares de procesamiento de datos.

---