<script setup>
import { PlusCircle, Save, Trash2 } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import FormAlert from '../components/ui/FormAlert.vue'
import InputError from '../components/ui/InputError.vue'
import SelectDropdown from '../components/ui/SelectDropdown.vue'
import { useForm } from '../composables/useForm'
import { useAccountingStore } from '../stores/accounting'

const store = useAccountingStore()
const router = useRouter()
const form = useForm()

const entryDate = ref(new Date().toISOString().slice(0, 10))
const description = ref('')
const rows = ref([
  { account_id: '', description: '', debit: '', credit: '' },
  { account_id: '', description: '', debit: '', credit: '' },
])

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

function addRow() {
  rows.value.push({ account_id: '', description: '', debit: '', credit: '' })
}

function removeRow(index) {
  if (rows.value.length > 2) {
    rows.value.splice(index, 1)
  }
}

function handleDebitInput(row) {
  if (row.debit) row.credit = ''
}

function handleCreditInput(row) {
  if (row.credit) row.debit = ''
}

async function submitEntry() {
  if (!isBalanced.value) {
    form.errorMessage.value = 'Entry must be balanced!'
    return
  }

  await form.submit(async () => {
    await store.createJournalEntry({
      date: entryDate.value,
      description: description.value,
      fiscal_year_id: localStorage.getItem('fiscal_year_id'),
      items: rows.value.map((r) => ({
        account_id: r.account_id,
        description: r.description,
        debit: parseFloat(r.debit) || 0,
        credit: parseFloat(r.credit) || 0,
      })),
    })

    // Redirect to List after a short delay to show success message
    setTimeout(() => {
      router.push('/journals')
    }, 1500)
  })
}

onMounted(() => {
  store.fetchAccounts()
})
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">New Journal Entry</h1>
      <div class="text-sm text-gray-500">Record financial transactions</div>
    </div>

    <FormAlert :message="form.errorMessage.value" type="error" />
    <FormAlert :message="form.successMessage.value" type="success" />

    <div class="card p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >Date</label
          >
          <input
            type="date"
            v-model="entryDate"
            class="input-primary"
            :class="{ 'border-red-500 ring-red-500/20': form.errors.value.date }"
          />
          <InputError :message="form.errors.value.date" />
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >Description / Narrative</label
          >
          <input
            type="text"
            v-model="description"
            placeholder="e.g. Purchase of office supplies"
            class="input-primary"
            :class="{ 'border-red-500 ring-red-500/20': form.errors.value.description }"
          />
          <InputError :message="form.errors.value.description" />
        </div>
      </div>

      <div class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
        <table class="w-full text-left bg-white dark:bg-gray-800 min-w-[600px] sm:min-w-0">
          <thead
            class="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 uppercase text-xs"
          >
            <tr>
              <th class="px-4 py-3 min-w-[200px]">Account</th>
              <th class="px-4 py-3 min-w-[200px]">Line Description</th>
              <th class="px-4 py-3 w-40 text-right">Debit</th>
              <th class="px-4 py-3 w-40 text-right">Credit</th>
              <th class="px-4 py-3 w-16 text-center">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
            <tr v-for="(row, index) in rows" :key="index">
              <td class="px-4 py-2">
                <SelectDropdown
                  v-model="row.account_id"
                  :options="store.accountOptions"
                  placeholder="Select Account"
                  class="w-full"
                  :class="{ 'border-red-500': form.errors.value[`items.${index}.account_id`] }"
                />
                <InputError :message="form.errors.value[`items.${index}.account_id`]" />
              </td>
              <td class="px-4 py-2">
                <input
                  type="text"
                  v-model="row.description"
                  placeholder="Line description (optional)"
                  class="input-primary py-1"
                  :class="{ 'border-red-500': form.errors.value[`items.${index}.description`] }"
                />
                <InputError :message="form.errors.value[`items.${index}.description`]" />
              </td>
              <td class="px-4 py-2">
                <input
                  type="number"
                  v-model="row.debit"
                  min="0"
                  step="0.01"
                  @input="handleDebitInput(row)"
                  class="input-primary py-1 text-right"
                  placeholder="0.00"
                />
              </td>
              <td class="px-4 py-2">
                <input
                  type="number"
                  v-model="row.credit"
                  min="0"
                  step="0.01"
                  @input="handleCreditInput(row)"
                  class="input-primary py-1 text-right"
                  placeholder="0.00"
                />
              </td>
              <td class="px-4 py-2 text-center">
                <button
                  @click="removeRow(index)"
                  class="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </td>
            </tr>
          </tbody>
          <tfoot class="bg-gray-50 dark:bg-gray-700/50 font-bold text-gray-900 dark:text-white">
            <tr>
              <td colspan="2" class="px-4 py-3 text-right">Totals</td>
              <td
                class="px-4 py-3 text-right"
                :class="isBalanced ? 'text-green-600' : 'text-red-600'"
              >
                {{ totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2 }) }}
              </td>
              <td
                class="px-4 py-3 text-right"
                :class="isBalanced ? 'text-green-600' : 'text-red-600'"
              >
                {{ totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2 }) }}
              </td>
              <td class="px-4 py-3 text-center">
                <button @click="addRow" class="text-primary-600 hover:text-primary-700">
                  <PlusCircle class="w-5 h-5" />
                </button>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div v-if="!isBalanced" class="text-red-500 text-sm flex items-center gap-2">
          <span class="flex-shrink-0">⚠️</span>
          <span>Debits must equal Credits. Diff: {{ (totalDebit - totalCredit).toFixed(2) }}</span>
        </div>
        <div v-else class="text-green-600 text-sm flex items-center gap-2">✅ Ready to post.</div>

        <div class="flex flex-col-reverse sm:flex-row gap-3 w-full sm:w-auto">
          <button
            @click="router.push('/journals')"
            class="px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 rounded-lg text-sm"
          >
            Cancel
          </button>
          <button
            @click="submitEntry"
            :disabled="!isBalanced || form.processing.value"
            class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <span v-if="form.processing.value" class="animate-spin mr-2">⏳</span>
            <Save v-else class="w-4 h-4" />
            {{ form.processing.value ? 'Posting...' : 'Post Entry' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
