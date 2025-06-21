import axios from 'axios';
import { useAuthStore } from 'src/stores/authStore';
import { routerInstance } from 'src/router'; // Ensure routerInstance is exported from src/router/index.ts
import { Notify } from 'quasar';


const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL
    ? `${import.meta.env.VITE_API_BASE_URL}`
    : 'http://localhost:3000', // Default if VITE_API_BASE_URL is not set
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`;
    }
    return config;
  },
  (error: unknown) => { // Explicitly type error as unknown
    // Ensure the Promise is rejected with an Error instance
    const errorMessage = error instanceof Error ? error : new Error(String(error) || 'Axios request interceptor error');
    return Promise.reject(errorMessage);
  }
);

// Optional: Response interceptor for global error handling (e.g., 401 Unauthorized)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const authStore = useAuthStore(); // Get store instance
    // const originalRequest = error.config; // Not currently used, can be removed

    // Check if the error is a 401 Unauthorized response
    if (error.response && error.response.status === 401) {
      console.warn('[Axios Interceptor] 401 Unauthorized response received.');

      // Avoid infinite redirect loops if the 401 happens on the login/register page itself
      const isAuthPage = routerInstance.currentRoute.value.matched.some(
        (route) => route.meta?.requiresGuest
      );

      // Clear auth data immediately
      authStore.clearAuthData(); // This clears token and user from store and localStorage

      // Only redirect if the user was on a protected page
      if (!isAuthPage) {
        console.log('[Axios Interceptor] Redirecting to login due to 401 on protected route.');
        await routerInstance.replace({ name: 'login' }); // Use router.replace
        Notify.create({
          color: 'negative',
          message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
          icon: 'lock_clock',
        });
      } else {
         console.log('[Axios Interceptor] 401 on auth page, not redirecting.');
      }
      // Re-throw the error so the calling code (e.g., store action) can handle it
      // Ensure the original Axios error (which is an Error instance) is rejected
      return Promise.reject(error instanceof Error ? error : new Error(String(error))); // Ensure rejected value is an Error
    }

    // For other errors, just log and re-throw
    console.error(
      '[Axios Interceptor] API Error:',
      error.response?.status, error.message, error.response?.data
    );

    // Ensure we reject with an Error object, potentially including backend message
    const errorMessage = String(error.response?.data?.message || error.message || 'API request failed');
    return Promise.reject(new Error(errorMessage));
  }
);

export default apiClient;
