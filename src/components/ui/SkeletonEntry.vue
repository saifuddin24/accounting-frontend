<script setup>
import Skeleton from './Skeleton.vue'
</script>

<template>
  <div class="animate-fade-in">
    <!-- Header Card Skeleton -->
    <div class="card p-6 mb-6">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-3 mb-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-8 w-48" />
          </div>
          <div class="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-5 w-32" />
          </div>
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
        <div>
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-8 w-full" />
        </div>
        <div>
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-8 w-48" />
        </div>
      </div>
    </div>

    <!-- Table Skeleton -->
    <div class="card overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
        <Skeleton className="h-6 w-40" />
      </div>
      <div class="p-6 space-y-4">
        <div v-for="i in 3" :key="i" class="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-700/50">
          <div class="space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-3 w-24" />
          </div>
          <div class="flex gap-8">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-24" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
