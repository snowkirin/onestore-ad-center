import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { ViteAliases } from 'vite-aliases';
import VitePluginHtmlEnv from 'vite-plugin-html-env';

// https://vitejs.dev/config/

export default ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };
  return defineConfig({
    // @ts-ignore
    plugins: [react(), ViteAliases({ useConfig: true, useTypescript: true }), VitePluginHtmlEnv({ compiler: true })],
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
        },
      },
    },
    server: {
      proxy: {
        '/AD_API': {
          target: process.env.VITE_MOLOCO_ADS_API,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/AD_API/, ''),
        },
        '/CD_API': {
          target: process.env.VITE_MOLOCO_CLOUD_API,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/CD_API/, ''),
        },
        '/WB_API': {
          target: process.env.VITE_WISEBIRDS_API,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/WB_API/, ''),
        },
      },
    },
  });
};

// export default defineConfig({
//   plugins: [react()]
// })
