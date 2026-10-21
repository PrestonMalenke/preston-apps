import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import {resolve} from 'node:path'
export default defineConfig({plugins:[react()],build:{rollupOptions:{input:{main:resolve(import.meta.dirname,'index.html'),avs:resolve(import.meta.dirname,'apps/avs-hub/index.html'),cocktails:resolve(import.meta.dirname,'apps/fall-cocktails/index.html')}}}})
