<script setup>
import { useUIStore } from '../../stores/ui'
import Header from './Header.vue'
import Sidebar from './Sidebar.vue'

const uiStore = useUIStore()
</script>

<template>
  <div
    class="min-h-screen bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-gray-100 font-sans transition-colors duration-200"
  >
    <!-- Backdrop for mobile sidebar -->
    <div
      v-if="uiStore.isSidebarOpen"
      @click="uiStore.closeSidebar"
      class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 sm:hidden transition-opacity duration-300"
    ></div>

    <Sidebar />

    <div class="sm:ml-64 flex flex-col min-h-screen">
      <Header />

      <main class="flex-1 p-4 sm:p-6 overflow-x-hidden">
        <div class="max-w-7xl mx-auto">
          <slot />
        </div>
      </main>

      <footer
        class="p-4 border-t border-gray-200 dark:border-dark-border text-center text-sm text-gray-500"
      >
        &copy; 2025 Simple Accounting. All rights reserved.
      </footer>
    </div>
  </div>
</template>
