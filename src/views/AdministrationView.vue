<template>
  <v-container fluid class="administration-view">
    <v-sheet rounded="lg" class="administration-sheet">
      <AdministrationTabs
        :model-value="adminStore.activeTab"
        :tabs="adminStore.tabs"
        @update:model-value="onTabChange"
      />

      <v-divider />

      <div class="administration-content">
        <AdministrationUsersTable
          v-if="adminStore.activeTab === 'users'"
          :headers="adminStore.userHeaders"
          :users="adminStore.users"
          :loading="adminStore.loadingUsers"
          @add-user="adminStore.openAddUserDialog"
          @edit-user="adminStore.openEditUserDialog"
          @toggle-user-status="adminStore.toggleUserStatus"
          @delete-user="onDeleteUser"
        />

        <AdministrationIntegrationsTable
          v-else
          :headers="adminStore.integrationHeaders"
          :integrations="adminStore.integrations"
          :health-checks="adminStore.healthChecks"
          :status-labels="adminStore.integrationStatusLabels"
          :loading="adminStore.loadingIntegrations"
          :expanded-integration-id="adminStore.expandedIntegrationId"
          :checking-integration-id="adminStore.checkingIntegrationId"
          @toggle-expanded="adminStore.toggleIntegrationExpanded"
          @check-integration="adminStore.checkIntegration"
          @edit-integration="adminStore.openIntegrationDialog"
        />
      </div>
    </v-sheet>

    <AdministrationAddUserDialog
      :model-value="adminStore.showAddUserDialog"
      :form="adminStore.userForm"
      :role-options="adminStore.roleOptions"
      :invitation-role="adminStore.invitationRole"
      :invitation-copied="adminStore.invitationCopied"
      @update:model-value="onDialogChange"
      @set-field="adminStore.setUserFormField"
      @set-invitation-role="adminStore.setInvitationRole"
      @create-invitation-link="adminStore.createInvitationLink"
      @close-invitation-snackbar="adminStore.closeInvitationSnackbar"
      @submit="adminStore.submitUserForm"
    />

    <AdministrationEditUserDialog
      :model-value="adminStore.showEditUserDialog"
      :form="adminStore.editUserForm"
      :role-options="adminStore.roleOptions"
      @update:model-value="onEditDialogChange"
      @set-field="adminStore.setEditUserField"
      @save="adminStore.saveEditedUser"
      @reset-password="adminStore.resetEditedUserPassword"
    />

    <AdministrationIntegrationDialog
      :model-value="adminStore.showIntegrationDialog"
      :form="adminStore.integrationForm"
      @update:model-value="onIntegrationDialogChange"
      @setField="adminStore.setIntegrationFormField"
      @submit="adminStore.saveIntegration"
    />
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import AdministrationAddUserDialog from '@/components/administration/AdministrationAddUserDialog.vue'
import AdministrationEditUserDialog from '@/components/administration/AdministrationEditUserDialog.vue'
import AdministrationIntegrationDialog from '@/components/administration/AdministrationIntegrationDialog.vue'
import AdministrationIntegrationsTable from '@/components/administration/AdministrationIntegrationsTable.vue'
import AdministrationTabs from '@/components/administration/AdministrationTabs.vue'
import AdministrationUsersTable from '@/components/administration/AdministrationUsersTable.vue'
import { useAdminStore } from '@/stores/admin'

const adminStore = useAdminStore()
const { activeTab } = storeToRefs(adminStore)
const route = useRoute()
const router = useRouter()

onMounted(() => {
  adminStore.initAdministration()
})

watch(
  () => route.name,
  (name) => {
    const next = name === 'administration-integrations' ? 'integrations' : 'users'
    if (activeTab.value !== next) {
      adminStore.setActiveTab(next)
    }
  },
  { immediate: true },
)

function onTabChange(tab: 'users' | 'integrations') {
  adminStore.setActiveTab(tab)
  router.push({ name: tab === 'integrations' ? 'administration-integrations' : 'administration-users' })
}


function onDialogChange(open: boolean) {
  if (open) {
    adminStore.openAddUserDialog()
    return
  }
  adminStore.closeAddUserDialog()
}

function onDeleteUser(id: number) {
  if (confirm('Вы уверены, что хотите удалить этого пользователя?')) {
    adminStore.deleteUser(id)
  }
}

function onEditDialogChange(open: boolean) {
  if (!open) {
    adminStore.closeEditUserDialog()
  }
}

function onIntegrationDialogChange(open: boolean) {
  if (!open) {
    adminStore.closeIntegrationDialog()
  }
}
</script>

<style scoped>
.administration-view {
  padding: 32px;
  background-color: #f5f7fa;
  min-height: 100%;
}

.administration-sheet {
  overflow: hidden;
  background-color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.administration-content {
  padding: 24px;
}
</style>
