import { onMounted, ref, watch } from 'vue'

export function useDarkMode() {
  const isDark = ref(false)

  const toggle = () => {
    isDark.value = !isDark.value
  }

  onMounted(() => {
    // Check local storage or system preference
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      isDark.value = true
    } else {
      isDark.value = false
    }
  })

  watch(isDark, (val) => {
    if (val) {
      document.documentElement.classList.add('dark')
      localStorage.theme = 'dark'
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.theme = 'light'
    }
  })

  return { isDark, toggle }
}
