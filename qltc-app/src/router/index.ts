import { route } from 'quasar/wrappers'; // Import RouteCallback for type assertion
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import routes from './routes';
import { useAuthStore } from 'src/stores/authStore'; // Import auth store
import type { Pinia } from 'pinia'; // Import Pinia type for explicit typing
import type { RouteCallback } from '@quasar/app-vite'; // Correctly import RouteCallback for assertion

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */
// Export the router instance directly for use in places like api.ts
export let routerInstance: ReturnType<typeof createRouter>;

export default route(function ({ store }: { store: Pinia } /*, ssrContext */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory);

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  Router.beforeEach((to, from, next) => {
    // Get the auth store instance, passing the Pinia store provided by the wrapper
    const authStore = useAuthStore(store); // Pass the Pinia store instance if needed by useAuthStore
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
    const requiresGuest = to.matched.some(record => record.meta.requiresGuest);

    if (requiresAuth && !authStore.isAuthenticated) {
      // If route requires auth and user is not authenticated, redirect to login
      next({ name: 'login' });
    } else if (requiresGuest && authStore.isAuthenticated) {
      // If route requires guest (like login/register) and user is authenticated, redirect to home
      next({ name: 'home' });
    } else {
      // Otherwise, proceed
      next();
    }
  });

  routerInstance = Router; // Assign the instance for export

  return Router;
} as RouteCallback); // Add type assertion here
