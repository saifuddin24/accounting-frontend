<script setup>
import {
  Activity,
  ArrowRight,
  Calendar,
  DollarSign,
  TrendingDown,
  TrendingUp,
} from 'lucide-vue-next'
import { onMounted, ref } from 'vue'
import SkeletonCard from '../components/ui/SkeletonCard.vue'
import SkeletonTable from '../components/ui/SkeletonTable.vue'
import { useAccountingStore } from '../stores/accounting'
import { formatDate } from '../utils/format'

const store = useAccountingStore()
const dashboardStats = ref(null)
const activeFY = ref(null)
const recentJournals = ref([])
const topAccounts = ref([])

const stats = ref([
  {
    title: 'Total Assets',
    key: 'total_assets',
    trendKey: 'revenue',
    color: 'text-blue-600',
    icon: DollarSign,
    bg: 'bg-blue-100',
  },
  {
    title: 'Total Revenue',
    key: 'total_revenue',
    trendKey: 'revenue',
    color: 'text-green-600',
    icon: TrendingUp,
    bg: 'bg-green-100',
  },
  {
    title: 'Total Expenses',
    key: 'total_expenses',
    trendKey: 'expenses',
    color: 'text-red-600',
    icon: TrendingDown,
    bg: 'bg-red-100',
  },
  {
    title: 'Net Profit',
    key: 'net_profit',
    trendKey: 'profit',
    color: 'text-primary-600',
    icon: Activity,
    bg: 'bg-primary-100',
  },
])

async function loadData() {
  try {
    dashboardStats.value = await store.fetchDashboardStats()
    const fies = await store.fetchFiscalYears()
    const activeFYId = localStorage.getItem('fiscal_year_id')
    activeFY.value =
      fies.find((f) => f.id == activeFYId) || fies.find((f) => !f.is_closed) || fies[0]

    // Fetch recent journals (last 5)
    const journalsData = await store.fetchJournals({ per_page: 5 })
    recentJournals.value = journalsData.data || []

    // Fetch Trial Balance to get actual account balances
    const tbData = await store.fetchTrialBalance(new Date().toISOString().slice(0, 10))
    topAccounts.value = (tbData.lines || []).slice(0, 5)
  } catch (e) {
    console.error(e)
  }
}

const formatCurrency = (val) =>
  Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })

onMounted(() => {
  loadData()
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Dashboard Overview</h1>

    <!-- Stats Grid -->
    <div
      v-if="dashboardStats"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in"
    >
      <div
        v-for="stat in stats"
        :key="stat.title"
        class="card p-6 flex items-start justify-between"
      >
        <div>
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{{ stat.title }}</p>
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white">
            ৳ {{ formatCurrency(dashboardStats[stat.key]) }}
          </h3>
          <span
            :class="
              dashboardStats.trends[stat.trendKey].startsWith('+')
                ? 'text-green-500 bg-green-50 dark:bg-green-900/10'
                : 'text-red-500 bg-red-50 dark:bg-red-900/10'
            "
            class="text-xs font-bold px-2 py-1 rounded inline-block mt-2"
          >
            {{ dashboardStats.trends[stat.trendKey] }} vs Last Month
          </span>
        </div>
        <div :class="[stat.bg, stat.color]" class="p-3 rounded-xl">
          <component :is="stat.icon" class="w-6 h-6" />
        </div>
      </div>
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <SkeletonCard v-for="i in 4" :key="i" />
    </div>

    <!-- Fiscal Year Info -->
    <div
      v-if="activeFY"
      class="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800 rounded-xl p-4 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in"
    >
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center text-indigo-600 flex-shrink-0"
        >
          <Calendar class="w-5 h-5" />
        </div>
        <div>
          <p
            class="text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider"
          >
            Active Fiscal Period
          </p>
          <div
            class="text-lg font-bold text-gray-900 dark:text-white flex flex-col sm:flex-row sm:items-baseline sm:gap-2"
          >
            {{ activeFY.name }}
            <span class="text-sm font-normal text-gray-500"
              >({{ formatDate(activeFY.start_date) }} to {{ formatDate(activeFY.end_date) }})</span
            >
          </div>
        </div>
      </div>
      <router-link
        to="/settings"
        class="text-indigo-600 hover:text-indigo-700 text-sm font-bold flex items-center gap-1 sm:justify-end"
      >
        Change in Settings <ArrowRight class="w-4 h-4" />
      </router-link>
    </div>

    <!-- Recent Activity Area -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="card p-6 lg:col-span-2">
        <h3 class="text-lg font-bold mb-6 text-gray-900 dark:text-white">
          Revenue vs Expenses (Last 6 Months)
        </h3>

        <div v-if="dashboardStats" class="h-64 flex items-end justify-between gap-2 sm:gap-4 px-2">
          <div
            v-for="item in dashboardStats.chart_data"
            :key="item.month"
            class="flex-1 flex flex-col items-center group relative h-full justify-end"
          >
            <!-- Revenue Bar -->
            <div class="flex items-end gap-1 w-full justify-center h-full pb-8">
              <div
                :style="{
                  height: `${(item.revenue / Math.max(...dashboardStats.chart_data.map((d) => Math.max(d.revenue, d.expenses)), 1)) * 100}%`,
                }"
                class="w-3 sm:w-5 bg-gradient-to-t from-green-600 to-green-400 rounded-t-md transition-all duration-500 hover:scale-x-110 cursor-help relative"
              >
                <div
                  class="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-gray-100 dark:text-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-20 transition-opacity font-bold shadow-xl pointer-events-none"
                >
                  Revenue: {{ formatCurrency(item.revenue) }}
                </div>
              </div>
              <!-- Expense Bar -->
              <div
                :style="{
                  height: `${(item.expenses / Math.max(...dashboardStats.chart_data.map((d) => Math.max(d.revenue, d.expenses)), 1)) * 100}%`,
                }"
                class="w-3 sm:w-5 bg-gradient-to-t from-red-500 to-red-300 rounded-t-md transition-all duration-500 hover:scale-x-110 cursor-help relative"
              >
                <div
                  class="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-gray-100 dark:text-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-20 transition-opacity font-bold shadow-xl pointer-events-none"
                >
                  Expense: {{ formatCurrency(item.expenses) }}
                </div>
              </div>
            </div>
            <span
              class="absolute bottom-0 text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-tighter"
              >{{ item.month }}</span
            >
          </div>
        </div>
        <!-- Legend -->
        <div v-if="dashboardStats" class="mt-6 flex justify-center gap-6 text-xs font-semibold">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 bg-green-500 rounded-sm"></div>
            <span class="text-gray-600 dark:text-gray-400">Revenue</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 bg-red-400 rounded-sm"></div>
            <span class="text-gray-600 dark:text-gray-400">Expenses</span>
          </div>
        </div>
        <div v-else class="h-64 bg-gray-50 dark:bg-gray-800/50 rounded animate-pulse"></div>
      </div>

      <div class="card p-6">
        <h3 class="text-lg font-bold mb-6 text-gray-900 dark:text-white">Quick Actions</h3>
        <div class="space-y-4">
          <router-link
            to="/journals/create"
            class="flex items-center p-4 border border-gray-100 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all hover:scale-[1.02] group"
          >
            <div
              class="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mr-4 group-hover:rotate-12 transition-transform"
            >
              <i class="text-xl font-bold">+</i>
            </div>
            <div>
              <p class="font-bold text-gray-900 dark:text-white">New Journal Entry</p>
              <p class="text-xs text-gray-500 mt-0.5">Record a standard transaction</p>
            </div>
          </router-link>

          <router-link
            to="/accounts"
            class="flex items-center p-4 border border-gray-100 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all hover:scale-[1.02] group"
          >
            <div
              class="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mr-4 group-hover:rotate-12 transition-transform"
            >
              <i class="text-xl font-bold">A</i>
            </div>
            <div>
              <p class="font-bold text-gray-900 dark:text-white">Chart of Accounts</p>
              <p class="text-xs text-gray-500 mt-0.5">Manage your ledger heads</p>
            </div>
          </router-link>

          <!-- Account Summary -->
          <div class="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
            <h4 class="text-sm font-bold text-gray-400 uppercase mb-4 px-1">Top Accounts</h4>
            <div class="space-y-3">
              <div
                v-for="acc in topAccounts"
                :key="acc.id"
                class="flex justify-between items-center text-sm p-1 rounded hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div class="flex items-center gap-2">
                  <span class="text-[10px] font-mono text-gray-400">{{ acc.account_code }}</span>
                  <span class="text-gray-700 dark:text-gray-300">{{ acc.account_name }}</span>
                </div>
                <span class="font-bold text-gray-900 dark:text-white">
                  ৳ {{ formatCurrency(acc.debit || acc.credit) }}
                  <span class="text-[10px] font-normal text-gray-400">{{
                    acc.debit ? 'Dr' : 'Cr'
                  }}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Transactions -->
    <div class="mt-8">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white">Recent Transactions</h3>
        <router-link to="/journals" class="text-sm text-primary-600 hover:underline"
          >View All</router-link
        >
      </div>
      <div class="card overflow-x-auto">
        <SkeletonTable v-if="recentJournals.length === 0 && !dashboardStats" :rows="5" :cols="5" />
        <table v-else class="w-full text-left text-sm min-w-[600px]">
          <thead
            class="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 uppercase text-xs font-semibold"
          >
            <tr>
              <th class="px-6 py-4">Date</th>
              <th class="px-6 py-4">Journal #</th>
              <th class="px-6 py-4">Description</th>
              <th class="px-6 py-4 text-right">Amount</th>
              <th class="px-6 py-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
            <tr
              v-for="entry in recentJournals"
              :key="entry.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              <td class="px-6 py-4 whitespace-nowrap text-gray-500">
                {{ formatDate(entry.date) }}
              </td>
              <td class="px-6 py-4 font-mono text-primary-600 font-bold">
                {{ entry.entry_number }}
              </td>
              <td class="px-6 py-4 text-gray-900 dark:text-white">{{ entry.description }}</td>
              <td class="px-6 py-4 text-right font-bold text-gray-900 dark:text-white">
                ৳ {{ formatCurrency(entry.total_amount) }}
              </td>
              <td class="px-6 py-4 text-right">
                <span
                  class="px-2 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700 uppercase"
                >
                  {{ entry.status }}
                </span>
              </td>
            </tr>
            <tr v-if="recentJournals.length === 0 && dashboardStats">
              <td colspan="5" class="px-6 py-10 text-center text-gray-500">
                No recent transactions found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
