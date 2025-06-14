import { boot } from 'quasar/wrappers';
import Highcharts from 'highcharts';
import HighchartsVue from 'highcharts-vue';
import type { App } from 'vue';

// Optionally, import Highcharts modules like exporting, accessibility, etc.
// import Exporting from 'highcharts/modules/exporting';
// import Accessibility from 'highcharts/modules/accessibility';

// if (typeof Highcharts === 'object') {
//   Exporting(Highcharts);
//   Accessibility(Highcharts);
// }

export default boot(({ app }: { app: App }) => {
  // Option 1: Make HighchartsVue globally available as <highcharts> component
  app.use(HighchartsVue);

  // Option 2: Or make it available via a global property (less common for components)
  // app.config.globalProperties.$Highcharts = Highcharts;
});

// Export Highcharts itself if you need to access it directly in components
export { Highcharts };
