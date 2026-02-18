<script setup>
import Skeleton from './Skeleton.vue'
</script>

<template>
  <div class="card p-6 flex flex-col gap-3">
    <div class="flex justify-between items-start">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-8 rounded-full" />
    </div>
    <Skeleton className="h-8 w-32" />
    <Skeleton className="h-4 w-16" />
  </div>
</template>
