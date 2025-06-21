<template>
  <q-page class="flex flex-center bg-grey-2">
    <q-inner-loading :showing="isLoading" label="Đang đăng nhập..." />

    <q-card class="q-pa-md shadow-2 my-card" bordered style="width: 400px;">
      <q-card-section class="text-center">
        <div class="text-grey-9 text-h5 text-weight-bold">Đăng Nhập</div>
        <div class="text-grey-8">Vui lòng đăng nhập để tiếp tục</div>
      </q-card-section>
      <q-card-section>
        <q-form @submit.prevent="handleLogin" class="q-gutter-md">
          <q-input
            filled
            v-model="email"
            label="Email"
            lazy-rules
            :rules="[val => !!val || 'Vui lòng nhập email', val => /.+@.+\..+/.test(val) || 'Email không hợp lệ']"
            type="email"
          />
          <q-input
            filled
            v-model="password"
            label="Mật khẩu"
            type="password"
            lazy-rules
            :rules="[val => !!val || 'Vui lòng nhập mật khẩu']"
          />
          <q-btn
            label="Đăng nhập"
            color="primary"
            class="full-width"
            type="submit"
            :loading="isLoading" />
        </q-form>
      </q-card-section>
      <q-card-section class="text-center q-pt-none">
        <div class="text-grey-8">
          Chưa có tài khoản?
          <router-link :to="{ name: 'register' }" class="text-dark text-weight-bold" style="text-decoration: none">
            Đăng ký ngay.
          </router-link>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from 'src/stores/authStore'; // We'll update this store next
import type { LoginDto } from 'src/models/auth';

const authStore = useAuthStore();

const email = ref('test@example.com'); // Pre-fill for easier testing with seed data
const password = ref('testpassword'); // Pre-fill for easier testing
const isLoading = ref(false);

const handleLogin = async () => {
  isLoading.value = true;
  const loginData: LoginDto = { email: email.value, password: password.value };
  // The authStore.login action will handle API call, error, and navigation
  await authStore.login(loginData);
  isLoading.value = false; // authStore.login will handle loading state internally or we can manage it here
};
</script>
