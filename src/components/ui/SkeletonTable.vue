<script setup>
import Skeleton from './Skeleton.vue'

defineProps({
  rows: {
    type: Number,
    default: 5,
  },
  cols: {
    type: Number,
    default: 4,
  },
})
</script>

<template>
  <div class="w-full">
    <table class="w-full text-left">
      <thead class="bg-gray-50 dark:bg-gray-700/50">
        <tr>
          <th v-for="col in cols" :key="col" class="px-6 py-4">
            <Skeleton className="h-4 w-20" />
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
        <tr v-for="row in rows" :key="row">
          <td v-for="col in cols" :key="col" class="px-6 py-4">
            <Skeleton :className="`h-4 ${Math.random() > 0.5 ? 'w-24' : 'w-32'}`" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
