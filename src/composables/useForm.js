import { ref } from 'vue'

export function useForm() {
  const processing = ref(false)
  const errors = ref({})
  const successMessage = ref('')
  const errorMessage = ref('')

  const clearMessages = () => {
    successMessage.value = ''
    errorMessage.value = ''
    errors.value = {}
  }

  const submit = async (callback) => {
    processing.value = true
    clearMessages()

    try {
      const result = await callback()
      console.log({result});
      successMessage.value = result?.message || 'Operation successful!'
      return result
    } catch (e) {
      console.error('Form Error:', e)
      
      if (e.response && e.response.status === 422) {
        errors.value = e.response.data.errors || {}
        errorMessage.value = e.response.data.message || 'Validation error occurred.'
      } else {
        errorMessage.value = e.message || 'An unexpected error occurred.'
      }
      throw e
    } finally {
      processing.value = false
    }
  }

  return {
    processing,
    errors,
    successMessage,
    errorMessage,
    submit,
    clearMessages
  }
}
