import csv, json

unidades = {
    "Disponibilidad HIS": "%",
    "Satisfaccion Usuario": "%",
    "Citas Digitales Consulta Externa": "%",
    "PQRSDF Gestionadas Digital": "%",
    "Tiempo Respuesta Clinica Reducc": "%",
    "Interoperabilidad": "%",
    "Procesos TI Documentados": "%",
    "Incidentes Criticos Seguridad": "N",
    "Personal Capacitado TI": "%",
    "Capacitaciones Mes": "N",
    "Adopcion Tecnologica Incremental": "%",
    "Ejecucion Presupuestal %": "%",
    "Reduccion Costos Mantenimiento": "%",
    "Proyectos Alineados PETI": "%",
    "Madurez MRAE Promedio": "1-5",
    "Cumplimiento MSPI": "1-5",
    "Modulos HIS Implementados": "%",
    "Ejecucion Proyectos PETI": "%",
    "Presupuesto TI vs Institucional": "%",
    "Glosas Facturacion": "%",
    "Incidentes Criticos HC": "N",
    "Teleconsultas Mes": "N",
    "Score FURAG Gobierno Digital": "pts",
    "Datasets Abiertos Publicados": "N"
}

series = {}
with open('Dataset_BSC_HDPUV_2024_2029.csv') as f:
    for r in csv.DictReader(f):
        k = r['KPI']
        if k not in series:
            series[k] = {'p': r['Perspectiva'], 'm': float(r['Meta']),
                         'u': unidades.get(k, ''), 'data': []}
        series[k]['data'].append({'f': r['Fecha'], 'v': float(r['Valor'])})

js_content = f"const kpiData = {json.dumps(series, separators=(',', ':'))};"
with open('data.js', 'w', encoding='utf-8') as out:
    out.write(js_content)

print("Datos convertidos y guardados en data.js")