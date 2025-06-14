import { boot } from 'quasar/wrappers'
import dayjs from 'dayjs'
import type { App } from 'vue';
import 'dayjs/locale/vi' // Import locale tiếng Việt
import relativeTime from 'dayjs/plugin/relativeTime' // Ví dụ plugin
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import quarterOfYear from 'dayjs/plugin/quarterOfYear'; // Import the plugin

dayjs.locale('vi') // Set locale mặc định
dayjs.extend(relativeTime)
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(quarterOfYear); // Extend dayjs with the quarterOfYear plugin

export default boot(({ app }: { app: App }) => {
  app.config.globalProperties.$dayjs = dayjs
})
export { dayjs } // Export để có thể import trực tiếp từ các file khác
