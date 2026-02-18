<script setup>
import Skeleton from './Skeleton.vue'

defineProps({
  layout: {
    type: String,
    default: 'single', // 'single' or 'double'
  },
})
</script>

<template>
  <div v-if="layout === 'single'" class="card p-6 animate-fade-in">
    <div class="h-8 w-64 mx-auto mb-4">
      <Skeleton className="h-full w-full" />
    </div>
    <div class="space-y-4">
      <div v-for="i in 10" :key="i" class="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-700/50">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
    <div class="mt-8 flex justify-between items-center py-4 border-t-2 border-gray-100 dark:border-gray-700">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-6 w-32" />
    </div>
  </div>

  <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
    <div v-for="j in 2" :key="j" class="card p-6">
      <div class="h-6 w-32 mb-6">
        <Skeleton className="h-full w-full" />
      </div>
      <div class="space-y-4">
        <div v-for="i in 8" :key="i" class="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-700/50">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      <div class="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-24" />
      </div>
    </div>
  </div>
</template>
