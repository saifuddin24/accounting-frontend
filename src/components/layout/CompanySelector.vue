<script setup>
import { api } from '@/utils/api'
import { Building2, ChevronDown } from 'lucide-vue-next'
import { onMounted, ref } from 'vue'

const companies = ref([])
const selectedId = ref(localStorage.getItem('company_id'))
const isLoading = ref(false)

const emit = defineEmits(['change'])

async function fetchCompanies() {
  isLoading.value = true
  try {
    companies.value = await api.get('/api/v1/companies')
    // If no company selected but we have companies, and we want to force select?
    // User said "take user input... before everything shows".
  } catch (error) {
    console.error('Failed to fetch companies:', error)
  } finally {
    isLoading.value = false
  }
}

function selectCompany(id) {
  selectedId.value = id
  localStorage.setItem('company_id', id)
  emit('change', id)
  // Optional: reload to clear states? or just update through provides/injects
  window.location.reload()
}

onMounted(() => {
  fetchCompanies()
})

const getSelectedCompanyName = () => {
  const company = companies.value.find((c) => c.id == selectedId.value)
  return company ? company.name : 'Select Company'
}

const isOpen = ref(false)
const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

// Close dropdown when clicking outside
onMounted(() => {
  window.addEventListener('click', (e) => {
    if (!e.target.closest('.company-selector-container')) {
      isOpen.value = false
    }
  })
})
</script>

<template>
  <div class="relative company-selector-container">
    <button
      @click="toggleDropdown"
      class="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
    >
      <Building2 class="w-4 h-4 text-primary-500" />
      <span class="hidden sm:inline">{{ getSelectedCompanyName() }}</span>
      <ChevronDown
        class="w-4 h-4 text-gray-400 transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
      />
    </button>

    <div
      v-if="isOpen"
      class="absolute left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50 animate-in fade-in zoom-in duration-200"
    >
      <div v-if="isLoading" class="px-4 py-2 text-xs text-gray-500">Loading companies...</div>
      <button
        v-for="company in companies"
        :key="company.id"
        @click="selectCompany(company.id)"
        class="w-full text-left px-4 py-2 text-sm hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        :class="{ 'text-primary-600 font-bold': selectedId == company.id }"
      >
        {{ company.name }}
      </button>
    </div>
  </div>
</template>
