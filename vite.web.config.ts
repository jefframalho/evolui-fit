import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({root:'web',base:'./',server:{allowedHosts:['terminal.local']},publicDir:'../public',plugins:[react()],build:{outDir:'../web-dist',emptyOutDir:true}});
