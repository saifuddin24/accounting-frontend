<script setup>
import { api } from '@/utils/api'
import { ArrowRight, Building2 } from 'lucide-vue-next'
import { onMounted, ref } from 'vue'

const hasCompany = ref(!!localStorage.getItem('company_id'))
const companies = ref([])
const isLoading = ref(false)

async function fetchCompanies() {
  isLoading.value = true
  try {
    companies.value = await api.get('/api/v1/companies')
  } catch (error) {
    console.error('Failed to fetch companies:', error)
  } finally {
    isLoading.value = false
  }
}

function selectCompany(id) {
  localStorage.setItem('company_id', id)
  hasCompany.value = true
  window.location.reload() // Reload to ensure all services/components initialize with correct ID
}

onMounted(() => {
  if (!hasCompany.value) {
    fetchCompanies()
  }
})
</script>

<template>
  <div
    v-if="!hasCompany"
    class="fixed inset-0 z-[100] bg-gray-50 dark:bg-dark-bg flex items-center justify-center p-6"
  >
    <div
      class="max-w-md w-full bg-white dark:bg-dark-surface rounded-2xl shadow-2xl border border-gray-200 dark:border-dark-border p-8 text-center"
    >
      <div
        class="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6"
      >
        <Building2 class="w-8 h-8 text-primary-600 dark:text-primary-400" />
      </div>

      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome!</h1>
      <p class="text-gray-500 dark:text-gray-400 mb-8">
        Please select a company to continue with your accounting.
      </p>

      <div v-if="isLoading" class="flex flex-col gap-4">
        <div
          v-for="i in 3"
          :key="i"
          class="h-14 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl"
        ></div>
      </div>

      <div v-else class="flex flex-col gap-3">
        <button
          v-for="company in companies"
          :key="company.id"
          @click="selectCompany(company.id)"
          class="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all group"
        >
          <div class="text-left">
            <p class="font-semibold text-gray-900 dark:text-white">{{ company.name }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ company.tax_id || 'No Tax ID' }}
            </p>
          </div>
          <ArrowRight
            class="w-5 h-5 text-gray-300 group-hover:text-primary-500 transition-colors"
          />
        </button>

        <div v-if="companies.length === 0 && !isLoading" class="py-4">
          <p class="text-sm text-red-500">No companies found. Please contact administrator.</p>
        </div>
      </div>
    </div>
  </div>
  <slot v-else />
</template>
