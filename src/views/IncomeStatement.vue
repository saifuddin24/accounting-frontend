<script setup>
import { Printer, Search, TrendingDown, TrendingUp } from 'lucide-vue-next'
import { onMounted, ref } from 'vue'
import { useAccountingStore } from '../stores/accounting'
import { formatDate } from '../utils/format'

const store = useAccountingStore()

// Default to current month
const now = new Date()
const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10)

const startDate = ref(startOfMonth)
const endDate = ref(endOfMonth)
const reportData = ref(null)

async function generateReport() {
  try {
    reportData.value = await store.fetchIncomeStatement(startDate.value, endDate.value)
  } catch (e) {
    // Handled
  }
}

const formatCurrency = (val) => Number(val).toLocaleString(undefined, { minimumFractionDigits: 2 })

onMounted(() => {
  generateReport()
})
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Income Statement</h1>
      <button class="btn-primary bg-gray-600 hover:bg-gray-700">
        <Printer class="w-4 h-4" /> Print
      </button>
    </div>

    <div class="card p-4 mb-6 flex items-end gap-4">
      <div>
        <label class="block text-sm font-medium mb-1">Start Date</label>
        <input type="date" v-model="startDate" class="input-primary w-48" />
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">End Date</label>
        <input type="date" v-model="endDate" class="input-primary w-48" />
      </div>
      <button @click="generateReport" class="btn-primary">
        <Search class="w-4 h-4" /> Run Report
      </button>
    </div>

    <div
      v-if="reportData"
      class="card overflow-hidden animate-fade-in divide-y divide-gray-100 dark:divide-gray-700"
    >
      <!-- Header -->
      <div class="p-6 bg-gray-50 dark:bg-gray-700/30">
        <h3
          class="text-lg font-semibold text-gray-900 dark:text-white text-center uppercase tracking-wider"
        >
          Income Statement
        </h3>
        <p class="text-sm text-gray-500 text-center mt-1">
          For the period {{ formatDate(reportData.period.start) }} to
          {{ formatDate(reportData.period.end) }}
        </p>
      </div>

      <!-- Revenues -->
      <div class="p-6">
        <h4 class="text-sm font-bold text-gray-400 uppercase mb-4">Revenues</h4>
        <div class="space-y-3">
          <div
            v-for="rev in reportData.revenues"
            :key="rev.account_code"
            class="flex justify-between items-center text-sm"
          >
            <span class="text-gray-600 dark:text-gray-300">{{ rev.account_name }}</span>
            <span class="font-medium text-gray-900 dark:text-white">{{
              formatCurrency(rev.amount)
            }}</span>
          </div>
        </div>
        <div
          class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between font-bold"
        >
          <span>Total Revenues</span>
          <span class="text-blue-600 dark:text-blue-400 underline decoration-double">{{
            formatCurrency(reportData.total_revenues)
          }}</span>
        </div>
      </div>

      <!-- Expenses -->
      <div class="p-6 bg-gray-50/50 dark:bg-gray-800/30">
        <h4 class="text-sm font-bold text-gray-400 uppercase mb-4">Expenses</h4>
        <div class="space-y-3">
          <div
            v-for="exp in reportData.expenses"
            :key="exp.account_code"
            class="flex justify-between items-center text-sm"
          >
            <span class="text-gray-600 dark:text-gray-300">{{ exp.account_name }}</span>
            <span class="font-medium text-gray-900 dark:text-white">{{
              formatCurrency(exp.amount)
            }}</span>
          </div>
        </div>
        <div
          class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between font-bold"
        >
          <span>Total Expenses</span>
          <span>({{ formatCurrency(reportData.total_expenses) }})</span>
        </div>
      </div>

      <!-- Net Income -->
      <div class="p-6 bg-gray-100/50 dark:bg-gray-700/50">
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-3">
            <div
              :class="[
                'p-2 rounded-lg',
                reportData.net_income >= 0
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700',
              ]"
            >
              <TrendingUp v-if="reportData.net_income >= 0" class="w-5 h-5" />
              <TrendingDown v-else class="w-5 h-5" />
            </div>
            <span class="text-lg font-bold text-gray-900 dark:text-white">Net Profit / Loss</span>
          </div>
          <span
            :class="[
              'text-2xl font-bold',
              reportData.net_income >= 0
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400',
            ]"
          >
            {{ formatCurrency(reportData.net_income) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
