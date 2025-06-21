<template>
  <q-page class="flex flex-center bg-grey-2">
    <q-inner-loading :showing="isLoading" label="Đang xử lý..." />

    <q-card class="q-pa-md shadow-2 my-card" bordered style="width: 400px;">
      <q-card-section class="text-center">
        <div class="text-grey-9 text-h5 text-weight-bold">Đăng Ký</div>
        <div class="text-grey-8">Tạo tài khoản mới</div>
      </q-card-section>
      <q-card-section>
        <q-form @submit.prevent="handleRegister" class="q-gutter-md">
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
            :rules="[val => !!val || 'Vui lòng nhập mật khẩu', val => val.length >= 6 || 'Mật khẩu phải có ít nhất 6 ký tự']"
          />
           <q-input
            filled
            v-model="confirmPassword"
            label="Xác nhận mật khẩu"
            type="password"
            lazy-rules
            :rules="[val => !!val || 'Vui lòng xác nhận mật khẩu', val => val === password || 'Mật khẩu không khớp']"
          />
          <q-btn
            label="Đăng ký"
            color="primary"
            class="full-width"
            type="submit"
            :loading="isLoading" />
        </q-form>
      </q-card-section>
      <q-card-section class="text-center q-pt-none">
        <div class="text-grey-8">
          Đã có tài khoản?
          <router-link :to="{ name: 'login' }" class="text-dark text-weight-bold" style="text-decoration: none">
            Đăng nhập.
          </router-link>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
// import { useRouter } from 'vue-router'; // Not used if authStore handles navigation
import { useAuthStore } from 'src/stores/authStore'; // We'll update this store later
// import { registerAPI } from 'src/services/authApiService'; // No longer needed if authStore.register handles it
import type { RegisterDto } from 'src/models/auth';

const $q = useQuasar();
const authStore = useAuthStore(); // For setting user state after registration

const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const isLoading = ref(false);

const handleRegister = async () => {
  if (password.value !== confirmPassword.value) {
    $q.notify({ type: 'negative', message: 'Mật khẩu xác nhận không khớp.' });
    return;
  }

  isLoading.value = true;
  const registerData: RegisterDto = {
    email: email.value,
    password: password.value,
  };
  await authStore.register(registerData); // Call store action. Notifications and routing are handled by authStore.register.
  isLoading.value = false; // isLoading is managed here, error/success notifications by the store.
};
</script>
