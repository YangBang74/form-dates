<template>
  <div class="max-w-4xl mx-auto p-4">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-start mb-6 gap-3">
      <h2 class="text-2xl font-semibold text-gray-800 mb-4 sm:mb-0">Учётные записи</h2>
      <button
        @click="onAdd"
        class="inline-flex items-center px-4 py-2 text-black font-medium rounded-lg shadow-sm transition-colors border border-gray-200"
        type="button"
      >
        <Icon icon="akar-icons:plus" class="w-5 h-5" />
      </button>
    </div>
    <div
      class="mb-4 text-sm text-gray-600 flex items-center bg-blue-50 border-l-4 border-blue-200 p-3 rounded-md"
    >
      <Icon icon="akar-icons:info" class="w-4 h-4 mr-2 text-blue-500" />
      <span>
        Для указания нескольких меток для одной пары логин/пароль используйте разделитель
        <code class="bg-gray-100 px-1 rounded">;</code>
      </span>
    </div>
    <div class="overflow-x-auto bg-white rounded-lg shadow-md">
      <table class="min-w-full divide-y divide-gray-200 table-fixed">
        <colgroup>
          <col class="w-3/12" />
          <col class="w-2/12" />
          <col class="w-3/12" />
          <col class="w-3/12" />
          <col class="w-1/12" />
        </colgroup>
        <thead class="bg-gray-100">
          <tr>
            <th
              class="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
            >
              Метки
            </th>
            <th
              class="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
            >
              Тип записи
            </th>
            <th
              class="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
            >
              Логин
            </th>
            <th
              class="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
            >
              Пароль
            </th>
            <th
              class="px-3 py-2 text-center text-xs font-medium text-gray-700 uppercase tracking-wider"
            >
              Действия
            </th>
          </tr>
        </thead>
        <transition-group name="fade" tag="tbody" class="bg-white divide-y divide-gray-200">
          <AccountRow v-for="rawAcc in rawAccounts" :key="rawAcc.id" :rawAccount="rawAcc" />
        </transition-group>
      </table>
    </div>
    <div v-if="rawAccounts.length === 0" class="mt-6 text-center text-gray-500 italic">
      Нет сохранённых учётных записей.
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAccountsStore } from '@/stores/accountStore'
import AccountRow from '@/components/FormInput.vue'
import { Icon } from '@iconify/vue'

const accountsStore = useAccountsStore()

const rawAccounts = computed(() => accountsStore.rawAccounts)

function onAdd() {
  accountsStore.addAccount()
}
</script>
<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
