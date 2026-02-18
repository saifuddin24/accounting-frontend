<script setup>
defineProps({
  className: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <div :class="['animate-pulse bg-gray-200 dark:bg-gray-700 rounded-md', className]"></div>
</template>
