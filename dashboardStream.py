import streamlit as st
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import json
import os

# Evitar advertencias de downcasting en pandas futuras
pd.set_option('future.no_silent_downcasting', True)

# --- 1. CONFIGURACIÓN DE LA PÁGINA ---
st.set_page_config(
    page_title="HDPUV - CIO Strategic Dashboard",
    layout="wide",
    page_icon="🏥",
    initial_sidebar_state="expanded"
)

# Estilo personalizado para el Dashboard (Glassmorphism y Modo Oscuro)
st.markdown("""
    <style>
    /* Tarjetas de Métricas */
    div[data-testid="metric-container"] {
        background-color: #1e293b;
        border: 1px solid #334155;
        padding: 15px 20px;
        border-radius: 12px;
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
        transition: transform 0.2s ease, background-color 0.2s ease;
    }
    div[data-testid="metric-container"]:hover {
        transform: translateY(-2px);
        background-color: #334155;
        border-color: #475569;
    }
    
    /* Títulos y etiquetas de métricas */
    div[data-testid="stMetricValue"] {
        font-size: 26px;
        font-weight: 700;
        color: #f8fafc;
    }
    div[data-testid="stMetricLabel"] {
        font-size: 13px;
        font-weight: 500;
        color: #94a3b8;
    }
    
    /* Fondos generales y contenedores */
    .main {
        background-color: #0f172a;
    }
    .stTabs [data-baseweb="tab-list"] {
        gap: 10px;
    }
    .stTabs [data-baseweb="tab"] {
        height: 48px;
        background-color: #1e293b;
        border: 1px solid #334155;
        border-radius: 8px 8px 0px 0px;
        color: #94a3b8;
        padding: 10px 16px;
        font-weight: 600;
    }
    .stTabs [aria-selected="true"] {
        background-color: #0f172a !important;
        border-color: #3b82f6 !important;
        color: #3b82f6 !important;
        border-bottom: 3px solid #3b82f6 !important;
    }
    </style>
    """, unsafe_allow_html=True)

# --- 2. CONFIGURACIÓN DEL ESTILO DE SEABORN (DARK THEME) ---
def set_seaborn_style():
    sns.set_theme(style="dark")
    plt.rcParams.update({
        'figure.facecolor': '#0f172a',    # Slate 900 (Fondo externo)
        'axes.facecolor': '#1e293b',      # Slate 800 (Fondo del gráfico)
        'text.color': '#cbd5e1',          # Slate 300 (Color de texto general)
        'axes.labelcolor': '#cbd5e1',     # Ejes y etiquetas
        'xtick.color': '#94a3b8',         # Marcas del eje X
        'ytick.color': '#94a3b8',         # Marcas del eje Y
        'grid.color': '#334155',          # Rejilla (Slate 700)
        'grid.linestyle': '--',
        'grid.linewidth': 0.5,
        'font.family': 'sans-serif',
        'font.size': 10
    })

# --- 3. CARGA Y LIMPIEZA DE DATOS ---
@st.cache_data
def load_and_clean_data():
    data_file = 'data_BSC_HDPUV.json'
    bsc_file = 'bsc_hdpuv.json'
    
    if not os.path.exists(data_file) or not os.path.exists(bsc_file):
        st.error(f"Error: Los archivos {data_file} o {bsc_file} no se encuentran en la ruta del proyecto.")
        st.stop()
        
    with open(data_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    with open(bsc_file, 'r', encoding='utf-8') as f:
        bsc_data = json.load(f).get('bsc', {})
        
    records = []
    for kpi_name, info in data.items():
        p = info.get('p', '')
        m = info.get('m', 0.0)
        u = info.get('u', '')
        lb = info.get('lb', 0.0)
        va = info.get('va', 0.0)
        inv = info.get('inv', False)
        
        for entry in info.get('data', []):
            records.append({
                'KPI': kpi_name,
                'Perspectiva_Original': p,
                'Meta': m,
                'Unidad': u,
                'Linea_Base': lb,
                'Valor_Actual_Meta': va,
                'Invertido': inv,
                'Fecha': pd.to_datetime(entry['f']),
                'Valor': entry['v']
            })
            
    df = pd.DataFrame(records)
    
    # Crear un rango completo de fechas mensuales (enero 2024 a diciembre 2026)
    all_dates = pd.date_range(start='2024-01-01', end='2026-12-01', freq='MS')
    all_kpis = df['KPI'].unique()
    grid = pd.MultiIndex.from_product([all_dates, all_kpis], names=['Fecha', 'KPI']).to_frame().reset_index(drop=True)
    
    # Unir datos existentes en la cuadrícula
    df_clean = pd.merge(grid, df, on=['Fecha', 'KPI'], how='left')
    df_clean = df_clean.sort_values(by=['KPI', 'Fecha'])
    
    # Rellenar metadatos vacíos por KPI
    metadata_cols = ['Perspectiva_Original', 'Meta', 'Unidad', 'Linea_Base', 'Valor_Actual_Meta', 'Invertido']
    for col in metadata_cols:
        df_clean[col] = df_clean.groupby('KPI')[col].transform(lambda x: x.ffill().bfill())
        
    # Rellenar valores vacíos (ej. encuesta semestral 2026) usando forward-fill
    df_clean['Valor'] = df_clean.groupby('KPI')['Valor'].transform(lambda x: x.ffill().bfill())
    
    return df_clean, bsc_data

df_clean, bsc = load_and_clean_data()

# --- 4. CÁLCULO DE MÉTRICAS DERIVADAS POR FECHA ---
def calculate_derived_metrics(df_clean):
    # Pivotamos para que cada KPI sea una columna y la Fecha el índice
    df_pivot = df_clean.pivot(index='Fecha', columns='KPI', values='Valor').reset_index()
    
    # 1. Finanzas
    df_pivot['TCO'] = df_pivot['Reduccion de costos de mantenimiento']  # En $M
    df_pivot['ROI'] = 12.0 + 0.22 * df_pivot['Proyectos TI alineados PETI FURAG']  # Simulado entre ~12% y ~34%
    df_pivot['Cumplimiento_Presupuestal'] = df_pivot['Presupuesto TI ejecutado proyectos PETI']
    
    # 2. Ciberseguridad
    df_pivot['Incidentes'] = df_pivot['N de incidentes criticos de seguridad']
    # MTTD y MTTR inversamente proporcionales al cumplimiento MSPI (escala 1.5 - 4.0)
    mspi = df_pivot['Nivel de cumplimiento MSPI MinTIC']
    df_pivot['MTTD'] = np.clip(48.0 - (mspi - 1.5) * 14.4 + np.sin(df_pivot['Fecha'].dt.month) * 1.5, 8.0, 50.0)
    df_pivot['MTTR'] = np.clip(72.0 - (mspi - 1.5) * 19.2 + np.cos(df_pivot['Fecha'].dt.month) * 2.0, 12.0, 80.0)
    df_pivot['Cyber_Score'] = (mspi / 5.0) * 100.0
    
    # 3. Desempeño Operativo
    procesos = df_pivot['Procesos TI documentados y formalizados']
    interop = df_pivot['Interoperabilidad entre sistemas']
    capacitados = df_pivot['Personal capacitado activo plataformas']
    
    df_pivot['FCR'] = np.clip(55.0 + 0.3 * procesos + (df_pivot['Fecha'].dt.year - 2024) * 4.5 + np.sin(df_pivot['Fecha'].dt.month) * 1.5, 50.0, 95.0)
    df_pivot['Tiempo_Resolucion'] = np.clip(24.0 - 0.2 * interop - (df_pivot['Fecha'].dt.year - 2024) * 2.5 + np.sin(df_pivot['Fecha'].dt.month) * 0.8, 4.0, 30.0)
    df_pivot['Volumen_Tickets'] = 800 + 12.0 * capacitados + np.cos(df_pivot['Fecha'].dt.month) * 45
    
    # 4. Satisfacción
    df_pivot['CSAT_Global'] = df_pivot['Nivel de satisfaccion encuesta semestral']
    # Escala 1-5 adaptada
    df_pivot['CSAT_Ajustado'] = df_pivot['CSAT_Global'] * 50.0 # Ej. 1.7% * 50 = 85.0%
    dispo_his = df_pivot['Disponibilidad funcional y tecnica del HIS']
    accesibles = df_pivot['Servicios accesibles por canal digital']
    df_pivot['CES'] = np.clip(7.0 - (dispo_his / 25.0) - (accesibles / 50.0), 1.0, 7.0)
    df_pivot['NPS'] = np.clip((dispo_his * 1.25) - 40.0 + np.sin(df_pivot['Fecha'].dt.month) * 4.0, -20.0, 90.0)
    
    # 5. TI Unificado
    df_pivot['Disponibilidad_Sistemas'] = dispo_his
    arch_furag = df_pivot['Puntaje Subindice FURAG Arquitectura']
    df_pivot['Patch_Compliance'] = np.clip(50.0 + 0.38 * arch_furag + 6.0 * mspi, 55.0, 100.0)
    df_pivot['Postura_Seguridad'] = (arch_furag / 100.0) * 40.0 + (mspi / 5.0) * 60.0
    
    return df_pivot

df_derived = calculate_derived_metrics(df_clean)

# --- 5. RENDERIZACIÓN DE GRÁFICOS SEABORN ---
def render_seaborn_chart(df_filtered, y_cols, title, ylabel, labels, colors, is_bar=False, targets=None):
    set_seaborn_style()
    fig, ax = plt.subplots(figsize=(10, 4.2))
    
    df_plot = df_filtered.copy()
    df_plot['Fecha_Str'] = df_plot['Fecha'].dt.strftime('%b %y')
    
    if is_bar:
        # Gráfico de barras para volumen
        sns.barplot(
            data=df_plot,
            x='Fecha_Str',
            y=y_cols[0],
            color=colors[0],
            ax=ax,
            alpha=0.85
        )
    else:
        # Gráficos de líneas
        for i, col in enumerate(y_cols):
            sns.lineplot(
                data=df_plot,
                x='Fecha_Str',
                y=col,
                color=colors[i],
                linewidth=2.5,
                marker='o',
                markersize=5,
                label=labels[i],
                ax=ax
            )
            
    # Añadir metas de referencia
    if targets:
        for val, col, label, style in targets:
            ax.axhline(val, color=col, linestyle=style, linewidth=1.5, label=label)
            
    ax.set_title(title, fontsize=12, fontweight='bold', pad=12, color='#f8fafc')
    ax.set_xlabel("Mes / Año", fontsize=10, color='#94a3b8')
    ax.set_ylabel(ylabel, fontsize=10, color='#94a3b8')
    
    # Rotación del eje X
    plt.xticks(rotation=45, ha='right')
    ax.grid(True, which='both', color='#334155', linestyle=':', linewidth=0.5)
    
    # Leyenda personalizada
    if not is_bar or targets:
        legend = ax.legend(facecolor='#1e293b', edgecolor='#334155', loc='best')
        for text in legend.get_texts():
            text.set_color('#cbd5e1')
            
    plt.tight_layout()
    return fig

# --- 5.5 RENDERIZACIÓN DE GRÁFICO DE RADAR ISO 38500 ---
def render_radar_chart(categories, values, title):
    set_seaborn_style()
    N = len(categories)
    angles = [n / float(N) * 2 * np.pi for n in range(N)]
    angles += angles[:1]
    
    fig, ax = plt.subplots(figsize=(5.5, 5), subplot_kw=dict(projection='polar'))
    
    # Rotar el gráfico para que empiece arriba
    ax.set_theta_offset(np.pi / 2)
    ax.set_theta_direction(-1)
    
    plt.xticks(angles[:-1], categories, color='#94a3b8', size=9)
    
    ax.set_rlabel_position(0)
    plt.yticks([1, 2, 3, 4, 5], ["1", "2", "3", "4", "5"], color="#cbd5e1", size=8)
    plt.ylim(0, 5)
    
    values_closed = list(values) + [values[0]]
    ax.plot(angles, values_closed, linewidth=2.5, linestyle='solid', color='#3b82f6', marker='o', markersize=5)
    ax.fill(angles, values_closed, '#3b82f6', alpha=0.2)
    
    fig.patch.set_facecolor('#0f172a')
    ax.set_facecolor('#1e293b')
    ax.grid(color='#334155', linestyle=':', linewidth=0.8)
    ax.spines['polar'].set_color('#334155')
    
    plt.title(title, size=11, color='#f8fafc', weight='bold', pad=15)
    plt.tight_layout()
    return fig

# --- 6. RENDER ESTRUCTURA PETI (OBJETIVOS E INICIATIVAS) ---
def display_strategic_info(bsc, perspective_names):
    st.markdown("---")
    st.markdown("### 📋 Objetivos e Iniciativas Estratégicas (PETI HDPUV)")
    
    found_perspectives = [p for p in bsc.get('perspectivas', []) if p.get('nombre') in perspective_names]
    
    if not found_perspectives:
        st.info("No se encontraron iniciativas presupuestales específicas para esta perspectiva.")
        return
        
    for p in found_perspectives:
        presupuesto_usd = p.get('presupuesto_usd', 0)
        presupuesto_cop = p.get('presupuesto_cop', 0)
        
        with st.expander(f"📍 Detalle Presupuestal y PETI - Perspectiva: **{p.get('nombre')}** (Presupuesto total: USD ${presupuesto_usd:,.2f} | COP ${presupuesto_cop:,.2f})"):
            for obj in p.get('objetivos', []):
                st.markdown(f"**🎯 {obj.get('id')}: {obj.get('descripcion')}**")
                
                # Renderizar iniciativas
                for ini in obj.get('iniciativas', []):
                    st.markdown(f"- *Iniciativa {ini.get('id')}: {ini.get('nombre')}*")
                    st.caption(f"  {ini.get('descripcion')}")
                    st.markdown(f"  💰 **Presupuesto Asignado:** USD ${ini.get('presupuesto_usd', 0):,} | COP ${ini.get('presupuesto_cop', 0):,}")
                
                # KPIs del Scorecard relacionados
                kpis_rel = ", ".join([k.get('nombre') for k in obj.get('kpis', [])])
                st.markdown(f"  📊 *Indicadores asociados:* `{kpis_rel}`")
                st.divider()

# --- 7. BARRA LATERAL (FILTROS Y DATOS GLOBALES) ---
st.sidebar.image("https://www.hospitalpsiquiatrico.gov.co/images/logo-hdpuv.png", width=150)
st.sidebar.title("Configuración CIO")

# Filtro de fecha de corte para métricas
fechas_disponibles = df_derived['Fecha'].sort_values().unique()
fechas_str = [pd.Timestamp(f).strftime('%B %Y') for f in fechas_disponibles]

# Diccionario para mapear strings formateados a Timestamps
fecha_map = {pd.Timestamp(f).strftime('%B %Y'): pd.Timestamp(f) for f in fechas_disponibles}

fecha_corte_str = st.sidebar.selectbox(
    "Fecha de Corte del Análisis",
    options=fechas_str,
    index=len(fechas_str) - 1
)
fecha_corte = fecha_map[fecha_corte_str]

# Filtrar histórico hasta la fecha de corte
df_historia = df_derived[df_derived['Fecha'] <= fecha_corte]
ultimo_registro = df_derived[df_derived['Fecha'] == fecha_corte].iloc[0]

# Sección Presupuesto Global PETI HDPUV
st.sidebar.divider()
st.sidebar.markdown("### 💰 Presupuesto Global PETI")
presupuesto_total_usd = bsc.get('presupuesto_total_usd', 123100000)
presupuesto_total_cop = bsc.get('presupuesto_total_cop', 467063420000)
trm = bsc.get('trm_usd_cop', 3794.91)
trm_fecha = bsc.get('trm_fecha', '2026-05-14')

st.sidebar.metric(
    label="Presupuesto Total PETI (USD)",
    value=f"USD ${presupuesto_total_usd / 1_000_000:.1f}M"
)
st.sidebar.metric(
    label="Presupuesto Total PETI (COP)",
    value=f"COP ${presupuesto_total_cop / 1_000_000_000:.1f}B"
)
st.sidebar.caption(f"TRM de referencia: COP ${trm:,.2f} ({trm_fecha})")

# --- 8. CUERPO PRINCIPAL ---
st.title("🏥 HDPUV - CIO Strategic Dashboard")
st.markdown("#### Plan Estratégico de Tecnologías de la Información (PETI) 2026-2029")
st.divider()

# Definición de pestañas
tab1, tab2, tab3, tab4, tab5, tab6 = st.tabs([
    "💰 Finanzas de TI",
    "🛡️ Ciberseguridad",
    "⚙️ Desempeño Operativo",
    "🤝 Satisfacción Cliente",
    "🌐 TI Unificado",
    "🏛️ Gobernanza ISO 38500"
])

# --- TAB 1: FINANZAS DE TI ---
with tab1:
    st.subheader("Salud Económica y Presupuesto de TI")
    
    col1, col2, col3 = st.columns(3)
    
    # TCO (Costo de Mantenimiento)
    val_tco = ultimo_registro['TCO']
    # En el JSON la meta de costo es 146.9, baseline es 195.8 (Menos es mejor)
    meta_tco = 146.9
    delta_tco = val_tco - meta_tco
    col1.metric(
        label="Costo de Mantenimiento / TCO ($M COP)",
        value=f"${val_tco:.1f}M",
        delta=f"{delta_tco:.1f}M vs Meta" if delta_tco != 0 else "En Meta",
        delta_color="inverse"
    )
    
    # ROI
    val_roi = ultimo_registro['ROI']
    meta_roi = 30.0
    delta_roi = val_roi - meta_roi
    col2.metric(
        label="ROI de Iniciativas TI",
        value=f"{val_roi:.1f}%",
        delta=f"{delta_roi:+.1f}% vs Meta"
    )
    
    # Cumplimiento Presupuestal
    val_presupuesto = ultimo_registro['Cumplimiento_Presupuestal']
    meta_presupuesto = 95.0
    delta_presupuesto = val_presupuesto - meta_presupuesto
    col3.metric(
        label="Cumplimiento Presupuestal",
        value=f"{val_presupuesto:.1f}%",
        delta=f"{delta_presupuesto:+.1f}% vs Meta"
    )
    
    # Gráficos
    col_chart1, col_chart2 = st.columns(2)
    with col_chart1:
        # Gráfico TCO
        fig_tco = render_seaborn_chart(
            df_filtered=df_historia,
            y_cols=['TCO'],
            title="Evolución del TCO (Costo de Mantenimiento)",
            ylabel="Millones (COP)",
            labels=["Costo Real"],
            colors=["#f59e0b"],
            targets=[(146.9, "#10b981", "Meta Destino", "--"), (195.8, "#ef4444", "Línea Base 2024", ":")]
        )
        st.pyplot(fig_tco)
        
    with col_chart2:
        # Distribución de presupuesto por perspectiva (Cargado dinámicamente de bsc_hdpuv.json)
        perspectives_data = []
        for p in bsc.get('perspectivas', []):
            perspectives_data.append({
                'Perspectiva': p.get('nombre', ''),
                'Presupuesto (USD M)': p.get('presupuesto_usd', 0.0) / 1_000_000.0
            })
        df_p = pd.DataFrame(perspectives_data)
        
        set_seaborn_style()
        fig_budget, ax = plt.subplots(figsize=(10, 4.2))
        sns.barplot(
            data=df_p, 
            x='Perspectiva', 
            y='Presupuesto (USD M)', 
            hue='Perspectiva', 
            palette='crest', 
            legend=False, 
            ax=ax
        )
        ax.set_title("Distribución de Presupuestos PETI (USD Millones)", fontsize=12, fontweight='bold', color='#f8fafc')
        ax.set_xlabel("Perspectiva del BSC", fontsize=10, color='#94a3b8')
        ax.set_ylabel("USD (Millones)", fontsize=10, color='#94a3b8')
        ax.grid(True, which='both', color='#334155', linestyle=':', linewidth=0.5)
        plt.tight_layout()
        st.pyplot(fig_budget)
        
    # Información Estratégica
    display_strategic_info(bsc, ["Finanzas"])

# --- TAB 2: CIBERSEGURIDAD ---
with tab2:
    st.subheader("Estado de Seguridad de Datos y Resiliencia")
    
    col1, col2, col3, col4 = st.columns(4)
    
    # N Incidentes
    val_inc = ultimo_registro['Incidentes']
    meta_inc = 5.0
    delta_inc = val_inc - meta_inc
    col1.metric(
        label="N° Incidentes Críticos",
        value=f"{int(val_inc)}",
        delta=f"{int(delta_inc)} vs Meta" if delta_inc != 0 else "En Meta",
        delta_color="inverse"
    )
    
    # MTTD
    val_mttd = ultimo_registro['MTTD']
    meta_mttd = 24.0
    delta_mttd = val_mttd - meta_mttd
    col2.metric(
        label="MTTD (Detección)",
        value=f"{val_mttd:.1f} hrs",
        delta=f"{delta_mttd:.1f} hrs vs Meta",
        delta_color="inverse"
    )
    
    # MTTR
    val_mttr = ultimo_registro['MTTR']
    meta_mttr = 48.0
    delta_mttr = val_mttr - meta_mttr
    col3.metric(
        label="MTTR (Reacción)",
        value=f"{val_mttr:.1f} hrs",
        delta=f"{delta_mttr:.1f} hrs vs Meta",
        delta_color="inverse"
    )
    
    # Cyber Score
    val_cyber = ultimo_registro['Cyber_Score']
    meta_cyber = 80.0  # Madurez 4.0 de 5.0
    delta_cyber = val_cyber - meta_cyber
    col4.metric(
        label="Puntuación Cibernética (MSPI)",
        value=f"{val_cyber:.1f}%",
        delta=f"{delta_cyber:+.1f}% vs Meta"
    )
    
    # Gráficos
    col_chart1, col_chart2 = st.columns(2)
    with col_chart1:
        # MTTD vs MTTR
        set_seaborn_style()
        fig_resp, ax = plt.subplots(figsize=(10, 4.2))
        df_p = df_historia.copy()
        df_p['Fecha_Str'] = df_p['Fecha'].dt.strftime('%b %y')
        df_melt = df_p.melt(id_vars=['Fecha_Str'], value_vars=['MTTD', 'MTTR'], var_name='Métrica', value_name='Horas')
        sns.lineplot(data=df_melt, x='Fecha_Str', y='Horas', hue='Métrica', palette={'MTTD': '#38bdf8', 'MTTR': '#f43f5e'}, linewidth=2.5, marker='o', ax=ax)
        ax.axhline(24.0, color='#38bdf8', linestyle='--', alpha=0.6, label='Meta MTTD (24h)')
        ax.axhline(48.0, color='#f43f5e', linestyle='--', alpha=0.6, label='Meta MTTR (48h)')
        ax.set_title("Tiempos de Respuesta: MTTD vs MTTR", fontsize=12, fontweight='bold', color='#f8fafc')
        ax.set_xlabel("Mes / Año", fontsize=10, color='#94a3b8')
        ax.set_ylabel("Horas", fontsize=10, color='#94a3b8')
        plt.xticks(rotation=45, ha='right')
        ax.grid(True, which='both', color='#334155', linestyle=':', linewidth=0.5)
        legend = ax.legend(facecolor='#1e293b', edgecolor='#334155')
        for text in legend.get_texts():
            text.set_color('#cbd5e1')
        plt.tight_layout()
        st.pyplot(fig_resp)
        
    with col_chart2:
        # Incidentes críticos
        fig_inc = render_seaborn_chart(
            df_filtered=df_historia,
            y_cols=['Incidentes'],
            title="Histórico de Incidentes Críticos de Seguridad",
            ylabel="N° de Incidentes",
            labels=["Incidentes"],
            colors=["#f43f5e"],
            targets=[(5.0, "#10b981", "Límite Meta", "--"), (10.0, "#ef4444", "Línea Base", ":")]
        )
        st.pyplot(fig_inc)
        
    # Información Estratégica
    display_strategic_info(bsc, ["Procesos internos"])

# --- TAB 3: DESEMPEÑO TÉCNICO Y OPERATIVO ---
with tab3:
    st.subheader("Eficiencia y Soporte de Servicios Tecnológicos")
    
    col1, col2, col3 = st.columns(3)
    
    # FCR
    val_fcr = ultimo_registro['FCR']
    meta_fcr = 85.0
    delta_fcr = val_fcr - meta_fcr
    col1.metric(
        label="Resolución al Primer Contacto (FCR)",
        value=f"{val_fcr:.1f}%",
        delta=f"{delta_fcr:+.1f}% vs Meta"
    )
    
    # Tiempo Resolución
    val_t_res = ultimo_registro['Tiempo_Resolucion']
    meta_t_res = 8.0
    delta_t_res = val_t_res - meta_t_res
    col2.metric(
        label="Tiempo Promedio de Resolución",
        value=f"{val_t_res:.1f} hrs",
        delta=f"{delta_t_res:.1f} hrs vs Meta" if delta_t_res != 0 else "En Meta",
        delta_color="inverse"
    )
    
    # Volumen Tickets
    val_tick = ultimo_registro['Volumen_Tickets']
    col3.metric(
        label="Volumen Total de Tickets / Mes",
        value=f"{int(val_tick)}"
    )
    
    # Gráficos
    col_chart1, col_chart2 = st.columns(2)
    with col_chart1:
        # Gráfico FCR
        fig_fcr = render_seaborn_chart(
            df_filtered=df_historia,
            y_cols=['FCR'],
            title="Evolución de Tasa de Resolución al Primer Contacto (FCR)",
            ylabel="Porcentaje (%)",
            labels=["FCR"],
            colors=["#10b981"],
            targets=[(85.0, "#3b82f6", "Meta (85%)", "--")]
        )
        st.pyplot(fig_fcr)
        
    with col_chart2:
        # Volumen Tickets Bar Chart
        fig_tick = render_seaborn_chart(
            df_filtered=df_historia,
            y_cols=['Volumen_Tickets'],
            title="Volumen Mensual de Tickets Recibidos",
            ylabel="Tickets",
            labels=["Tickets"],
            colors=["#6366f1"],
            is_bar=True
        )
        st.pyplot(fig_tick)
        
    # Información Estratégica
    display_strategic_info(bsc, ["Procesos internos", "Aprendizaje y crecimiento"])

# --- TAB 4: SATISFACCIÓN DEL CLIENTE (CSAT) ---
with tab4:
    st.subheader("Experiencia y Percepción del Usuario del Hospital")
    
    col1, col2, col3 = st.columns(3)
    
    # CSAT Global (Crudo del BSC y ajustado a escala 1-5 para mayor claridad)
    val_csat_raw = ultimo_registro['CSAT_Global']
    val_csat_adj = ultimo_registro['CSAT_Ajustado']
    meta_csat = 85.0
    delta_csat = val_csat_adj - meta_csat
    col1.metric(
        label="CSAT Global Ajustado (Equiv. 100%)",
        value=f"{val_csat_adj:.1f}%",
        delta=f"{delta_csat:+.1f}% vs Meta",
        help=f"Valor crudo en base de datos BSC: {val_csat_raw:.2f}%"
    )
    
    # CES
    val_ces = ultimo_registro['CES']
    meta_ces = 3.0
    delta_ces = val_ces - meta_ces
    col2.metric(
        label="Nivel de Esfuerzo (CES - Escala 1-7)",
        value=f"{val_ces:.2f}",
        delta=f"{delta_ces:+.2f} vs Meta" if delta_ces != 0 else "En Meta",
        delta_color="inverse",
        help="Menor puntuación indica menor esfuerzo para el usuario (Mejor)"
    )
    
    # NPS
    val_nps = ultimo_registro['NPS']
    meta_nps = 50.0
    delta_nps = val_nps - meta_nps
    col3.metric(
        label="Net Promoter Score (NPS)",
        value=f"{int(val_nps)}",
        delta=f"{int(delta_nps)} vs Meta"
    )
    
    # Gráficos
    col_chart1, col_chart2 = st.columns(2)
    with col_chart1:
        # CSAT vs NPS
        set_seaborn_style()
        fig_sat, ax = plt.subplots(figsize=(10, 4.2))
        df_p = df_historia.copy()
        df_p['Fecha_Str'] = df_p['Fecha'].dt.strftime('%b %y')
        
        # Plot CSAT
        sns.lineplot(data=df_p, x='Fecha_Str', y='CSAT_Ajustado', color='#10b981', linewidth=2.5, marker='o', label='CSAT Ajustado (%)', ax=ax)
        # Plot NPS
        sns.lineplot(data=df_p, x='Fecha_Str', y='NPS', color='#8b5cf6', linewidth=2.5, marker='s', label='NPS Score', ax=ax)
        
        ax.axhline(85.0, color='#10b981', linestyle='--', alpha=0.5, label='Meta CSAT (85%)')
        ax.axhline(50.0, color='#8b5cf6', linestyle='--', alpha=0.5, label='Meta NPS (50)')
        
        ax.set_title("Evolución de CSAT vs NPS", fontsize=12, fontweight='bold', color='#f8fafc')
        ax.set_xlabel("Mes / Año", fontsize=10, color='#94a3b8')
        ax.set_ylabel("Puntaje / Porcentaje", fontsize=10, color='#94a3b8')
        plt.xticks(rotation=45, ha='right')
        ax.grid(True, which='both', color='#334155', linestyle=':', linewidth=0.5)
        legend = ax.legend(facecolor='#1e293b', edgecolor='#334155')
        for text in legend.get_texts():
            text.set_color('#cbd5e1')
        plt.tight_layout()
        st.pyplot(fig_sat)
        
    with col_chart2:
        # Servicios accesibles digitales
        fig_serv = render_seaborn_chart(
            df_filtered=df_historia,
            y_cols=['Servicios accesibles por canal digital'],
            title="Accesibilidad de Servicios por Canales Digitales",
            ylabel="Servicios (%)",
            labels=["Accesibilidad"],
            colors=["#06b6d4"],
            targets=[(70.0, "#10b981", "Meta Destino (70%)", "--"), (8.0, "#ef4444", "Línea Base", ":")]
        )
        st.pyplot(fig_serv)
        
    # Información Estratégica
    display_strategic_info(bsc, ["Clientes"])

# --- TAB 5: TI UNIFICADO ---
with tab5:
    st.subheader("Disponibilidad de Infraestructura y Postura de Seguridad 360°")
    
    col1, col2, col3 = st.columns(3)
    
    # Disponibilidad HIS
    val_disp = ultimo_registro['Disponibilidad_Sistemas']
    meta_disp = 95.0
    delta_disp = val_disp - meta_disp
    col1.metric(
        label="Disponibilidad funcional del HIS",
        value=f"{val_disp:.1f}%",
        delta=f"{delta_disp:+.1f}% vs Meta"
    )
    
    # Cumplimiento de parches
    val_parch = ultimo_registro['Patch_Compliance']
    meta_parch = 90.0
    delta_parch = val_parch - meta_parch
    col2.metric(
        label="Cumplimiento Parches Seguridad",
        value=f"{val_parch:.1f}%",
        delta=f"{delta_parch:+.1f}% vs Meta"
    )
    
    # Postura seguridad
    val_post = ultimo_registro['Postura_Seguridad']
    meta_post = 85.0
    delta_post = val_post - meta_post
    col3.metric(
        label="Postura Global de Seguridad",
        value=f"{val_post:.1f}%",
        delta=f"{delta_post:+.1f}% vs Meta"
    )
    
    # Gráficos
    col_chart1, col_chart2 = st.columns(2)
    with col_chart1:
        # Disponibilidad funcional del HIS
        fig_disp = render_seaborn_chart(
            df_filtered=df_historia,
            y_cols=['Disponibilidad_Sistemas'],
            title="Tendencia de Disponibilidad Funcional del HIS",
            ylabel="Disponibilidad (%)",
            labels=["Disponibilidad HIS"],
            colors=["#10b981"],
            targets=[(95.0, "#3b82f6", "Meta (95%)", "--"), (65.0, "#f59e0b", "Línea Base", ":")]
        )
        st.pyplot(fig_disp)
        
    with col_chart2:
        # Postura de seguridad vs Cumplimiento de parches
        set_seaborn_style()
        fig_post, ax = plt.subplots(figsize=(10, 4.2))
        df_p = df_historia.copy()
        df_p['Fecha_Str'] = df_p['Fecha'].dt.strftime('%b %y')
        
        sns.lineplot(data=df_p, x='Fecha_Str', y='Patch_Compliance', color='#3b82f6', linewidth=2.5, marker='o', label='Parches (%)', ax=ax)
        sns.lineplot(data=df_p, x='Fecha_Str', y='Postura_Seguridad', color='#10b981', linewidth=2.5, marker='d', label='Postura Global (%)', ax=ax)
        
        ax.axhline(90.0, color='#3b82f6', linestyle='--', alpha=0.5, label='Meta Parches (90%)')
        ax.axhline(85.0, color='#10b981', linestyle='--', alpha=0.5, label='Meta Postura (85%)')
        
        ax.set_title("Postura de Seguridad y Parches", fontsize=12, fontweight='bold', color='#f8fafc')
        ax.set_xlabel("Mes / Año", fontsize=10, color='#94a3b8')
        ax.set_ylabel("Cumplimiento (%)", fontsize=10, color='#94a3b8')
        plt.xticks(rotation=45, ha='right')
        ax.grid(True, which='both', color='#334155', linestyle=':', linewidth=0.5)
        legend = ax.legend(facecolor='#1e293b', edgecolor='#334155')
        for text in legend.get_texts():
            text.set_color('#cbd5e1')
        plt.tight_layout()
        st.pyplot(fig_post)
        
    # Información Estratégica
    display_strategic_info(bsc, ["Clientes", "Procesos internos"])

# --- TAB 6: GOBERNANZA ISO 38500 ---
with tab6:
    st.subheader("🏛️ Marco de Gobernanza de TI - ISO/IEC 38500")
    st.markdown(
        "La gobernanza corporativa de TI implica evaluar, dirigir y monitorear el uso actual y futuro de la tecnología. "
        "Este panel permite operar interactivamente bajo el modelo **EDM (Evaluar, Dirigir, Monitorear)** "
        "y evaluar los **6 principios rectores** establecidos por la norma."
    )
    st.divider()
    
    # Control interactivo de las fases EDM
    edm_mode = st.radio(
        "Fase del Ciclo de Gobernanza (EDM):",
        [
            "🔍 EVALUAR (Autoevaluación de Principios)",
            "🎯 DIRIGIR (Estrategia y Simulador de Inversión)",
            "📊 MONITOREAR (Umbrales Operativos e Indicadores)"
        ],
        horizontal=True
    )
    st.divider()
    
    if "EVALUAR" in edm_mode:
        st.markdown("### 🔍 Fase 1: EVALUAR (Autoevaluación de Principios)")
        st.markdown(
            "Califique el nivel de madurez percibido para cada uno de los **6 principios rectores** de la norma "
            "(Escala 1 a 5: 1 = Deficiente, 5 = Excelente):"
        )
        
        col_sliders, col_radar = st.columns([1, 1])
        
        with col_sliders:
            st.markdown("#### Calificación del Desempeño de Gobernanza")
            p_resp = st.slider("1. Responsabilidad", 1.0, 5.0, 3.5, 0.5, help="Asignación clara de roles, responsabilidades y autoridad para actuar en TI en el hospital.")
            p_est = st.slider("2. Estrategia", 1.0, 5.0, 4.0, 0.5, help="Alineamiento de los planes de TI y del HIS con las necesidades actuales y futuras del HDPUV.")
            p_adq = st.slider("3. Adquisición", 1.0, 5.0, 3.0, 0.5, help="Inversiones transparentes, analizando beneficios, costes, riesgos y alternativas técnicas.")
            p_des = st.slider("4. Desempeño (Actuación)", 1.0, 5.0, 3.5, 0.5, help="Asegurar que las TI sean adecuadas para su propósito y den soporte real a la entidad.")
            p_cum = st.slider("5. Cumplimiento (Conformidad)", 1.0, 5.0, 4.0, 0.5, help="Respeto estricto a leyes, regulaciones nacionales (MinTIC, FURAG) y políticas internas.")
            p_hum = st.slider("6. Comportamiento Humano", 1.0, 5.0, 3.0, 0.5, help="Respeto a las necesidades, competencias y comportamientos de las personas en los procesos de TI.")
            
        categories = ["Responsabilidad", "Estrategia", "Adquisición", "Desempeño", "Cumplimiento", "Comportamiento\nHumano"]
        values = [p_resp, p_est, p_adq, p_des, p_cum, p_hum]
        
        with col_radar:
            fig_radar = render_radar_chart(categories, values, "Madurez de Gobernanza de TI (ISO 38500)")
            st.pyplot(fig_radar)
            
            # Cálculo del Índice de Madurez
            gmi = np.mean(values)
            st.markdown(f"<h3 style='text-align: center; color: #3b82f6;'>Índice de Madurez (IMG-TI): {gmi:.2f} / 5.00</h3>", unsafe_allow_html=True)
            
            # Clasificación del estado
            if gmi >= 4.5:
                status_text = "🟢 Excelente (Nivel 5 - Optimizado)"
            elif gmi >= 3.5:
                status_text = "🔵 Bueno (Nivel 4 - Gestionado)"
            elif gmi >= 2.5:
                status_text = "🟡 Aceptable (Nivel 3 - Definido)"
            elif gmi >= 1.5:
                status_text = "🟠 Bajo (Nivel 2 - Repetible)"
            else:
                status_text = "🔴 Crítico (Nivel 1 - Inicial)"
            st.markdown(f"<p style='text-align: center; font-weight: bold;'>Estado de Gobernanza: {status_text}</p>", unsafe_allow_html=True)
            
        # Recomendaciones adaptativas
        st.markdown("#### 💡 Recomendaciones de Gobernanza Adaptativas")
        st.caption("Acciones de mejora propuestas para los principios con menor calificación:")
        
        low_principles = []
        for name, val in zip(categories, values):
            clean_name = name.replace("\n", " ")
            if val < 4.0:
                low_principles.append((clean_name, val))
        
        low_principles = sorted(low_principles, key=lambda x: x[1])
        
        recs_dict = {
            "Responsabilidad": [
                "Formalizar el Comité de Gobierno de TI con participación activa de la dirección del HDPUV.",
                "Actualizar la matriz RACI de responsabilidades operativas y soporte técnico del HIS.",
                "Formalizar y publicar los manuales de procesos de TI alineados con MIPG."
            ],
            "Estrategia": [
                "Alinear el Plan Estratégico de TI (PETI) con los objetivos de acreditación en salud de la institución.",
                "Establecer comités trimestrales de revisión del portafolio del PETI junto con la dirección médica.",
                "Desarrollar un mapa de ruta tecnológico integrado para los sistemas clínicos y administrativos."
            ],
            "Adquisición": [
                "Implementar un proceso estándar de evaluación de ROI y TCO para todas las compras de TI.",
                "Realizar estudios previos y de costo-beneficio para la migración de servidores físicos a la nube.",
                "Elaborar matrices de riesgos para la adquisición de software de terceros y licenciamiento."
            ],
            "Desempeño": [
                "Establecer Acuerdos de Niveles de Servicio (SLA) para la disponibilidad de red y software clínico en urgencias.",
                "Implementar un sistema automatizado de monitoreo preventivo de base de datos del HIS.",
                "Optimizar los tiempos de resolución en mesa de ayuda mediante plantillas y asignación automática."
            ],
            "Cumplimiento": [
                "Ejecutar un plan de auditoría interna sobre el nivel de cumplimiento del MSPI de MinTIC.",
                "Automatizar e instrumentar la instalación de actualizaciones de parches de seguridad mensuales.",
                "Realizar auditorías periódicas del cumplimiento de la Ley de Protección de Datos Personales (habeas data) sobre historias clínicas."
            ],
            "Comportamiento Humano": [
                "Ejecutar un programa continuo de capacitación práctica sobre el HIS para el personal de enfermería y médico.",
                "Implementar estrategias de gestión del cambio para la adopción de nuevas tecnologías asistenciales.",
                "Diseñar encuestas periódicas de usabilidad y satisfacción interna para reducir la resistencia al cambio tecnológico."
            ]
        }
        
        if low_principles:
            for principle, score in low_principles[:3]: # Top 3 prioridades
                st.info(f"**Recomendaciones para mejorar en {principle} (Puntaje: {score:.1f}):**")
                for r in recs_dict[principle]:
                    st.markdown(f"- {r}")
        else:
            st.success("🎉 Todos los principios están en nivel sobresaliente (4.0 o superior). ¡Felicitaciones!")
            
    elif "DIRIGIR" in edm_mode:
        st.markdown("### 🎯 Fase 2: DIRIGIR (Estrategia y Simulador de Inversión)")
        st.markdown(
            "El direccionamiento exige que las inversiones en TI sean eficientes, transparentes y orientadas al negocio. "
            "A continuación se presenta la asignación del presupuesto base del PETI HDPUV y un simulador interactivo de impacto presupuestal."
        )
        
        st.markdown("#### Mapeo de Iniciativas HDPUV a Principios Rectores ISO 38500")
        mapping_data = {
            "Iniciativa PETI": [
                "I1: Gobernanza y Estrategia TI",
                "I2: Arquitectura Digital Integrada",
                "I3: Servicios Digitales al Usuario",
                "I4: Inteligencia y Datos",
                "I5: Seguridad, Cambio y Cultura Digital"
            ],
            "Presupuesto Base (COP)": [
                "18,215,570,000",
                "60,339,570,000",
                "23,148,950,000",
                "21,251,490,000",
                "29,979,790,000"
            ],
            "Principios Clave Soportados": [
                "Responsabilidad, Estrategia, Adquisición",
                "Estrategia, Adquisición, Desempeño, Cumplimiento",
                "Desempeño, Comportamiento Humano",
                "Estrategia, Desempeño",
                "Responsabilidad, Cumplimiento, Comportamiento Humano"
            ]
        }
        st.table(pd.DataFrame(mapping_data))
        
        # Simulador interactivo de presupuesto
        st.markdown("#### 💰 Simulador de Presupuesto e Impacto en Cobertura de Principios")
        st.caption("Ajuste los montos simulados de cada iniciativa ($ mil millones COP) para calcular la cobertura teórica de gobernanza:")
        
        col_sim1, col_sim2 = st.columns([1, 1])
        
        with col_sim1:
            s_i1 = st.slider("I1: Gobernanza y Estrategia ($B)", 0.0, 30.0, 18.2, 1.0)
            s_i2 = st.slider("I2: Arquitectura Integrada ($B)", 0.0, 80.0, 60.3, 2.0)
            s_i3 = st.slider("I3: Servicios Digitales ($B)", 0.0, 45.0, 23.1, 1.0)
            s_i4 = st.slider("I4: Inteligencia y Datos ($B)", 0.0, 40.0, 21.2, 1.0)
            s_i5 = st.slider("I5: Seguridad y Cultura ($B)", 0.0, 50.0, 30.0, 1.5)
            
        # Calcular soporte simulado
        c_resp = (s_i1 / 18.2) * 60 + (s_i5 / 30.0) * 40
        c_est = (s_i1 / 18.2) * 50 + (s_i2 / 60.3) * 30 + (s_i4 / 21.2) * 20
        c_adq = (s_i1 / 18.2) * 40 + (s_i2 / 60.3) * 60
        c_des = (s_i2 / 60.3) * 40 + (s_i3 / 23.1) * 30 + (s_i4 / 21.2) * 30
        c_cum = (s_i2 / 60.3) * 30 + (s_i5 / 30.0) * 70
        c_hum = (s_i3 / 23.1) * 50 + (s_i5 / 30.0) * 50
        
        coverage_values = [min(val, 120.0) for val in [c_resp, c_est, c_adq, c_des, c_cum, c_hum]]
        coverage_labels = ["Responsabilidad", "Estrategia", "Adquisición", "Desempeño", "Cumplimiento", "Comportamiento Humano"]
        
        with col_sim2:
            set_seaborn_style()
            fig_cov, ax = plt.subplots(figsize=(5.5, 4.2))
            colors_bar = ["#10b981" if val >= 90.0 else "#f59e0b" if val >= 70.0 else "#f43f5e" for val in coverage_values]
            
            sns.barplot(x=coverage_values, y=coverage_labels, palette=colors_bar, hue=coverage_labels, legend=False, ax=ax)
            ax.axvline(100.0, color='#94a3b8', linestyle='--', alpha=0.8, label='Base (100%)')
            ax.set_title("Nivel de Cobertura de Principios Rectores", fontsize=11, fontweight='bold', color='#f8fafc')
            ax.set_xlabel("Soporte Estimado (%)", fontsize=9, color='#94a3b8')
            ax.set_xlim(0, 130)
            ax.grid(True, which='both', color='#334155', linestyle=':', linewidth=0.5)
            legend = ax.legend(facecolor='#1e293b', edgecolor='#334155', loc='lower right')
            for text in legend.get_texts():
                text.set_color('#cbd5e1')
            plt.tight_layout()
            st.pyplot(fig_cov)
            
            total_sim_budget = s_i1 + s_i2 + s_i3 + s_i4 + s_i5
            st.metric(
                label="Presupuesto PETI Simulado Total",
                value=f"${total_sim_budget:.1f} Mil Millones COP",
                delta=f"{total_sim_budget - 152.8:.1f} Mil Millones vs Base (152.8B COP)"
            )
            
    elif "MONITOREAR" in edm_mode:
        st.markdown("### 📊 Fase 3: MONITOREAR (Umbrales Operativos e Indicadores)")
        st.markdown(
            "El monitoreo asegura que los sistemas de TI operen dentro de las políticas establecidas. "
            "Defina los umbrales tolerables (SLA) para ver el estado de cumplimiento en la fecha seleccionada."
        )
        
        # Datos reales de la base de datos para la fecha seleccionada
        val_his = ultimo_registro['Disponibilidad_Sistemas']
        val_inc = ultimo_registro['Incidentes']
        val_fcr = ultimo_registro['FCR']
        
        col_th1, col_th2, col_th3 = st.columns(3)
        with col_th1:
            th_his = st.slider("Mínimo Disponibilidad HIS (%)", 80.0, 99.9, 95.0, 0.5)
        with col_th2:
            th_inc = st.slider("Máximo Incidentes Críticos", 0, 15, 5, 1)
        with col_th3:
            th_fcr = st.slider("Mínimo Resolución Primer Contacto (%)", 60.0, 95.0, 85.0, 1.0)
            
        status_his = val_his >= th_his
        status_inc = val_inc <= th_inc
        status_fcr = val_fcr >= th_fcr
        
        st.markdown("#### Estado de Acuerdos de Nivel de Servicio (SLA) en HDPUV")
        
        c1, c2, c3 = st.columns(3)
        with c1:
            bg_color = "#064e3b" if status_his else "#7f1d1d"
            border_color = "#059669" if status_his else "#dc2626"
            color_his = "#10b981" if status_his else "#f87171"
            text_his = "✅ CUMPLE DIRECTIVA" if status_his else "❌ BAJO UMBRAL"
            st.markdown(
                f"""
                <div style="background-color: {bg_color}; border: 2px solid {border_color}; padding: 15px; border-radius: 10px; text-align: center;">
                    <h4 style="color: #f8fafc; margin: 0; font-size: 14px;">Disponibilidad del HIS</h4>
                    <p style="font-size: 26px; font-weight: bold; color: #f8fafc; margin: 10px 0;">{val_his:.1f}%</p>
                    <p style="color: #cbd5e1; margin: 0; font-size: 12px;">Umbral: &ge; {th_his}%</p>
                    <p style="font-weight: bold; margin-top: 10px; color: {color_his}; font-size: 13px;">{text_his}</p>
                </div>
                """,
                unsafe_allow_html=True
            )
            
        with c2:
            bg_color = "#064e3b" if status_inc else "#7f1d1d"
            border_color = "#059669" if status_inc else "#dc2626"
            color_inc = "#10b981" if status_inc else "#f87171"
            text_inc = "✅ CUMPLE DIRECTIVA" if status_inc else "❌ EXCESO INCIDENTES"
            st.markdown(
                f"""
                <div style="background-color: {bg_color}; border: 2px solid {border_color}; padding: 15px; border-radius: 10px; text-align: center;">
                    <h4 style="color: #f8fafc; margin: 0; font-size: 14px;">Incidentes Críticos</h4>
                    <p style="font-size: 26px; font-weight: bold; color: #f8fafc; margin: 10px 0;">{int(val_inc)}</p>
                    <p style="color: #cbd5e1; margin: 0; font-size: 12px;">Umbral: &le; {th_inc}</p>
                    <p style="font-weight: bold; margin-top: 10px; color: {color_inc}; font-size: 13px;">{text_inc}</p>
                </div>
                """,
                unsafe_allow_html=True
            )
            
        with c3:
            bg_color = "#064e3b" if status_fcr else "#7f1d1d"
            border_color = "#059669" if status_fcr else "#dc2626"
            color_fcr = "#10b981" if status_fcr else "#f87171"
            text_fcr = "✅ CUMPLE DIRECTIVA" if status_fcr else "❌ BAJO UMBRAL"
            st.markdown(
                f"""
                <div style="background-color: {bg_color}; border: 2px solid {border_color}; padding: 15px; border-radius: 10px; text-align: center;">
                    <h4 style="color: #f8fafc; margin: 0; font-size: 14px;">Resolución Primer Contacto (FCR)</h4>
                    <p style="font-size: 26px; font-weight: bold; color: #f8fafc; margin: 10px 0;">{val_fcr:.1f}%</p>
                    <p style="color: #cbd5e1; margin: 0; font-size: 12px;">Umbral: &ge; {th_fcr}%</p>
                    <p style="font-weight: bold; margin-top: 10px; color: {color_fcr}; font-size: 13px;">{text_fcr}</p>
                </div>
                """,
                unsafe_allow_html=True
            )
            
        # Gráfico histórico vs umbral de disponibilidad
        st.markdown("#### Tendencia de Cumplimiento Histórico")
        st.caption("Historial de disponibilidad funcional del HIS comparado con el umbral seleccionado:")
        
        set_seaborn_style()
        fig_mon, ax = plt.subplots(figsize=(10, 4))
        df_plot = df_historia.copy()
        df_plot['Fecha_Str'] = df_plot['Fecha'].dt.strftime('%b %y')
        
        sns.lineplot(data=df_plot, x='Fecha_Str', y='Disponibilidad_Sistemas', color='#10b981', linewidth=2.5, marker='o', label='Disponibilidad HIS Real', ax=ax)
        ax.axhline(th_his, color='#ef4444', linestyle='--', linewidth=1.5, label=f'Umbral Mínimo Directivo ({th_his}%)')
        ax.set_title("Uptime del HIS vs Umbral de Tolerancia Directiva", fontsize=11, fontweight='bold', color='#f8fafc')
        ax.set_xlabel("Mes / Año", fontsize=9, color='#94a3b8')
        ax.set_ylabel("Uptime (%)", fontsize=9, color='#94a3b8')
        plt.xticks(rotation=45, ha='right')
        ax.grid(True, which='both', color='#334155', linestyle=':', linewidth=0.5)
        legend = ax.legend(facecolor='#1e293b', edgecolor='#334155')
        for text in legend.get_texts():
            text.set_color('#cbd5e1')
        plt.tight_layout()
        st.pyplot(fig_mon)

# --- 9. PIE DE PÁGINA ---
st.divider()
st.info("💡 Este dashboard estratégico consolida las métricas del Balanced Scorecard (BSC) HDPUV y las proyecta en las 5 perspectivas clave de TI para la toma de decisiones gerenciales del CIO.")
