<template>
  <div class="login-page">
    <v-card class="login-card" elevation="4" rounded="lg">
      <v-card-text class="pa-8">
        <h1 class="text-h4 font-weight-bold mb-2">Добро пожаловать</h1>
        <p class="text-body-1 text-medium-emphasis mb-6">Авторизуйтесь, чтобы продолжить</p>

        <v-alert v-if="authStore.loginError" type="error" variant="tonal" density="compact" class="mb-4">
          {{ authStore.loginError }}
        </v-alert>

        <v-form @submit.prevent="onSubmit">
          <v-text-field
            v-model="email"
            label="Email"
            type="email"
            autocomplete="username"
            variant="outlined"
            density="comfortable"
            class="mb-2"
            hide-details="auto"
          />
          <v-text-field
            v-model="password"
            label="Пароль"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="current-password"
            variant="outlined"
            density="comfortable"
            class="mb-1"
            hide-details="auto"
            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showPassword = !showPassword"
          />
          <div class="d-flex justify-end mb-6">
            <button type="button" class="link-like text-body-2" @click.prevent>Забыли пароль?</button>
          </div>
          <v-btn
            type="submit"
            color="primary"
            size="large"
            block
            :loading="authStore.loggingIn"
            rounded="md"
          >
            Войти
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const showPassword = ref(false)

async function onSubmit() {
  if (!email.value.trim() || !password.value) return
  const ok = await authStore.login(email.value, password.value)
  if (!ok) return
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/storage'
  router.replace(redirect || '/storage')
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f2f5;
  padding: 24px;
}

.login-card {
  width: 100%;
  max-width: 420px;
}

.link-like {
  background: none;
  border: none;
  padding: 0;
  cursor: default;
  color: rgb(var(--v-theme-primary));
  font: inherit;
}
</style>
