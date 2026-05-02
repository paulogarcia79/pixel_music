import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import vitestCucumberPlugin from 'vitest-cucumber-plugin'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    vitestCucumberPlugin()
  ],
  test: {
    globals: true,
    environment: 'happy-dom',
    include: ['**/*.feature', '**/*.spec.ts', '**/*.test.ts'],
  }
})