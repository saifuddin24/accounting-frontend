<script setup>
import { AlertCircle, CheckCircle2, XCircle } from 'lucide-vue-next'

defineProps({
  type: {
    type: String,
    default: 'error', // 'error', 'success', 'warning'
  },
  message: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <div
    v-if="message"
    class="flex items-start gap-3 p-4 rounded-xl mb-6 animate-fade-in border"
    :class="{
      'bg-red-50 border-red-100 text-red-800 dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-400':
        type === 'error',
      'bg-green-50 border-green-100 text-green-800 dark:bg-green-900/20 dark:border-green-900/30 dark:text-green-400':
        type === 'success',
      'bg-amber-50 border-amber-100 text-amber-800 dark:bg-amber-900/20 dark:border-amber-900/30 dark:text-amber-400':
        type === 'warning',
    }"
  >
    <div class="flex-shrink-0 mt-0.5">
      <XCircle v-if="type === 'error'" class="w-5 h-5" />
      <CheckCircle2 v-else-if="type === 'success'" class="w-5 h-5" />
      <AlertCircle v-else class="w-5 h-5" />
    </div>
    <div class="flex-1 text-sm font-medium">
      {{ message }}
    </div>
  </div>
</template>
