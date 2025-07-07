// d:\sources\qlct\qltc-app\src\stores\authStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { registerAPI, loginAPI } from 'src/services/authApiService';
import type { LoginDto, RegisterDto, AuthResponseDto, UserPayload } from 'src/models/auth';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { LocalStorage } from 'quasar';
import apiClient from 'src/services/api'; // Corrected to default import
import { AxiosError } from 'axios';
import { useHouseholdMemberStore } from './householdMemberStore';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(LocalStorage.getItem('token') || null); // Removed redundant assertion

  // Initialize user from localStorage, handling potential parsing/type issues
  let initialUser: UserPayload | null = null;
  try {
    // LocalStorage.getItem already parses the JSON if it was stored as an object by Quasar.
    // So, storedUserItem will be the object or null, not a string.
    const storedUserItem = LocalStorage.getItem('user');
    if (storedUserItem) {
      initialUser = storedUserItem as UserPayload; // Assert type as it's already parsed
    }
  } catch (e: unknown) {
    console.error('Error retrieving user data from localStorage:', e);
    // If there's any unexpected error during retrieval, clear corrupted data
    LocalStorage.remove('user');
    LocalStorage.remove('token');
    token.value = null; // Clear token in store as well
  }
  const user = ref<UserPayload | null>(initialUser); // Initialize ref with the determined value
  const isAuthenticated = computed(() => !!token.value);
  const isLoading = ref(false);
  const error = ref<string | null>(null); // Keep error state

  const $q = useQuasar();
  const router = useRouter();

  const userWithMembershipsAndPerson = computed(() => {
    if (!user.value) return null;
    const memberStore = useHouseholdMemberStore();
    const memberships = memberStore.allMembersWithFamily.filter(
      (m) => m.person?.userId === user.value?.id
    );
    const person = memberships.length > 0 && memberships[0] ? memberships[0].person : null;

    return {
      ...user.value,
      memberships,
      person,
    };
  });

  // Helper function to set token and user in both store and localStorage
  const setAuthData = (authResponse: AuthResponseDto) => {
    token.value = authResponse.accessToken;
    user.value = authResponse.user;
    LocalStorage.set('token', authResponse.accessToken); // Quasar LocalStorage stringifies objects automatically
    LocalStorage.set('user', authResponse.user);
    // Update Axios Authorization header
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${authResponse.accessToken}`;
  };

  const clearAuthData = () => {
    token.value = null;
    user.value = null;
    LocalStorage.remove('token');
    LocalStorage.remove('user');
    delete apiClient.defaults.headers.common['Authorization'];
  };

  const register = async (registerData: RegisterDto) => {
    isLoading.value = true;
    error.value = null;
    try {
      await registerAPI(registerData); // Removed unused response variable
      // Directly log in the user after successful registration (optional)
      // setAuthData(response);
      // $q.notify({ type: 'positive', message: 'Đăng ký thành công!' });
      // await router.push({ name: 'home' });

      // Or, just notify and redirect to login (as in your RegisterPage.vue)
      $q.notify({ type: 'positive', message: 'Đăng ký thành công! Vui lòng đăng nhập.' });
      // Use router.replace to prevent going back to register page
      await router.replace({ name: 'login' });
    } catch (err: unknown) { // Typed error as unknown
      let message = 'Đăng ký không thành công.';
      if (err instanceof AxiosError && err.response?.data?.message) {
        message = Array.isArray(err.response.data.message)
          ? err.response.data.message.join(', ')
          : String(err.response.data.message);
      } else if (err instanceof Error) {
        message = err.message;
      }
      error.value = message;
      $q.notify({ type: 'negative', message: String(message) });
    } finally {
      isLoading.value = false;
    }
  };

  const login = async (loginData: LoginDto) => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await loginAPI(loginData);
      setAuthData(response);
      $q.notify({ type: 'positive', message: 'Đăng nhập thành công!' });
      // Use router.replace to prevent going back to login page
      await router.replace({ name: 'home' }); // Or your default authenticated route
    } catch (err: unknown) { // Typed error as unknown
      let message = 'Đăng nhập không thành công.';
      if (err instanceof AxiosError && err.response?.data?.message) {
        message = Array.isArray(err.response.data.message)
          ? err.response.data.message.join(', ')
          : String(err.response.data.message);
      } else if (err instanceof Error) {
        message = err.message;
      }
      error.value = message;
      $q.notify({ type: 'negative', message: String(message) });
    } finally {
      isLoading.value = false;
    }
  };

  const logout = async () => {
    clearAuthData();
    $q.notify({ type: 'info', message: 'Đã đăng xuất.' });
    await router.push({ name: 'login' }); // Or your default unauthenticated route
  };

  return {
    token,
    user,
    isAuthenticated,
    isLoading,
    error,
    register,
    login,
    logout,
    setAuthData,
    clearAuthData,
    userWithMembershipsAndPerson,
  };
});
