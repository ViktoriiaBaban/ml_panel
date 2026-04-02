<template>
  <v-container fluid class="administration-view">
    <v-sheet rounded="lg" class="administration-sheet">
      <AdministrationTabs
        :model-value="adminStore.activeTab"
        :tabs="adminStore.tabs"
        @update:model-value="adminStore.setActiveTab"
      />

      <v-divider />

      <div class="administration-content">
        <AdministrationUsersTable
          v-if="adminStore.activeTab === 'users'"
          :headers="adminStore.userHeaders"
          :users="adminStore.users"
          :loading="adminStore.loadingUsers"
          @add-user="adminStore.openAddUserDialog"
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
        />
      </div>
    </v-sheet>

    <AdministrationAddUserDialog
      :model-value="adminStore.showAddUserDialog"
      :form="adminStore.userForm"
      :role-options="adminStore.roleOptions"
      @update:model-value="onDialogChange"
      @set-field="adminStore.setUserFormField"
      @submit="adminStore.submitUserForm"
    />
  </v-container>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import AdministrationAddUserDialog from '@/components/administration/AdministrationAddUserDialog.vue'
import AdministrationIntegrationsTable from '@/components/administration/AdministrationIntegrationsTable.vue'
import AdministrationTabs from '@/components/administration/AdministrationTabs.vue'
import AdministrationUsersTable from '@/components/administration/AdministrationUsersTable.vue'
import { useAdminStore } from '@/stores/admin'

const adminStore = useAdminStore()

onMounted(() => {
  adminStore.initAdministration()
})

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
