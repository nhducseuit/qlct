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

const devUserDetails: User = { id: 'dev-user', email: 'dev@example.com' };
const devUserToken = 'dev-token-dev-user'; // Matches backend expectation for dev user

// Log environment variables as soon as the module is parsed
console.log('[AuthStore Module Top] import.meta.env.DEV:', import.meta.env.DEV);
console.log('[AuthStore Module Top] import.meta.env.VITE_FORCE_DEV_USER:', import.meta.env.VITE_FORCE_DEV_USER);

export const useAuthStore = defineStore('auth', () => {
  const $q = useQuasar();
  // IMPORTANT: useRouter() can only be reliably used *after* the Pinia store is fully initialized
  // and connected to the Vue app. Access it lazily or pass it in if needed during setup.
  // For now, we'll access it lazily within methods like login/logout.
  let routerInstance: ReturnType<typeof useRouter> | null = null;

  const getRouter = () => {
    if (!routerInstance) {
      routerInstance = useRouter();
    }
    return routerInstance;
  };


  // Check for Vite's DEV mode (true for `quasar dev`)
  const isViteDevMode = import.meta.env.DEV;
  // Check for our custom environment variable (set during Docker build)
  const forceDevUserMode = import.meta.env.VITE_FORCE_DEV_USER === 'true';
  console.log('[AuthStore defineStore] isViteDevMode:', isViteDevMode, 'forceDevUserMode:', forceDevUserMode);

  const isAuthenticated = ref(false);
  const user = ref<User | null>(null);
  const token = ref<string | null>(null); // Initialize as null, then check localStorage

  const setDevUser = () => {
    isAuthenticated.value = true;
    user.value = { ...devUserDetails };
    token.value = devUserToken;
    localStorage.setItem('user-token', devUserToken);
    localStorage.setItem('user-details', JSON.stringify(devUserDetails));
    console.log('[AuthStore] Dev user set up:', user.value, token.value);
  };

  const clearUser = () => {
    isAuthenticated.value = false;
    user.value = null;
    token.value = null;
    localStorage.removeItem('user-token');
    localStorage.removeItem('user-details');
  };

  const initializeAuth = () => {
    const storedToken = localStorage.getItem('user-token');
    token.value = storedToken; // Set token ref from localStorage

    console.log('[AuthStore initializeAuth] Start. isViteDevMode:', isViteDevMode, 'forceDevUserMode:', forceDevUserMode, 'storedToken:', storedToken);

    if ((isViteDevMode || forceDevUserMode) && !storedToken) {
      // If in Vite dev mode OR forceDevUserMode is true, AND no real token exists in localStorage, set up dev user.
      console.log('[AuthStore initializeAuth] Condition for dev user met. Calling setDevUser().');
      setDevUser();
    } else if (storedToken) {
      // If a token exists (from localStorage), try to parse user details
      console.log('[AuthStore initializeAuth] Token found in localStorage. Attempting to restore user.');
      const storedUser = localStorage.getItem('user-details');
      if (storedUser) {
        try {
          user.value = JSON.parse(storedUser);
          isAuthenticated.value = true;
          console.log('[AuthStore initializeAuth] User restored from localStorage.');
        } catch (e) {
          console.error('[AuthStore] Failed to parse user from localStorage, clearing auth state.', e);
          clearUser(); // Clear invalid state
        }
      } else {
        // Token exists but no user details, likely an invalid state from previous manual sets or errors
        console.warn('[AuthStore initializeAuth] Token found but no user details in localStorage, clearing auth state.');
        clearUser(); // Clear invalid state
      }
    } else {
      // No token, not dev mode, not forced dev user mode - ensure clean state
      console.log('[AuthStore initializeAuth] No token, not dev/forced mode. Clearing user.');
      clearUser();
    }
    console.log('[AuthStore initializeAuth] End. isAuthenticated.value:', isAuthenticated.value);
  };

  initializeAuth(); // Call initialization logic when the store is defined


  const login = async (/* credentials: any */) => {
    // Placeholder for actual API call
    isAuthenticated.value = true;
    const loggedInUser: User = { id: 'test-user', email: 'user@example.com' }; // Mock user
    const loggedInToken = 'mock-jwt-token-for-test-user'; // Mock token

    user.value = loggedInUser;
    token.value = loggedInToken;
    localStorage.setItem('user-token', loggedInToken);
    localStorage.setItem('user-details', JSON.stringify(loggedInUser));

    $q.notify({ type: 'positive', message: 'Đăng nhập thành công!' });
    const router = getRouter();
    if (router) {
        await router.push({ name: 'home' });
    }
  };

  const logout = async () => {
    const router = getRouter();
    clearUser();
    $q.notify({ type: 'info', message: 'Đã đăng xuất.' });

    // After clearing user, if forceDevUserMode is true, re-initialize to set dev user again.
    // This makes "logout" in forced dev mode effectively a "reset to dev user".
    // If you want logout to truly clear even in forced mode, remove this re-initialization.
    if (forceDevUserMode) {
        console.log('[AuthStore] VITE_FORCE_DEV_USER is true, re-setting dev user after logout.');
        setDevUser();
        if (router && router.currentRoute.value.name !== 'home') { // Redirect to home after re-setting dev user
            try {
                await router.push({ name: 'home' });
            } catch (e) {
                console.error("Router push to home failed after re-setting dev user:", e);
            }
        }
        return; // Prevent redirect to login
    }


    if (router && router.currentRoute.value.name !== 'login') {
        try {
            await router.push({ name: 'login' });
        } catch (e) {
            console.error("Router push to login failed on logout:", e);
        }
    }
  };

  return {
    isAuthenticated,
    user,
    token,
    login,
    logout,
    setDevUser, // Expose if needed externally
    initializeAuth, // Expose for potential re-initialization if needed elsewhere
  };
});
