<script setup>
defineProps({
  message: {
    type: [String, Array],
    default: '',
  },
})
</script>

<template>
  <div v-if="message" class="mt-1 animate-fade-in">
    <p
      v-if="Array.isArray(message)"
      v-for="msg in message"
      :key="msg"
      class="text-xs text-red-600 dark:text-red-400 font-medium"
    >
      {{ msg }}
    </p>
    <p v-else class="text-xs text-red-600 dark:text-red-400 font-medium">
      {{ message }}
    </p>
  </div>
</template>
