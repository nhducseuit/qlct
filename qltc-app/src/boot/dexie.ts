import { boot } from 'quasar/wrappers'
import { db } from 'src/services/db' // Đường dẫn tới file db.js của bạn
    import type { App } from 'vue';

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(({ app }: { app: App }) => {
  // Thêm instance db vào global properties của app
  // Để sử dụng trong Options API: this.$db
  app.config.globalProperties.$db = db
})