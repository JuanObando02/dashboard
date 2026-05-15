import json
import os

def clean_kpi_data(file_path):
    """
    Limpia los datos de un archivo JSON de KPIs para que quede solo un valor por año.
    Mantiene la última entrada de cada año encontrada en el archivo original.
    """
    if not os.path.exists(file_path):
        print(f"Error: El archivo {file_path} no existe.")
        return

    with open(file_path, 'r', encoding='utf-8') as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError:
            print(f"Error: El archivo {file_path} no tiene un formato JSON válido.")
            return

    cleaned_data = {}

    for kpi_name, kpi_info in data.items():
        # Copiamos la metadata original
        cleaned_kpi = kpi_info.copy()
        
        # Primero, obtenemos el último valor disponible por cada año
        yearly_values = {}
        if 'data' in kpi_info and isinstance(kpi_info['data'], list):
            for entry in kpi_info['data']:
                if 'f' in entry:
                    year = entry['f'][:4]
                    yearly_values[year] = entry['v']
            
            # Ahora generamos 12 meses para cada uno de esos años
            expanded_data = []
            for year in sorted(yearly_values.keys()):
                val = yearly_values[year]
                for month in range(1, 13):
                    # Formateamos la fecha como YYYY-MM-01
                    date_str = f"{year}-{month:02d}-01"
                    expanded_data.append({
                        "f": date_str,
                        "v": val
                    })
            
            cleaned_kpi['data'] = expanded_data
        
        cleaned_data[kpi_name] = cleaned_kpi

    # Guardar los datos limpios en el mismo archivo
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(cleaned_data, f, indent=4, ensure_ascii=False)

    print(f"Éxito: Se han limpiado los datos en {file_path}")

if __name__ == "__main__":
    # Ruta relativa al archivo de datos
    archivo_objetivo = 'data_BSC_HDPUV.json'
    clean_kpi_data(archivo_objetivo)
