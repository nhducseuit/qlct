import { defineBoot } from '#q-app/wrappers';
import axios, { type AxiosInstance } from 'axios';
import { useAuthStore } from 'src/stores/authStore'; // Import authStore

declare module '@vue/runtime-core' { // Corrected module for Vue 3
  interface ComponentCustomProperties { // Ensure this matches Vue 3 usage if needed
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
const api = axios.create({
  baseURL: 'http://localhost:3000', // Reverted to hardcoded baseURL
});

// Pinia should be initialized by its own boot file before this runs.
// We attempt to use useAuthStore() directly.
export default defineBoot(({ app }) => {
  // Request interceptor to add JWT token
  // Temporarily disable sending Auth token for DEV
  // api.interceptors.request.use(
  //   (config) => {
  //     const authStore = useAuthStore(); // Try to get authStore instance directly
  //     if (authStore.isAuthenticated && authStore.token) {
  //       config.headers.Authorization = `Bearer ${authStore.token}`;
  //     }
  //     return config;
  //   },
  //   (error) => {
  //     // Ensure we reject with an Error object
  //     if (error instanceof Error) {
  //       return Promise.reject(error);
  //     }
  //     return Promise.reject(new Error(String(error) || 'Axios request interceptor error'));
  //   }
  // );

  // Optional: Response interceptor for global error handling (e.g., 401 Unauthorized)
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        const authStore = useAuthStore(); // Try to get authStore instance directly
        // Handle the promise returned by logout
        void authStore.logout().catch((logoutError: unknown) => {
          console.error('Error during automatic logout:', logoutError);
        });
        // Potentially redirect to login page
        // router.push('/login'); // Ensure router is available if you use this
      }
      // Ensure we reject with an Error object
      if (error instanceof Error) {
        return Promise.reject(error);
      }
      return Promise.reject(new Error(String(error.response?.data?.message || error.message) || 'Axios response interceptor error'));
    }
  );
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios;
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api;
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
});

export { api };
