import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { teamApiPlugin } from './server/dev-api.js';

export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''));
  return { plugins: [react(), teamApiPlugin()] };
});
