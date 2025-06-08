<template>
  <q-page class="flex flex-center bg-grey-2">
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
          <q-btn label="Đăng ký" color="primary" class="full-width" type="submit" />
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
import { useRouter } from 'vue-router';

const $q = useQuasar();
const router = useRouter();
const email = ref('');
const password = ref('');
const confirmPassword = ref('');

const handleRegister = async () => {
  // Placeholder for actual registration API call
  $q.notify({ type: 'positive', message: 'Đăng ký thành công! Vui lòng đăng nhập.' });
  await router.push({ name: 'login' });
};
</script>
