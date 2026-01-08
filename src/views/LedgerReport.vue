<script setup>
import { Download, Printer, Search } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import { useAccountingStore } from '../stores/accounting'

const store = useAccountingStore()

const filters = ref({
  account_id: '',
  start_date: new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10), // Jan 1st
  end_date: new Date().toISOString().slice(0, 10),
})

const reportData = ref(null)

async function generateReport() {
  if (!filters.value.account_id) return
  try {
    reportData.value = await store.fetchLedger(
      filters.value.account_id,
      filters.value.start_date,
      filters.value.end_date,
    )
  } catch (e) {
    // Error handled in store
  }
}

// Helpers
const formatCurrency = (val) => Number(val).toLocaleString(undefined, { minimumFractionDigits: 2 })

onMounted(() => {
  store.fetchAccounts()
})
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">General Ledger</h1>
      <div class="flex gap-2">
        <button class="btn-primary bg-gray-600 hover:bg-gray-700">
          <Printer class="w-4 h-4" /> Print
        </button>
      </div>
    </div>

    <!-- Filter Card -->
    <div class="card p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div class="md:col-span-2">
          <label class="block text-sm font-medium mb-1">Select Account</label>
          <select v-model="filters.account_id" class="input-primary">
            <option value="" disabled>Choose an account to view...</option>
            <option v-for="acc in store.accounts" :key="acc.id" :value="acc.id">
              {{ acc.code }} - {{ acc.name }} ({{ acc.type }})
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">From Date</label>
          <input type="date" v-model="filters.start_date" class="input-primary" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">To Date</label>
          <input type="date" v-model="filters.end_date" class="input-primary" />
        </div>
      </div>
      <div class="mt-4 text-right">
        <button @click="generateReport" class="btn-primary inline-flex">
          <Search class="w-4 h-4" />
          Generate Ledger
        </button>
      </div>
    </div>

    <!-- Report Content -->
    <div v-if="reportData" class="card overflow-hidden animate-fade-in">
      <div
        class="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700/30"
      >
        <div>
          <h2 class="text-xl font-bold text-primary-700 dark:text-primary-400">
            {{ reportData.account.name }}
          </h2>
          <p class="text-sm text-gray-500">
            Code: {{ reportData.account.code }} | Period: {{ reportData.period.start }} to
            {{ reportData.period.end }}
          </p>
        </div>
        <div class="text-right">
          <p class="text-sm text-gray-500">Closing Balance</p>
          <p
            class="text-2xl font-bold"
            :class="
              reportData.closing_balance >= 0 ? 'text-gray-900 dark:text-white' : 'text-red-600'
            "
          >
            {{ formatCurrency(reportData.closing_balance) }}
          </p>
        </div>
      </div>

      <table class="w-full text-left text-sm">
        <thead
          class="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase font-semibold"
        >
          <tr>
            <th class="px-6 py-3">Date</th>
            <th class="px-6 py-3">Ref #</th>
            <th class="px-6 py-3">Opposite Account</th>
            <th class="px-6 py-3">Description</th>
            <th class="px-6 py-3 text-right">Debit</th>
            <th class="px-6 py-3 text-right">Credit</th>
            <th class="px-6 py-3 text-right bg-gray-200 dark:bg-gray-600">Balance</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
          <!-- Opening Balance Row -->
          <tr class="bg-yellow-50 dark:bg-yellow-900/10 font-medium">
            <td class="px-6 py-3" colspan="4">Opening Balance</td>
            <td class="px-6 py-3 text-right">-</td>
            <td class="px-6 py-3 text-right">-</td>
            <td class="px-6 py-3 text-right bg-yellow-100 dark:bg-yellow-900/20">
              {{ formatCurrency(reportData.opening_balance) }}
            </td>
          </tr>

          <!-- Transactions -->
          <tr
            v-for="line in reportData.lines"
            :key="line.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-700/50"
          >
            <td class="px-6 py-3 text-gray-500">{{ line.date }}</td>
            <td class="px-6 py-3 text-primary-600 cursor-pointer hover:underline">
              {{ line.entry_number }}
            </td>
            <td class="px-6 py-3 italic text-gray-600 dark:text-gray-400">
              {{ line.opposite_account }}
            </td>
            <td class="px-6 py-3">{{ line.description }}</td>
            <td class="px-6 py-3 text-right">
              {{ line.debit > 0 ? formatCurrency(line.debit) : '-' }}
            </td>
            <td class="px-6 py-3 text-right">
              {{ line.credit > 0 ? formatCurrency(line.credit) : '-' }}
            </td>
            <td class="px-6 py-3 text-right font-bold bg-gray-50 dark:bg-gray-800/50">
              {{ formatCurrency(line.balance) }}
            </td>
          </tr>

          <tr v-if="reportData.lines.length === 0">
            <td colspan="7" class="px-6 py-8 text-center text-gray-500">
              No transactions found in this period.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else-if="filters.account_id && !store.loading" class="text-center py-10 text-gray-500">
      Click "Generate" to view the report.
    </div>
  </div>
</template>
