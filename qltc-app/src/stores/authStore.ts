import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';

// Define a simple User type for now
interface User {
  id: string;
  email: string;
  // Add other user-specific fields as needed
}

export const useAuthStore = defineStore('auth', () => {
  const $q = useQuasar();
  const router = useRouter();

  // Initialize isAuthenticated based on DEV environment
  const isAuthenticated = ref(process.env.DEV ? true : false);
  const user = ref<User | null>(process.env.DEV ? { id: 'dev-user', email: 'dev@example.com' } : null);
  const token = ref<string | null>(process.env.DEV ? 'dev-token-dev-user' : null); // Add token ref, mock for DEV

  // In a real app, you'd also check localStorage/sessionStorage for a token here
  // to persist login state, but for now, DEV mode overrides.

  const login = async (/* credentials: any */) => {
    // Placeholder for actual API call
    // For now, simulate successful login
    // This will still be called if user explicitly logs in, even in DEV,
    // but isAuthenticated is already true.
    isAuthenticated.value = true;
    user.value = { id: 'test-user', email: 'user@example.com' }; // Mock user
    token.value = 'mock-jwt-token-for-test-user'; // Mock token
    $q.notify({ type: 'positive', message: 'Đăng nhập thành công!' });
    await router.push({ name: 'home' });
  };

  const logout = async () => {
    if (process.env.DEV) {
      $q.notify({ type: 'info', message: 'Đăng xuất bị bỏ qua trong chế độ DEV.' });
      return; // Do nothing in DEV mode for logout
    }
    isAuthenticated.value = false;
    user.value = null;
    token.value = null;
    // In a real app, clear token from localStorage/sessionStorage
    $q.notify({ type: 'info', message: 'Đã đăng xuất.' });
    await router.push({ name: 'login' });
  };

  return {
    isAuthenticated,
    user,
    token,
    login,
    logout,
  };
});
