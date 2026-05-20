FROM python:3.10-slim

WORKDIR /app

# Instalar dependencias
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el código del dashboard
COPY . .
# --- ESTO IMPRIMIRÁ LOS ARCHIVOS EN EL LOG DE COOLIFY ---
RUN echo "=== MOSTRANDO ARCHIVOS EN /app ===" && ls -la /app
RUN echo "=== MOSTRANDO TODO EL CONTENIDO DEL REPOSITORIO ===" && find . -maxdepth 3

# Exponer el puerto por defecto de Streamlit
EXPOSE 8501

# Comando para arrancar Streamlit deshabilitando bloqueos de CORS de Docker
CMD ["streamlit", "run", "dashboardStream.py", "--server.port=8501", "--server.address=0.0.0.0"]