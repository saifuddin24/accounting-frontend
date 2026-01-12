<script setup>
import { Plus } from 'lucide-vue-next'
import { onMounted, ref } from 'vue'
import SelectDropdown from '../components/ui/SelectDropdown.vue'
import { useAccountingStore } from '../stores/accounting'

const store = useAccountingStore()

const newAccount = ref({
  code: '',
  name: '',
  type: 'Asset',
  normal_balance: 'debit',
})

const showForm = ref(false)

const typeOptions = [
  { label: 'Asset', value: 'Asset' },
  { label: 'Liability', value: 'Liability' },
  { label: 'Equity', value: 'Equity' },
  { label: 'Income', value: 'Income' },
  { label: 'Expense', value: 'Expense' },
]

const balanceOptions = [
  { label: 'Debit', value: 'debit' },
  { label: 'Credit', value: 'credit' },
]

async function createAccount() {
  try {
    await store.createAccount(newAccount.value)
    newAccount.value = { code: '', name: '', type: 'Asset', normal_balance: 'debit' }
    showForm.value = false
  } catch (e) {
    alert(e.message)
  }
}

onMounted(() => {
  store.fetchAccounts()
})
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Chart of Accounts</h1>
      <button @click="showForm = !showForm" class="btn-primary">
        <Plus class="w-4 h-4" />
        Add Account
      </button>
    </div>

    <!-- Add Form -->
    <div v-if="showForm" class="card p-6 mb-6 animate-fade-in">
      <h3 class="text-lg font-bold mb-4">New Account Details</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
        <div>
          <label class="block text-sm font-medium mb-1">Code</label>
          <input v-model="newAccount.code" placeholder="e.g. 1005" class="input-primary" />
        </div>
        <div class="lg:col-span-2">
          <label class="block text-sm font-medium mb-1">Account Name</label>
          <input
            v-model="newAccount.name"
            placeholder="Bank Name / Expense Type"
            class="input-primary"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Type</label>
          <SelectDropdown
            v-model="newAccount.type"
            :options="typeOptions"
            placeholder="Select Type"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Bal.</label>
          <SelectDropdown
            v-model="newAccount.normal_balance"
            :options="balanceOptions"
            placeholder="Select Balance"
          />
        </div>
      </div>
      <div class="mt-4 flex justify-end gap-2">
        <button @click="showForm = false" class="px-4 py-2 rounded text-gray-600 hover:bg-gray-100">
          Cancel
        </button>
        <button @click="createAccount" class="btn-primary">Save Account</button>
      </div>
    </div>

    <!-- List -->
    <div class="card overflow-x-auto">
      <div v-if="store.loading" class="p-8 text-center text-gray-500">Loading accounts...</div>
      <table v-else class="w-full text-left min-w-[600px] sm:min-w-0">
        <thead
          class="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 uppercase text-xs font-semibold"
        >
          <tr>
            <th class="px-6 py-4">Code</th>
            <th class="px-6 py-4">Account Name</th>
            <th class="px-6 py-4">Type</th>
            <th class="px-6 py-4">Normal Balance</th>
            <th class="px-6 py-4 text-right">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
          <tr
            v-for="acc in store.accounts"
            :key="acc.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
          >
            <td class="px-6 py-3 font-mono text-gray-500">{{ acc.code }}</td>
            <td class="px-6 py-3 font-medium text-gray-900 dark:text-white">{{ acc.name }}</td>
            <td class="px-6 py-3">
              <span
                :class="{
                  'bg-green-100 text-green-700': acc.type === 'Asset',
                  'bg-red-100 text-red-700': acc.type === 'Liability',
                  'bg-blue-100 text-blue-700': acc.type === 'Equity',
                  'bg-purple-100 text-purple-700': acc.type === 'Income',
                  'bg-orange-100 text-orange-700': acc.type === 'Expense',
                }"
                class="px-2 py-1 rounded-full text-xs font-bold"
              >
                {{ acc.type }}
              </span>
            </td>
            <td class="px-6 py-3 capitalize">{{ acc.normal_balance }}</td>
            <td class="px-6 py-3 text-right">
              <span class="text-green-600 text-xs font-bold">● Active</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
