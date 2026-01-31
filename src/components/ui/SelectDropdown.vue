<script setup>
import { Check, ChevronDown, Search, X } from 'lucide-vue-next'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

const props = defineProps({
  modelValue: [String, Number],
  options: {
    type: Array,
    default: () => [],
  },
  placeholder: {
    type: String,
    default: 'Search and select...',
  },
  labelKey: {
    type: String,
    default: 'label',
  },
  valueKey: {
    type: String,
    default: 'value',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  class: String,
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const searchQuery = ref('')
const triggerRef = ref(null)
const dropdownRef = ref(null)
const searchInputRef = ref(null)

const dropdownStyle = ref({
  position: 'fixed',
  top: '0px',
  left: '0px',
  width: '0px',
  zIndex: 9999,
})

const selectedOption = computed(() =>
  props.options.find((opt) => opt[props.valueKey] == props.modelValue),
)

const filteredOptions = computed(() => {
  if (!searchQuery.value) return props.options
  const query = searchQuery.value.toLowerCase()
  return props.options.filter((opt) => String(opt[props.labelKey]).toLowerCase().includes(query))
})

const updatePosition = () => {
  if (!isOpen.value || !triggerRef.value) return

  const rect = triggerRef.value.getBoundingClientRect()
  const dropdownHeight = 320 // Max height estimated (search + 256px list + padding)
  const spaceBelow = window.innerHeight - rect.bottom
  const spaceAbove = rect.top

  let top = rect.bottom + window.scrollY
  let left = rect.left + window.scrollX

  // Decide if show above or below
  if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
    top = rect.top + window.scrollY - dropdownHeight - 8
  } else {
    top = rect.bottom + window.scrollY + 8
  }

  dropdownStyle.value = {
    position: 'absolute',
    top: `${top}px`,
    left: `${left}px`,
    width: `${rect.width}px`,
    zIndex: 9999,
  }
}

const toggleDropdown = () => {
  if (props.disabled) return
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    searchQuery.value = ''
    setTimeout(updatePosition, 0)
  }
}

const selectOption = (option) => {
  emit('update:modelValue', option[props.valueKey])
  isOpen.value = false
  searchQuery.value = ''
}

const clearSelection = (e) => {
  e.stopPropagation()
  emit('update:modelValue', '')
  searchQuery.value = ''
}

const handleClickOutside = (event) => {
  if (
    isOpen.value &&
    triggerRef.value &&
    !triggerRef.value.contains(event.target) &&
    dropdownRef.value &&
    !dropdownRef.value.contains(event.target)
  ) {
    isOpen.value = false
  }
}

// Global events for position and closing
onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
  window.addEventListener('scroll', updatePosition, true)
  window.addEventListener('resize', updatePosition)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
  window.removeEventListener('scroll', updatePosition, true)
  window.removeEventListener('resize', updatePosition)
})

watch(isOpen, (newVal) => {
  if (newVal) {
    setTimeout(() => {
      searchInputRef.value?.focus()
      updatePosition()
    }, 100)
  }
})
</script>

<template>
  <div class="relative w-full" :class="props.class">
    <!-- Trigger -->
    <div
      ref="triggerRef"
      @click="toggleDropdown"
      class="input-primary flex items-center justify-between cursor-pointer"
      :class="[
        disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'hover:border-primary-400',
        isOpen ? 'ring-2 ring-primary-500 border-transparent' : '',
      ]"
    >
      <div class="truncate pr-4">
        <span v-if="selectedOption" class="text-gray-900 dark:text-white">
          {{ selectedOption[labelKey] }}
        </span>
        <span v-else class="text-gray-400">
          {{ placeholder }}
        </span>
      </div>
      <div class="flex items-center gap-2">
        <X
          v-if="selectedOption && !disabled"
          @click="clearSelection"
          class="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors"
        />
        <ChevronDown
          class="w-4 h-4 text-gray-400 transition-transform duration-200"
          :class="{ 'rotate-180': isOpen }"
        />
      </div>
    </div>

    <!-- Dropdown Menu via Teleport -->
    <Teleport to="body">
      <div
        v-if="isOpen"
        ref="dropdownRef"
        :style="dropdownStyle"
        class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200"
      >
        <!-- Search Box -->
        <div class="p-2 border-b border-gray-100 dark:border-gray-700">
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              ref="searchInputRef"
              type="text"
              v-model="searchQuery"
              class="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-900/50 border-none rounded-lg focus:ring-1 focus:ring-primary-500 outline-none text-gray-900 dark:text-white"
              placeholder="Search..."
              @click.stop
            />
          </div>
        </div>

        <!-- Options List -->
        <div class="max-h-64 overflow-y-auto py-1 custom-scrollbar">
          <template v-for="(option, index) in filteredOptions" :key="option[valueKey]">
            <!-- Group Header -->
            <div
              v-if="
                option.group && (index === 0 || filteredOptions[index - 1].group !== option.group)
              "
              class="px-4 py-2 text-sm font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wider bg-gray-50/50 dark:bg-gray-900/30"
            >
              {{ option.group }}
            </div>

            <div
              @click="selectOption(option)"
              class="px-4 py-2 text-sm cursor-pointer flex items-center justify-between hover:bg-primary-50 dark:hover:bg-primary-900/20 group transition-colors"
              :class="[
                modelValue == option[valueKey]
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                  : 'text-gray-700 dark:text-gray-300',
              ]"
            >
              <div class="flex flex-col truncate">
                <span class="truncate">{{ option[labelKey] }}</span>
                <span v-if="option.subtext" class="text-[10px] text-gray-400 truncate">{{
                  option.subtext
                }}</span>
              </div>
              <Check v-if="modelValue == option[valueKey]" class="w-4 h-4 text-primary-600" />
            </div>
          </template>

          <div
            v-if="filteredOptions.length === 0"
            class="px-4 py-8 text-center text-gray-500 text-sm"
          >
            No matches found
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
@reference "../../assets/main.css";

.animate-in {
  animation: fadeIn 0.15s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  @apply bg-gray-200 dark:bg-gray-700 rounded-full;
}
</style>
