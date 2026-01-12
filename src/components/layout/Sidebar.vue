<script setup>
import {
  Activity,
  BookOpen,
  Columns4,
  FileText,
  LayoutDashboard,
  LogOut,
  PieChart,
  Scale,
  Settings,
  TrendingUp,
  X,
} from 'lucide-vue-next'
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { useUIStore } from '../../stores/ui'

const route = useRoute()
const uiStore = useUIStore()

const menuItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Journal Entries', path: '/journals', icon: FileText },
  { name: 'Chart of Accounts', path: '/accounts', icon: BookOpen },
  { name: 'General Ledger', path: '/reports', icon: PieChart },
  { name: 'Trial Balance', path: '/trial-balance', icon: Activity },
  { name: 'Income Statement', path: '/income-statement', icon: TrendingUp },
  { name: 'Balance Sheet', path: '/balance-sheet', icon: Scale },
  { name: 'Worksheet', path: '/worksheet', icon: Columns4 },
  { name: 'Settings', path: '/settings', icon: Settings },
]

const isActive = (path) => route.path.startsWith(path)

// Close sidebar when navigating on mobile
watch(
  () => route.path,
  () => {
    uiStore.closeSidebar()
  },
)
</script>

<template>
  <aside
    class="fixed left-0 top-0 z-50 h-screen w-64 transform transition-transform duration-300 ease-in-out bg-white dark:bg-dark-surface border-r border-gray-200 dark:border-dark-border sm:translate-x-0"
    :class="uiStore.isSidebarOpen ? 'translate-x-0' : '-translate-x-full'"
  >
    <div class="h-full px-3 py-4 overflow-y-auto">
      <div class="flex items-center justify-between px-2 mb-8 mt-2">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
            <span class="text-white font-bold text-lg">A</span>
          </div>
          <span class="text-xl font-bold text-gray-900 dark:text-white">AccoSimple</span>
        </div>

        <!-- Close button for mobile -->
        <button
          @click="uiStore.closeSidebar"
          class="sm:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <ul class="space-y-2 font-medium">
        <li v-for="item in menuItems" :key="item.path">
          <router-link
            :to="item.path"
            class="flex items-center p-3 rounded-lg group transition-colors duration-200"
            :class="
              isActive(item.path)
                ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                : 'text-gray-900 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            "
          >
            <component :is="item.icon" class="w-5 h-5 transition duration-75" />
            <span class="ms-3">{{ item.name }}</span>
          </router-link>
        </li>
      </ul>

      <div class="absolute bottom-4 left-0 w-full px-3">
        <button
          class="flex w-full items-center p-3 text-gray-900 dark:text-gray-300 rounded-lg hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
        >
          <LogOut class="w-5 h-5" />
          <span class="ms-3">Sign Out</span>
        </button>
      </div>
    </div>
  </aside>
</template>
