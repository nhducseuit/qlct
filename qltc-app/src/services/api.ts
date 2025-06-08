import axios from 'axios';
import { useAuthStore } from 'src/stores/authStore';

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
    const authStore = useAuthStore(); // Get store instance inside interceptor
    // For DEV mode, we are using a 'dev-token-dev-user' which the backend
    // NotificationsGateway understands for 'dev-user'.
    // The actual API calls to controllers will rely on the backend defaulting to 'dev-user'
    // if no real JWT is present and it's a dev environment.
    // If a real token exists (e.g., from a previous login attempt or future implementation), use it.
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`;
    }
    return config;
  },
  (error) => {
    // Ensure we reject with an Error object
    if (error instanceof Error) {
      return Promise.reject(error);
    }
    return Promise.reject(new Error(String(error) || 'Axios request interceptor error'));
  }
);

// Optional: Response interceptor for global error handling (e.g., 401 Unauthorized)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      const authStore = useAuthStore();
      // Avoid calling logout if it's already in progress or if it's a DEV user scenario
      // where logout might not be meaningful without a full auth flow.
      if (authStore.isAuthenticated && authStore.user?.id !== 'dev-user') { // Check if not already dev-user
        try {
          await authStore.logout(); // Assuming logout clears token and resets state
          // Optionally redirect to login page
          // import router from 'src/router'; // Ensure router is correctly imported if used
          // router.push('/login');
        } catch (logoutError) {
          console.error('Error during automatic logout:', logoutError);
        }
      }
    }
    // Ensure we reject with an Error object
    if (error instanceof Error) {
      return Promise.reject(error);
    }
    return Promise.reject(new Error(String(error.response?.data?.message || error.message) || 'Axios response interceptor error'));
  }
);

export default apiClient;
