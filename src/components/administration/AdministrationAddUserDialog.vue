<template>
  <v-dialog :model-value="modelValue" :max-width="dialogWidth" @update:model-value="$emit('update:modelValue', $event)">
    <v-card>
      <v-card-title class="dialog-title">
        <span>Добавление пользователя</span>
        <v-btn icon variant="text" size="small" @click="$emit('update:modelValue', false)">
          <v-icon icon="mdi-close" />
        </v-btn>
      </v-card-title>

      <div class="dialog-content">
        <v-card variant="text">
          <v-card-text class="pt-4 pb-2 text-body-2">Поделитесь с пользователем ссылкой на регистрацию</v-card-text>
          <v-container fluid class="pt-0">
            <v-row align="center">
              <v-col cols="12" md="6">Роль пользователя:</v-col>
              <v-col cols="12" md="6">
                <v-select
                  :model-value="invitationRole"
                  :items="roleOptions"
                  item-title="label"
                  item-value="value"
                  variant="outlined"
                  density="compact"
                  hide-details
                  @update:model-value="$emit('set-invitation-role', $event as UserRole)"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" class="d-flex justify-end">
                <v-btn
                  color="primary"
                  variant="tonal"
                  prepend-icon="mdi-link-variant"
                  class="text-none"
                  @click="$emit('create-invitation-link')"
                >
                  Скопировать ссылку
                </v-btn>
              </v-col>
            </v-row>
          </v-container>
        </v-card>

        <v-divider class="my-2" />

        <v-card-text class="text-body-2">Или создайте учетную запись самостоятельно:</v-card-text>
        <v-card-item class="manual-form-wrap">
          <v-form class="manual-form">
            <v-text-field
              label="Email"
              type="email"
              :model-value="form.email"
              required
              variant="outlined"
              density="comfortable"
              hide-details="auto"
              @update:model-value="$emit('set-field', 'email', String($event ?? ''))"
            />
            <v-text-field
              label="Имя"
              type="text"
              :model-value="form.name"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
              @update:model-value="$emit('set-field', 'name', String($event ?? ''))"
            />
            <v-select
              label="Роль"
              :model-value="form.role"
              :items="roleOptions"
              item-title="label"
              item-value="value"
              variant="outlined"
              density="comfortable"
              hide-details
              @update:model-value="$emit('set-field', 'role', $event as UserRole)"
            />
            <v-text-field
              label="Пароль"
              :model-value="form.password"
              :type="form.showPassword ? 'text' : 'password'"
              hint="Минимум 8 символов"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
              @update:model-value="$emit('set-field', 'password', String($event ?? ''))"
            >
              <template #append-inner>
                <v-icon
                  :icon="form.showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                  size="small"
                  @click="$emit('set-field', 'showPassword', !form.showPassword)"
                />
              </template>
            </v-text-field>
          </v-form>
        </v-card-item>
      </div>

      <v-card-actions>
        <v-spacer />
        <v-btn variant="outlined" @click="$emit('update:modelValue', false)">Отмена</v-btn>
        <v-btn color="primary" :disabled="!isCreateEnabled" @click="$emit('submit')">Создать</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-snackbar
    :model-value="invitationCopied"
    color="info"
    timeout="3000"
    text="Ссылка скопирована. Она действительна в течение 5 часов!"
    @update:model-value="$emit('close-invitation-snackbar')"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDisplay } from 'vuetify'
import type { SelectOption, UserFormState, UserRole } from '@/types/administration'

const props = defineProps<{
  modelValue: boolean
  form: UserFormState
  roleOptions: SelectOption<UserRole>[]
  invitationRole: UserRole
  invitationCopied: boolean
}>()

defineEmits<{
  'update:modelValue': [value: boolean]
  setField: [field: keyof UserFormState, value: string | UserRole | boolean]
  submit: []
  'set-invitation-role': [role: UserRole]
  'create-invitation-link': []
  'close-invitation-snackbar': []
}>()

const { name } = useDisplay()

const dialogWidth = computed((): string => {
  switch (name.value) {
    case 'xs':
      return '100vw'
    case 'sm':
    case 'md':
    case 'lg':
      return '70%'
    default:
      return '50%'
  }
})

const isCreateEnabled = computed(() => props.form.email.trim().length > 0 && props.form.password.length >= 8)
</script>

<style scoped>
.dialog-title {
  background: #409eff;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dialog-content {
  max-height: calc(90vh - 56px);
  overflow-y: auto;
}

.manual-form-wrap {
  background: #fff;
  box-shadow: inset -2px -2px 2px 0 #00000040;
  margin: 0 16px 16px;
}

.manual-form {
  display: grid;
  gap: 12px;
}
</style>
