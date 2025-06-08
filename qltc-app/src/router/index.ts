import { defineRouter } from '#q-app/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import routes from './routes';
import { useAuthStore } from 'src/stores/authStore'; // Import auth store

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
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
    const authStore = useAuthStore(); // Get store instance inside the guard
    // Bypass authentication in DEV mode
    // For Docker builds with forced dev user, authStore.isAuthenticated will be true.
    if (import.meta.env.DEV && !authStore.isAuthenticated) {
      // This specific check for import.meta.env.DEV is more for local `quasar dev`
      // where VITE_FORCE_DEV_USER might not be set.
      next();
      return;
    }

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
  return Router;
});
