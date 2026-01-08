<script setup>
import Sidebar from './Sidebar.vue'
import Header from './Header.vue'
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-gray-100 font-sans transition-colors duration-200">
    <Sidebar />
    
    <div class="sm:ml-64 flex flex-col min-h-screen">
      <Header />
      
      <main class="flex-1 p-6 overflow-x-hidden">
        <div class="max-w-7xl mx-auto">
            <slot />
        </div>
      </main>
      
      <footer class="p-4 border-t border-gray-200 dark:border-dark-border text-center text-sm text-gray-500">
        &copy; 2025 Simple Accounting. All rights reserved.
      </footer>
    </div>
  </div>
</template>
