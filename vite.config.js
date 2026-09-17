import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
import path from 'node:path'

const orderSaverPlugin = () => ({
  name: 'order-saver',
  configureServer(server) {
    server.middlewares.use('/api/save-order', (req, res) => {
      if (req.method === 'POST') {
        let body = ''
        req.on('data', chunk => { body += chunk })
        req.on('end', () => {
          try {
            const { filename, content } = JSON.parse(body)
            const targetDir = path.resolve(process.cwd(), 'public/pedidos')
            if (!fs.existsSync(targetDir)) {
              fs.mkdirSync(targetDir, { recursive: true })
            }
            const filePath = path.join(targetDir, filename)
            fs.writeFileSync(filePath, content, 'utf8')
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ success: true, file: filePath }))
          } catch (err) {
            res.statusCode = 500
            res.end(JSON.stringify({ error: err.message }))
          }
        })
      } else {
        res.statusCode = 404
        res.end()
      }
    })
  }
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), orderSaverPlugin()],
  server: {
    watch: {
      ignored: ['**/*.crdownload', '**/*.tmp']
    }
  }
})
