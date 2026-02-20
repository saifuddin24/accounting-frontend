<script setup>
import { PlusCircle, Trash2 } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import FormAlert from '../components/ui/FormAlert.vue'
import SelectDropdown from '../components/ui/SelectDropdown.vue'
import { useAccountingStore } from '../stores/accounting'
import { useContactStore } from '../stores/contacts'

const router = useRouter()
const store = useAccountingStore()
const contactStore = useContactStore()

// --- State ---

const form = ref({
  date: new Date().toISOString().slice(0, 10),
  description: '',
  contact_id: '',
})

const rows = ref([
  { account_id: '', description: '', debit: 0, credit: 0 },
  { account_id: '', description: '', debit: 0, credit: 0 },
])

const errorMessage = ref('')
const successMessage = ref('')
const isSubmitting = ref(false)

// --- Mode Specific State ---

// Expense

// Transfer

// Lending

// --- Computed Helpers ---

const totalDebit = computed(() => {
  return rows.value.reduce((sum, row) => sum + (parseFloat(row.debit) || 0), 0)
})

const totalCredit = computed(() => {
  return rows.value.reduce((sum, row) => sum + (parseFloat(row.credit) || 0), 0)
})

const isBalanced = computed(() => {
  const diff = Math.abs(totalDebit.value - totalCredit.value)
  return diff < 0.01 && totalDebit.value > 0
})

const accountOptions = computed(() => store.accountOptions || [])
const contactOptions = computed(() => contactStore.contactOptions || [])

// --- Actions ---

function addRow() {
  rows.value.push({ account_id: '', description: '', debit: 0, credit: 0 })
}

function removeRow(index) {
  if (rows.value.length > 2) {
    rows.value.splice(index, 1)
  }
}

function handleDebitInput(row) {
  if (row.debit) row.credit = 0
}

function handleCreditInput(row) {
  if (row.credit) row.debit = 0
}

// --- Templates ---

async function submitEntry() {
  errorMessage.value = ''
  successMessage.value = ''

  if (!isBalanced.value) {
    errorMessage.value = 'Entry must be balanced (Debits = Credits)!'
    return
  }

  if (rows.value.length === 0) {
    errorMessage.value = 'Journal must have at least one row.'
    return
  }

  isSubmitting.value = true

  try {
    const validRows = rows.value.filter((r) => r.account_id && (r.debit > 0 || r.credit > 0))

    if (validRows.length < 2) {
      throw new Error('A valid journal entry requires at least 2 lines.')
    }

    const payload = {
      date: form.value.date,
      description: form.value.description,
      contact_id: form.value.contact_id || null,
      fiscal_year_id: localStorage.getItem('fiscal_year_id'), // Added fix
      items: validRows.map((r) => ({
        account_id: r.account_id,
        description: r.description,
        debit: parseFloat(r.debit) || 0,
        credit: parseFloat(r.credit) || 0,
      })),
    }

    await store.createJournalEntry(payload)

    successMessage.value = 'Journal Entry saved successfully.'
    setTimeout(() => {
      router.push('/journals')
    }, 1500)
  } catch (e) {
    console.error(e)
    errorMessage.value = e.response?.data?.message || e.message || 'Failed to save entry.'
  } finally {
    isSubmitting.value = false
  }
}

onMounted(async () => {
  store.fetchAccounts()
  contactStore.fetchContacts()
})
</script>

<template>
  <div class="max-w-6xl mx-auto p-4">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">New Journal Entry</h1>
        <p class="text-sm text-gray-500">Record distinct financial transactions</p>
      </div>
    </div>

    <FormAlert :message="errorMessage" type="error" />
    <FormAlert :message="successMessage" type="success" />

    <!-- Common Entry Form -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <!-- Header Fields -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >Date</label
          >
          <input
            type="date"
            v-model="form.date"
            class="w-full px-3 py-2 rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >Description</label
          >
          <input
            type="text"
            v-model="form.description"
            placeholder="Entry description..."
            class="w-full px-3 py-2 rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >Contact (Optional)</label
          >
          <SelectDropdown
            v-model="form.contact_id"
            :options="contactOptions"
            placeholder="-- No Contact --"
          />
        </div>
      </div>

      <!-- Journal Lines -->
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                class="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-1/3"
              >
                Account
              </th>
              <th
                class="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Description
              </th>
              <th
                class="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-32"
              >
                Debit
              </th>
              <th
                class="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-32"
              >
                Credit
              </th>
              <th class="px-3 py-3 w-10"></th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="(row, index) in rows" :key="index">
              <td class="pr-3 py-2">
                <SelectDropdown
                  v-model="row.account_id"
                  :options="accountOptions"
                  placeholder="Select Account"
                />
              </td>
              <td class="px-3 py-2">
                <input
                  type="text"
                  v-model="row.description"
                  class="w-full px-3 py-2 text-sm rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 focus:ring-blue-500 focus:border-blue-500"
                />
              </td>
              <td class="px-3 py-2">
                <input
                  type="number"
                  step="0.01"
                  v-model="row.debit"
                  @input="handleDebitInput(row)"
                  class="w-full px-3 py-2 text-sm text-right rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 focus:ring-blue-500 focus:border-blue-500"
                />
              </td>
              <td class="px-3 py-2">
                <input
                  type="number"
                  step="0.01"
                  v-model="row.credit"
                  @input="handleCreditInput(row)"
                  class="w-full px-3 py-2 text-sm text-right rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 focus:ring-blue-500 focus:border-blue-500"
                />
              </td>
              <td class="px-3 py-2 text-center">
                <button
                  @click="removeRow(index)"
                  class="text-red-500 hover:text-red-700"
                  title="Remove Row"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </td>
            </tr>
          </tbody>
          <tfoot class="bg-gray-50 dark:bg-gray-700 font-bold">
            <tr>
              <td colspan="2" class="px-3 py-3 text-right text-gray-700 dark:text-gray-300">
                Totals:
              </td>
              <td class="px-3 py-3 text-right text-gray-900 dark:text-white">
                {{ totalDebit.toFixed(2) }}
              </td>
              <td class="px-3 py-3 text-right text-gray-900 dark:text-white">
                {{ totalCredit.toFixed(2) }}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <button
        @click="addRow"
        type="button"
        class="mt-4 inline-flex items-center px-3 py-2 text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <PlusCircle class="w-4 h-4 mr-2" />
        Add Line
      </button>

      <!-- Footer Actions -->
      <div
        class="mt-8 flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700"
      >
        <div class="text-sm">
          <span v-if="!isBalanced" class="text-red-600 font-medium"
            >Out of balance by {{ Math.abs(totalDebit - totalCredit).toFixed(2) }}</span
          >
          <span v-else class="text-green-600 font-medium">Balanced</span>
        </div>
        <div class="flex gap-4">
          <button
            @click="router.back()"
            type="button"
            class="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            @click="submitEntry"
            :disabled="isSubmitting || !isBalanced"
            type="submit"
            class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isSubmitting ? 'Saving...' : 'Save Journal Entry' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
