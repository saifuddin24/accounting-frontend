<script setup>
import { api } from '@/utils/api'
import { Building2, ChevronDown } from 'lucide-vue-next'
import { onMounted, ref } from 'vue'

const profiles = ref([])
const selectedId = ref(localStorage.getItem('profile_id'))
const isLoading = ref(false)

const emit = defineEmits(['change'])

async function fetchProfiles() {
  isLoading.value = true
  try {
    profiles.value = await api.get('/api/v1/profiles')
  } catch (error) {
    console.error('Failed to fetch profiles:', error)
  } finally {
    isLoading.value = false
  }
}

function selectProfile(id) {
  selectedId.value = id
  localStorage.setItem('profile_id', id)
  emit('change', id)
  // Reload to ensure all services/components initialize with correct ID
  window.location.reload()
}

onMounted(() => {
  fetchProfiles()
})

const getSelectedProfileName = () => {
  const profile = profiles.value.find((p) => p.id == selectedId.value)
  return profile ? profile.name : 'Select Profile'
}

const isOpen = ref(false)
const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

// Close dropdown when clicking outside
onMounted(() => {
  window.addEventListener('click', (e) => {
    if (!e.target.closest('.profile-selector-container')) {
      isOpen.value = false
    }
  })
})
</script>

<template>
  <div class="relative profile-selector-container">
    <button
      @click="toggleDropdown"
      class="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
    >
      <Building2 class="w-4 h-4 text-primary-500" />
      <span class="hidden sm:inline">{{ getSelectedProfileName() }}</span>
      <ChevronDown
        class="w-4 h-4 text-gray-400 transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
      />
    </button>

    <div
      v-if="isOpen"
      class="absolute left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50 animate-in fade-in zoom-in duration-200"
    >
      <div v-if="isLoading" class="px-4 py-2 text-xs text-gray-500">Loading profiles...</div>
      <button
        v-for="profile in profiles"
        :key="profile.id"
        @click="selectProfile(profile.id)"
        class="w-full text-left px-4 py-2 text-sm hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        :class="{ 'text-primary-600 font-bold': selectedId == profile.id }"
      >
        {{ profile.name }}
      </button>
    </div>
  </div>
</template>
