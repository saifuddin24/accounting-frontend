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
import { useAccountingStore } from '../stores/accounting'

const store = useAccountingStore()
const dashboardStats = ref(null)
const activeFY = ref(null)

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
  } catch (e) {
    // Handled
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
      <div
        v-for="i in 4"
        :key="i"
        class="card p-6 h-32 animate-pulse bg-gray-50 dark:bg-gray-800/50"
      ></div>
    </div>

    <!-- Fiscal Year Info -->
    <div
      v-if="activeFY"
      class="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800 rounded-xl p-4 mb-8 flex items-center justify-between animate-fade-in"
    >
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center text-indigo-600"
        >
          <Calendar class="w-5 h-5" />
        </div>
        <div>
          <p
            class="text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider"
          >
            Active Fiscal Period
          </p>
          <p class="text-lg font-bold text-gray-900 dark:text-white">
            {{ activeFY.name }}
            <span class="text-sm font-normal text-gray-500"
              >({{ activeFY.start_date }} to {{ activeFY.end_date }})</span
            >
          </p>
        </div>
      </div>
      <router-link
        to="/settings"
        class="text-indigo-600 hover:text-indigo-700 text-sm font-bold flex items-center gap-1"
      >
        Change in Settings <ArrowRight class="w-4 h-4" />
      </router-link>
    </div>
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
      <div
        v-for="i in 4"
        :key="i"
        class="card p-6 h-32 animate-pulse bg-gray-50 dark:bg-gray-800/50"
      ></div>
    </div>

    <!-- Recent Activity Area -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="card p-6 lg:col-span-2">
        <h3 class="text-lg font-bold mb-6 text-gray-900 dark:text-white">
          Revenue vs Expenses (Last 6 Months)
        </h3>

        <div v-if="dashboardStats" class="h-64 flex items-end justify-between gap-4 px-2">
          <div
            v-for="item in dashboardStats.chart_data"
            :key="item.month"
            class="flex-1 flex flex-col items-center group relative"
          >
            <!-- Revenue Bar -->
            <div class="flex items-end gap-1 w-full justify-center h-48">
              <div
                :style="{
                  height: `${(item.revenue / Math.max(...dashboardStats.chart_data.map((d) => Math.max(d.revenue, d.expenses)), 1)) * 100}%`,
                }"
                class="w-4 bg-green-500 rounded-t-sm transition-all duration-500 hover:bg-green-600 cursor-help"
              >
                <div
                  class="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 transition-opacity"
                >
                  Rev: {{ formatCurrency(item.revenue) }}
                </div>
              </div>
              <!-- Expense Bar -->
              <div
                :style="{
                  height: `${(item.expenses / Math.max(...dashboardStats.chart_data.map((d) => Math.max(d.revenue, d.expenses)), 1)) * 100}%`,
                }"
                class="w-4 bg-red-400 rounded-t-sm transition-all duration-500 hover:bg-red-500 cursor-help"
              >
                <div
                  class="absolute -top-16 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 transition-opacity"
                >
                  Exp: {{ formatCurrency(item.expenses) }}
                </div>
              </div>
            </div>
            <span class="mt-4 text-xs font-medium text-gray-500 uppercase">{{ item.month }}</span>
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
        </div>
      </div>
    </div>
  </div>
</template>
