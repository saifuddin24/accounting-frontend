<script setup>
import { format } from 'date-fns'
import { ArrowUpDown, Plus, Search } from 'lucide-vue-next'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAccountingStore } from '../stores/accounting'

const store = useAccountingStore()
const route = useRoute()
const router = useRouter()

// View State (Driven by Route now)
const viewMode = ref('summary')
const searchQuery = ref('')
const currentPage = ref(1)
const totalPages = ref(1)
const sortBy = ref('date')
const sortOrder = ref('desc')

// Data
const detailedLines = ref([])

// Computed for Row Spanning
// Computed for Row Spanning

const processedDetailedLines = computed(() => {
  const lines = detailedLines.value
  if (!lines.length) return []

  // Map to add display properties
  const result = lines.map((line) => ({
    ...line,
    dateRowSpan: 0,
    descRowSpan: 0,
    showDate: false,
    showDesc: false,
  }))

  for (let i = 0; i < result.length; i++) {
    const current = result[i]

    // If it's the first line or different entry than previous, start a new span
    if (i === 0 || current.entry_number !== result[i - 1].entry_number) {
      current.showDate = true
      current.showDesc = true
      current.dateRowSpan = 1
      current.descRowSpan = 1

      // Look ahead to count duplicates for adjacency
      for (let j = i + 1; j < result.length; j++) {
        if (result[j].entry_number === current.entry_number) {
          current.dateRowSpan++
          current.descRowSpan++
        } else {
          break
        }
      }
    }
  }
  return result
})

// Helpers
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return format(new Date(dateStr), 'dd-MM-yyyy')
}
const formatCurrency = (val) => Number(val).toLocaleString(undefined, { minimumFractionDigits: 2 })

// Core Fetch Logic
async function fetchData() {
  const params = {
    page: currentPage.value,
    search: searchQuery.value,
    sort_by: sortBy.value,
    sort_order: sortOrder.value,
    per_page: 20,
  }

  if (viewMode.value === 'summary') {
    const res = await store.fetchJournals(params)
    if (res) {
      totalPages.value = res.last_page
      currentPage.value = res.current_page
    }
  } else {
    const res = await store.fetchJournalLines(params)
    if (res) {
      detailedLines.value = res.data
      totalPages.value = res.last_page
      currentPage.value = res.current_page
    }
  }
}

// Sync Route -> State
function syncStateFromQuery() {
  const query = route.query
  viewMode.value = query.mode || 'summary'
  currentPage.value = parseInt(query.page) || 1
  searchQuery.value = query.search || ''
  sortBy.value = query.sort || 'date'
  sortOrder.value = query.order || 'desc'
}

// Actions
function setViewMode(mode) {
  viewMode.value = mode
  currentPage.value = 1 // Reset page on mode switch
  router.push({ query: { ...route.query, mode: mode, page: 1 } })
}

function handleSearch() {
  currentPage.value = 1
  router.push({ query: { ...route.query, page: 1, search: searchQuery.value || undefined } })
}

function handleSort(column) {
  if (sortBy.value === column) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = column
    sortOrder.value = 'desc'
  }
  router.push({ query: { ...route.query, sort: sortBy.value, order: sortOrder.value } })
}

function changePage(newPage) {
  if (newPage < 1 || newPage > totalPages.value) return
  currentPage.value = newPage
  router.push({ query: { ...route.query, page: newPage } })
}

watch(
  () => route.query,
  () => {
    syncStateFromQuery()
    fetchData()
  },
)

onMounted(() => {
  // If URL is empty, set defaults (which will trigger watcher -> fetch)
  if (Object.keys(route.query).length === 0) {
    router.replace({ query: { mode: 'summary', page: 1 } })
  } else {
    // URL has params, sync and fetch immediately
    syncStateFromQuery()
    fetchData()
  }
})
</script>

<template>
  <div>
    <!-- ... Header & Toolbar ... -->
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Journal History</h1>
        <div class="text-sm text-gray-500">View and manage posted transactions</div>
      </div>
      <div class="flex gap-2">
        <router-link to="/journals/create" class="btn-primary">
          <Plus class="w-4 h-4" /> New Entry
        </router-link>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="card p-4 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
      <!-- View Mode Switch -->
      <div class="flex bg-gray-100 dark:bg-gray-700 rounded p-1">
        <button
          @click="setViewMode('summary')"
          :class="
            viewMode === 'summary'
              ? 'bg-white dark:bg-gray-600 shadow text-primary-600'
              : 'text-gray-500'
          "
          class="px-4 py-1.5 rounded text-sm font-medium transition"
        >
          Summary
        </button>
        <button
          @click="setViewMode('detailed')"
          :class="
            viewMode === 'detailed'
              ? 'bg-white dark:bg-gray-600 shadow text-primary-600'
              : 'text-gray-500'
          "
          class="px-4 py-1.5 rounded text-sm font-medium transition"
        >
          Detailed Lines
        </button>
      </div>

      <!-- Search -->
      <div class="relative w-full md:w-64">
        <Search class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          v-model.lazy="searchQuery"
          @change="handleSearch"
          @keyup.enter="handleSearch"
          placeholder="Search description/ref..."
          class="input-primary pl-10"
        />
        <div class="absolute -bottom-3 right-0 text-[10px] text-gray-400">
          Press <span class="font-bold">Enter</span> to search
        </div>
      </div>
    </div>

    <!-- LOADING STATE -->
    <div v-if="store.loading" class="py-12 text-center text-gray-500">
      <div
        class="inline-block animate-spin w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full mb-2"
      ></div>
      <p>Loading data...</p>
    </div>

    <!-- SUMMARY VIEW -->
    <div v-else-if="viewMode === 'summary'" class="card overflow-hidden animate-fade-in">
      <table class="w-full text-left text-sm">
        <thead
          class="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 uppercase font-semibold"
        >
          <tr>
            <th
              @click="handleSort('date')"
              class="px-6 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <div class="flex items-center gap-1">
                Date <ArrowUpDown class="w-4 h-4 text-gray-400" />
              </div>
            </th>
            <th
              @click="handleSort('entry_number')"
              class="px-6 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <div class="flex items-center gap-1 whitespace-nowrap">
                Ref # <ArrowUpDown class="w-4 h-4 text-gray-400" />
              </div>
            </th>
            <th class="px-6 py-3">Description</th>
            <th
              @click="handleSort('total_amount')"
              class="px-6 py-3 text-right cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <div class="flex items-center justify-end gap-1">
                Amount <ArrowUpDown class="w-4 h-4 text-gray-400" />
              </div>
            </th>
            <th class="px-6 py-3 text-right">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
          <tr
            v-for="entry in store.journals.data || []"
            :key="entry.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-700/50"
          >
            <td class="px-6 py-3 whitespace-nowrap">{{ formatDate(entry.date) }}</td>
            <td class="px-6 py-3 font-mono text-primary-600">{{ entry.entry_number }}</td>
            <td class="px-6 py-3 min-w-[200px]">{{ entry.description }}</td>
            <td class="px-6 py-3 text-right font-medium whitespace-nowrap">
              {{ formatCurrency(entry.total_amount) }}
            </td>
            <td class="px-6 py-3 text-right">
              <span
                class="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 capitalize"
              >
                {{ entry.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="!store.journals.data?.length" class="p-8 text-center text-gray-500">
        No entries found.
      </div>
    </div>

    <!-- DETAILED VIEW -->
    <div v-else-if="viewMode === 'detailed'" class="card overflow-hidden animate-fade-in">
      <table class="w-full text-left text-sm border-collapse">
        <thead
          class="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 uppercase font-semibold border-b dark:border-gray-700"
        >
          <tr>
            <th
              @click="handleSort('date')"
              class="px-6 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 w-32"
            >
              <div class="flex items-center gap-1">
                Date <ArrowUpDown class="w-4 h-4 text-gray-400" />
              </div>
            </th>
            <th class="px-6 py-3 w-1/3">Description</th>
            <th class="px-6 py-3">Ref / Account</th>
            <th
              @click="handleSort('amount')"
              class="px-6 py-3 text-right cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <div class="flex items-center justify-end gap-1">
                Debit <ArrowUpDown class="w-4 h-4 text-gray-400" />
              </div>
            </th>
            <th class="px-6 py-3 text-right">Credit</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
          <tr
            v-for="line in processedDetailedLines"
            :key="line.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-700/50"
          >
            <!-- Date Column with RowSpan -->
            <td
              v-if="line.showDate"
              :rowspan="line.dateRowSpan"
              class="px-6 py-3 text-gray-500 whitespace-nowrap border-r border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 align-top"
            >
              {{ formatDate(line.date) }}
            </td>

            <!-- Description Column with RowSpan (Swapped Position) -->
            <td
              v-if="line.showDesc"
              :rowspan="line.descRowSpan"
              class="px-6 py-3 border-r border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 align-top min-w-[200px]"
            >
              <div class="text-gray-900 dark:text-gray-100 font-medium">
                {{ line.entry_description }}
              </div>
              <div class="font-mono text-xs text-gray-400 mt-1">{{ line.entry_number }}</div>
            </td>

            <!-- Account Column -->
            <td class="px-6 py-3">
              <div class="font-bold text-primary-700 text-sm">{{ line.account_name }}</div>
              <div class="text-xs text-gray-400">{{ line.account_code }}</div>
              <div v-if="line.description" class="text-xs text-gray-500 italic mt-0.5">
                {{ line.description }}
              </div>
            </td>

            <!-- Debit/Credit -->
            <td class="px-6 py-3 text-right text-gray-700 dark:text-gray-300 font-medium">
              {{ Number(line.debit) > 0 ? formatCurrency(line.debit) : '-' }}
            </td>
            <td class="px-6 py-3 text-right text-gray-700 dark:text-gray-300 font-medium">
              {{ Number(line.credit) > 0 ? formatCurrency(line.credit) : '-' }}
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="!detailedLines.length" class="p-8 text-center text-gray-500">No lines found.</div>
    </div>

    <!-- Pagination -->
    <div class="flex flex-col sm:flex-row justify-between items-center mt-4 px-2 gap-4">
      <span class="text-sm text-gray-500">Page {{ currentPage }} of {{ totalPages || 1 }}</span>
      <div class="flex gap-2">
        <button
          @click="changePage(currentPage - 1)"
          :disabled="currentPage <= 1 || store.loading"
          class="btn-primary bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
        >
          Prev
        </button>
        <button
          @click="changePage(currentPage + 1)"
          :disabled="currentPage >= totalPages || store.loading"
          class="btn-primary bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>
