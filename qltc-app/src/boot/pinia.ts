import { boot } from 'quasar/wrappers'
import { createPinia } from 'pinia'
    import type { App } from 'vue'; // Import App type for better type checking
// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot( ({ app }: { app: App }) => { // Add type for app
  const pinia = createPinia()
  app.use(pinia)
})
