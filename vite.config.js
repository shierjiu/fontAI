// import { defineConfig } from 'vite'
// import vue from '@vitejs/plugin-vue'
// import jsconfigPaths from 'vite-jsconfig-paths'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [vue(), jsconfigPaths()],
// })
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import jsconfigPaths from 'vite-jsconfig-paths'


// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), jsconfigPaths()],
  server: {
    host: '0.0.0.0',  // 允许外部访问
    port: 5174,       // 默认端口
    strictPort: true, // 如果端口被占用，则直接退出
    cors: true,       // 允许跨域
  }
})
