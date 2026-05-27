import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

// Dev-only: sirve la carpeta data/ en la URL /data/ sin bundlear el JSON
function serveDataPlugin() {
  return {
    name: 'serve-data-dir',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/data', async (req, res) => {
        try {
          const fileName = (req.url ?? '/').split('?')[0].replace(/^\//, '') || 'Gobierno_TI_data.json'
          const filePath = join(process.cwd(), 'data', fileName)
          const content  = await readFile(filePath, 'utf-8')
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(content)
        } catch {
          res.statusCode = 404
          res.end(JSON.stringify({ error: 'Not found' }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), serveDataPlugin()],
  server: {
    fs: {
      allow: [
        fileURLToPath(new URL('.', import.meta.url)),
        fileURLToPath(new URL('./data', import.meta.url)),
      ],
    },
  },
})
