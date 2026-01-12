<script setup>
import { api } from '@/utils/api'
import { Calendar, ChevronDown } from 'lucide-vue-next'
import { onMounted, ref } from 'vue'

const fiscalYears = ref([])
const selectedId = ref(localStorage.getItem('fiscal_year_id'))
const isLoading = ref(false)

async function fetchFiscalYears() {
  isLoading.value = true
  try {
    const data = await api.get('/api/v1/fiscal-years')
    fiscalYears.value = data

    // Auto-select first active one if none selected
    if (!selectedId.value && data.length > 0) {
      const active = data.find((fy) => !fy.is_closed) || data[0]
      selectFiscalYear(active.id)
    }
  } catch (error) {
    console.error('Failed to fetch fiscal years:', error)
  } finally {
    isLoading.value = false
  }
}

function selectFiscalYear(id) {
  selectedId.value = id
  localStorage.setItem('fiscal_year_id', id)
  isOpen.value = false
  window.location.reload() // Reload to update all reports
}

onMounted(() => {
  fetchFiscalYears()
})

const getSelectedFYName = () => {
  const fy = fiscalYears.value.find((f) => f.id == selectedId.value)
  return fy ? fy.name : 'Select Period'
}

const isOpen = ref(false)
const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

// Close dropdown when clicking outside
onMounted(() => {
  window.addEventListener('click', (e) => {
    if (!e.target.closest('.fy-selector-container')) {
      isOpen.value = false
    }
  })
})
</script>

<template>
  <div class="relative fy-selector-container">
    <button
      @click="toggleDropdown"
      class="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
    >
      <Calendar class="w-4 h-4 text-indigo-500" />
      <span class="hidden sm:inline">{{ getSelectedFYName() }}</span>
      <ChevronDown
        class="w-4 h-4 text-gray-400 transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
      />
    </button>

    <div
      v-if="isOpen"
      class="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50 animate-in fade-in zoom-in duration-200"
    >
      <div v-if="isLoading" class="px-4 py-2 text-xs text-gray-500">Loading periods...</div>
      <button
        v-for="fy in fiscalYears"
        :key="fy.id"
        @click="selectFiscalYear(fy.id)"
        class="w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center justify-between"
        :class="{ 'text-indigo-600 font-bold': selectedId == fy.id }"
      >
        <span>{{ fy.name }}</span>
        <span v-if="fy.is_closed" class="text-[10px] bg-red-100 text-red-600 px-1 rounded"
          >Closed</span
        >
      </button>
      <div v-if="fiscalYears.length === 0 && !isLoading" class="px-4 py-2 text-xs text-red-500">
        No fiscal years found
      </div>
    </div>
  </div>
</template>
