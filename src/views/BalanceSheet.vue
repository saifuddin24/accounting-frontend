<script setup>
import { Printer, Scale, Search } from 'lucide-vue-next'
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAccountingStore } from '../stores/accounting'

const store = useAccountingStore()
const route = useRoute()
const router = useRouter()

const asOfDate = ref(new Date().toISOString().slice(0, 10))
const reportData = ref(null)

async function fetchData() {
  try {
    reportData.value = await store.fetchBalanceSheet(asOfDate.value)
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
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Balance Sheet</h1>
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

    <div
      v-if="reportData"
      class="grid grid-cols-1 lg:grid-cols-2 items-stretched gap-6 animate-fade-in"
    >
      <!-- Left Column: Assets -->
      <div class="card overflow-hidden flex flex-col">
        <div
          class="p-4 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800"
        >
          <h3 class="text-sm font-bold text-blue-800 dark:text-blue-300 uppercase tracking-widest">
            Assets
          </h3>
        </div>
        <div class="p-6 space-y-4 grow overflow-y-auto">
          <div
            v-for="asset in reportData.assets"
            :key="asset.account_code"
            class="flex justify-between items-start text-sm"
          >
            <div>
              <div class="text-gray-600 dark:text-gray-300">{{ asset.account_name }}</div>
              <div
                v-if="asset.restricted_amount > 0"
                class="text-[10px] text-orange-600 dark:text-orange-400 font-bold uppercase mt-0.5"
              >
                Restricted: {{ formatCurrency(asset.restricted_amount) }}
              </div>
            </div>
            <span class="font-medium text-gray-900 dark:text-white">{{
              formatCurrency(asset.amount)
            }}</span>
          </div>
        </div>
        <div
          class="px-6 py-7 bg-blue-50/50 dark:bg-blue-900/10 mt-auto border-t border-blue-100 dark:border-blue-800"
        >
          <!-- Breakdown Summary -->
          <div class="mb-4 pb-4 border-b border-blue-100 dark:border-blue-800/40 space-y-2">
            <div
              class="flex justify-between text-[10px] text-gray-500 uppercase font-black tracking-widest"
            >
              <span>General Assets</span>
              <span class="text-gray-900 dark:text-gray-300">{{
                formatCurrency(reportData.total_general_assets)
              }}</span>
            </div>
            <div
              class="flex justify-between text-[10px] text-orange-600 dark:text-orange-400 uppercase font-black tracking-widest"
            >
              <span>Restricted Assets</span>
              <span>{{ formatCurrency(reportData.total_restricted_assets) }}</span>
            </div>
          </div>

          <div class="flex justify-between items-center font-bold text-lg">
            <span class="text-gray-900 dark:text-white">Total Assets</span>
            <span class="text-blue-600 dark:text-blue-400 underline decoration-double">{{
              formatCurrency(reportData.total_assets)
            }}</span>
          </div>
        </div>
      </div>

      <!-- Right Column: Liabilities and Equity -->
      <div class="space-y-6">
        <!-- Liabilities -->
        <div class="card overflow-hidden">
          <div class="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-800">
            <h3 class="text-sm font-bold text-red-800 dark:text-red-300 uppercase tracking-widest">
              Liabilities
            </h3>
          </div>
          <div class="p-6 space-y-4">
            <div
              v-for="liab in reportData.liabilities"
              :key="liab.account_code"
              class="flex justify-between items-center text-sm"
            >
              <span class="text-gray-600 dark:text-gray-300">{{ liab.account_name }}</span>
              <span class="font-medium text-gray-900 dark:text-white">{{
                formatCurrency(liab.amount)
              }}</span>
            </div>
            <div
              v-if="reportData.liabilities.length === 0"
              class="text-center text-gray-400 italic text-sm"
            >
              No liabilities recorded.
            </div>
          </div>
          <div
            class="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30"
          >
            <div class="flex justify-between items-center font-bold">
              <span class="text-gray-900 dark:text-white text-sm">Total Liabilities</span>
              <span class="text-gray-900 dark:text-white">{{
                formatCurrency(reportData.total_liabilities)
              }}</span>
            </div>
          </div>
        </div>

        <!-- Equity -->
        <div class="card overflow-hidden">
          <div
            class="p-4 bg-purple-50 dark:bg-purple-900/20 border-b border-purple-100 dark:border-purple-800"
          >
            <h3
              class="text-sm font-bold text-purple-800 dark:text-purple-300 uppercase tracking-widest"
            >
              Equity
            </h3>
          </div>
          <div class="p-6 space-y-4">
            <div
              v-for="eq in reportData.equity"
              :key="eq.account_code"
              class="flex justify-between items-center text-sm"
            >
              <span
                :class="[
                  'text-gray-600 dark:text-gray-300',
                  eq.account_code === 'NET_INCOME' ? 'font-semibold italic' : '',
                ]"
                >{{ eq.account_name }}</span
              >
              <span class="font-medium text-gray-900 dark:text-white">{{
                formatCurrency(eq.amount)
              }}</span>
            </div>
          </div>
          <div
            class="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30"
          >
            <div class="flex justify-between items-center font-bold">
              <span class="text-gray-900 dark:text-white text-sm">Total Equity</span>
              <span class="text-gray-900 dark:text-white">{{
                formatCurrency(reportData.total_equity)
              }}</span>
            </div>
          </div>
        </div>

        <!-- Bottom Summary -->
        <div
          class="card p-6 border-2"
          :class="
            reportData.is_balanced
              ? 'border-green-100 bg-green-50 dark:border-green-900/30 dark:bg-green-900/10'
              : 'border-red-100 bg-red-50 dark:border-red-900/30 dark:bg-red-900/10'
          "
        >
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-3">
              <div
                :class="[
                  'p-2 rounded-full',
                  reportData.is_balanced
                    ? 'bg-green-200 text-green-800'
                    : 'bg-red-200 text-red-800 text-red-800',
                ]"
              >
                <Scale class="w-5 h-5" />
              </div>
              <span class="font-bold text-gray-900 dark:text-white"
                >Total Liabilities & Equity</span
              >
            </div>
            <span class="text-xl font-bold text-gray-900 dark:text-white">
              {{ formatCurrency(reportData.total_liabilities_and_equity) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
