import { defineConfig } from 'vite'
import wasm from 'vite-plugin-wasm'
import mkcert from 'vite-plugin-mkcert'
import react from '@vitejs/plugin-react'

let count = 0;
// https://vitejs.dev/config/
export default defineConfig({
  server: { https: true },
  plugins: [
    wasm(),
    react(),

    // https
    mkcert(),
    {
      name: 'wasm-loader',
      transform: (code, id) => {
        if (count < 1000000) {
          console.log(id)
          // console.log('<<<<<<<end')
          count++
        }

        if (id.endsWith('.wasm')) {

          console.log('code ', code, 'id ', id)

          return {
            code: `export default ${JSON.stringify(code)};`,
            map: null
          }
        }

      }
    }
  ],
  assetsInclude: ['**/*.mp4']
})
