<script setup>
import { AlertOctagon, CheckCircle, Printer, Search } from 'lucide-vue-next'
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAccountingStore } from '../stores/accounting'
import { formatDate } from '../utils/format'

const store = useAccountingStore()
const route = useRoute()
const router = useRouter()

const asOfDate = ref(new Date().toISOString().slice(0, 10))
const reportData = ref(null)

async function fetchData() {
  try {
    reportData.value = await store.fetchTrialBalance(asOfDate.value)
  } catch (e) {
    // Handled
  }
}

async function generateReport() {
  // Sync to URL - triggers watcher
  router.push({
    query: {
      date: asOfDate.value,
    },
  })
}

// Sync Route -> State
function syncStateFromQuery() {
  const query = route.query
  if (query.date) {
    asOfDate.value = query.date
    return true
  }
  return false
}

// Helper
const formatCurrency = (val) => Number(val).toLocaleString(undefined, { minimumFractionDigits: 2 })

watch(
  () => route.query,
  () => {
    syncStateFromQuery()
    fetchData()
  },
)

onMounted(() => {
  syncStateFromQuery()
  fetchData()
})
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Trial Balance</h1>
      <button class="btn-primary bg-gray-600 hover:bg-gray-700">
        <Printer class="w-4 h-4" /> Print
      </button>
    </div>

    <div class="card p-4 mb-6 flex items-end gap-4">
      <div>
        <label class="block text-sm font-medium mb-1">As of Date</label>
        <input type="date" v-model="asOfDate" class="input-primary w-48" />
      </div>
      <button @click="generateReport" class="btn-primary">
        <Search class="w-4 h-4" /> Run Report
      </button>
    </div>

    <div v-if="reportData" class="card overflow-x-auto animate-fade-in">
      <div class="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">
              Run Date: {{ formatDate(reportData.as_of) }}
            </h2>
          </div>
          <div>
            <span
              v-if="reportData.is_balanced"
              class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
            >
              <CheckCircle class="w-4 h-4 mr-2" /> Balanced
            </span>
            <span
              v-else
              class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800"
            >
              <AlertOctagon class="w-4 h-4 mr-2" /> Unbalanced
            </span>
          </div>
        </div>
      </div>

      <table class="w-full text-left text-sm min-w-[500px] sm:min-w-0">
        <thead
          class="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase font-semibold"
        >
          <tr>
            <th class="px-6 py-3">Code</th>
            <th class="px-6 py-3">Account Name</th>
            <th class="px-6 py-3 text-right">Debit</th>
            <th class="px-6 py-3 text-right">Credit</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
          <tr
            v-for="line in reportData.lines"
            :key="line.account_code"
            class="hover:bg-gray-50 dark:hover:bg-gray-700/50"
          >
            <td class="px-6 py-3 text-gray-500 font-mono">{{ line.account_code }}</td>
            <td class="px-6 py-3">
              <router-link
                :to="{
                  name: 'reports',
                  query: { account_id: line.account_id, end_date: reportData.as_of },
                }"
                class="font-medium text-primary-600 hover:underline cursor-pointer"
              >
                {{ line.account_name }}
              </router-link>
            </td>
            <td class="px-6 py-3 text-right">
              {{ line.debit ? formatCurrency(line.debit) : '-' }}
            </td>
            <td class="px-6 py-3 text-right">
              {{ line.credit ? formatCurrency(line.credit) : '-' }}
            </td>
          </tr>
        </tbody>
        <tfoot class="bg-gray-100 dark:bg-gray-700/50 font-bold text-gray-900 dark:text-white">
          <tr>
            <td colspan="2" class="px-6 py-3 text-right">Totals</td>
            <td class="px-6 py-3 text-right">{{ formatCurrency(reportData.total_debit) }}</td>
            <td class="px-6 py-3 text-right">{{ formatCurrency(reportData.total_credit) }}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>
