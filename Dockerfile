# ── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependencias primero (aprovecha caché de Docker)
COPY package*.json ./
RUN npm ci --frozen-lockfile

# Copiar el proyecto (incluye la carpeta data/ del VPS)
COPY . .

# Copiar data/ → public/data/ para que Vite lo incluya en dist/ como archivo estático.
# En producción se sobreescribe con un volume mount sin necesidad de reconstruir.
RUN mkdir -p public/data && cp data/*.json public/data/ || true

RUN npm run build

# ── Stage 2: Serve ────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runner

COPY nginx.conf /etc/nginx/conf.d/default.conf

# dist/data/Gobierno_TI_data.json queda disponible en /data/Gobierno_TI_data.json
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

# ── Cómo correr el contenedor ─────────────────────────────────────────────────
#
# Sin volume (usa la data que se copió al hacer el build):
#   docker build -t dashboard .
#   docker run -p 80:80 dashboard
#
# Con volume (la data se lee en vivo desde la carpeta del VPS):
#   docker run -p 80:80 \
#     -v /ruta/en/vps/data:/usr/share/nginx/html/data \
#     dashboard
#
# Para actualizar la data sin reconstruir la imagen:
#   1. Edita o reemplaza el archivo en /ruta/en/vps/data/Gobierno_TI_data.json
#   2. El navegador recarga y obtiene la nueva data (sin rebuild)
