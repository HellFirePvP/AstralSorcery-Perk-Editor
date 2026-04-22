import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

const PROD_CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "form-action 'self'",
].join('; ')

const injectProdCsp = (): Plugin => ({
  name: 'inject-prod-csp',
  apply: 'build',
  transformIndexHtml(html) {
    return html.replace(
      '<head>',
      `<head>\n    <meta http-equiv="Content-Security-Policy" content="${PROD_CSP}">`
    )
  },
})

export default defineConfig({
  plugins: [react(), injectProdCsp()],
})
