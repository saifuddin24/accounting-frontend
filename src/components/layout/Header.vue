<script setup>
import { Bell, Moon, Search, Sun } from 'lucide-vue-next'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useDarkMode } from '../../composables/useDarkMode'
import CompanySelector from './CompanySelector.vue'
import FiscalYearSelector from './FiscalYearSelector.vue'

const { isDark, toggle } = useDarkMode()
const router = useRouter()
const searchQuery = ref('')

function handleGlobalSearch() {
  if (searchQuery.value.trim()) {
    router.push({
      path: '/journals',
      query: { search: searchQuery.value.trim() },
    })
    searchQuery.value = '' // Optional: Clear after search or keep it?
    // Usually keeping it is better UX if it stays on the screen, but since we are navigating away, maybe better to clear or keep.
    // The list view has its own search bar. If I clear it here, the user lands on the list and sees the search applied there.
    // Let's clear it to indicate the action was "sent".
  }
}
</script>

<template>
  <header
    class="h-16 bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border px-6 flex items-center justify-between sticky top-0 z-30"
  >
    <!-- Left: Search (Desktop) / Hamburger (Mobile) -->
    <div class="flex items-center gap-4">
      <!-- Mobile Toggle would go here -->
      <CompanySelector />
      <FiscalYearSelector />

      <div class="hidden md:flex items-center relative">
        <Search class="w-4 h-4 absolute left-3 text-gray-400" />
        <input
          type="text"
          v-model="searchQuery"
          @keyup.enter="handleGlobalSearch"
          placeholder="Search transactions..."
          class="pl-10 pr-4 py-2 text-sm rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 w-64"
        />
      </div>
    </div>

    <!-- Right: Actions -->
    <div class="flex items-center gap-4">
      <button
        @click="toggle"
        class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
      >
        <Sun v-if="isDark" class="w-5 h-5" />
        <Moon v-else class="w-5 h-5" />
      </button>

      <button
        class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 relative"
      >
        <Bell class="w-5 h-5" />
        <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
      </button>

      <div class="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-700">
        <div class="text-right hidden sm:block">
          <p class="text-sm font-medium text-gray-900 dark:text-white">John Doe</p>
          <p class="text-xs text-gray-500 dark:text-gray-400">Accountant</p>
        </div>
        <div
          class="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold"
        >
          J
        </div>
      </div>
    </div>
  </header>
</template>
