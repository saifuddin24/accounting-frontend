<script setup>
import { FilePlus, History, PlusCircle, Save, Trash2 } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import SelectDropdown from '../components/ui/SelectDropdown.vue'
import { useAccountingStore } from '../stores/accounting'
import { formatDate } from '../utils/format'

const store = useAccountingStore()

const activeTab = ref('new') // 'new' or 'history'

// =======================
// NEW ENTRY LOGIC
// =======================
const entryDate = ref(new Date().toISOString().slice(0, 10))
const description = ref('')
const rows = ref([
  { account_id: '', debit: '', credit: '' },
  { account_id: '', debit: '', credit: '' },
])

const accountOptions = computed(() =>
  store.accounts.map((acc) => ({
    label: `${acc.code} - ${acc.name}`,
    value: acc.id,
  })),
)

// Use strings for inputs to avoid '0' annoyance, convert to float for math
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
  rows.value.push({ account_id: '', debit: '', credit: '' })
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
    alert('Entry must be balanced!')
    return
  }

  try {
    await store.createJournalEntry({
      date: entryDate.value,
      description: description.value,
      items: rows.value.map((r) => ({
        account_id: r.account_id,
        debit: parseFloat(r.debit) || 0,
        credit: parseFloat(r.credit) || 0,
      })),
    })
    alert('Journal Entry Posted Successfully!')
    // Reset form
    description.value = ''
    rows.value = [
      { account_id: '', debit: '', credit: '' },
      { account_id: '', debit: '', credit: '' },
    ]
    // Switch to history to see it
    activeTab.value = 'history'
    store.fetchJournals()
  } catch (e) {
    alert('Error: ' + e.message)
  }
}

// =======================
// INIT
// =======================
onMounted(() => {
  store.fetchAccounts()
  store.fetchJournals()
})
</script>

<template>
  <div class="max-w-5xl mx-auto">
    <!-- Header & Tabs -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Journal Entries</h1>
        <div class="text-sm text-gray-500">Manage daily financial transactions</div>
      </div>
      <div
        class="bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700 flex"
      >
        <button
          @click="activeTab = 'new'"
          :class="
            activeTab === 'new'
              ? 'bg-primary-50 text-primary-700 shadow-sm'
              : 'text-gray-500 hover:text-gray-900'
          "
          class="px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2"
        >
          <FilePlus class="w-4 h-4" /> New Entry
        </button>
        <button
          @click="activeTab = 'history'"
          :class="
            activeTab === 'history'
              ? 'bg-primary-50 text-primary-700 shadow-sm'
              : 'text-gray-500 hover:text-gray-900'
          "
          class="px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2"
        >
          <History class="w-4 h-4" /> History
        </button>
      </div>
    </div>

    <!-- NEW ENTRY FORM -->
    <div v-if="activeTab === 'new'" class="card p-6 mb-6 animate-fade-in">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >Date</label
          >
          <input type="date" v-model="entryDate" class="input-primary" />
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
          />
        </div>
      </div>

      <div class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
        <table class="w-full text-left bg-white dark:bg-gray-800 min-w-[600px] sm:min-w-0">
          <thead
            class="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 uppercase text-xs"
          >
            <tr>
              <th class="px-4 py-3 min-w-[200px]">Account</th>
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
                  :options="accountOptions"
                  placeholder="Select Account"
                  class="w-full"
                />
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
              <td class="px-4 py-3 text-right">Totals</td>
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

      <div class="flex items-center justify-between">
        <div v-if="!isBalanced" class="text-red-500 text-sm flex items-center gap-2">
          ⚠️ Debits must equal Credits. Difference: {{ (totalDebit - totalCredit).toFixed(2) }}
        </div>
        <div v-else class="text-green-600 text-sm flex items-center gap-2">✅ Ready to post.</div>

        <div class="flex gap-4">
          <button class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
          <button
            @click="submitEntry"
            :disabled="!isBalanced"
            class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save class="w-4 h-4" />
            Post Entry
          </button>
        </div>
      </div>
    </div>

    <!-- HISTORY LIST -->
    <div v-if="activeTab === 'history'" class="card overflow-x-auto animate-fade-in">
      <table class="w-full text-left text-sm min-w-[600px] sm:min-w-0">
        <thead
          class="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase font-semibold"
        >
          <tr>
            <th class="px-6 py-3">Date</th>
            <th class="px-6 py-3">Journal #</th>
            <th class="px-6 py-3">Description</th>
            <th class="px-6 py-3 text-right">Amount</th>
            <th class="px-6 py-3 text-right">Status</th>
            <th class="px-6 py-3"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
          <tr
            v-for="entry in store.journals"
            :key="entry.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-700/50"
          >
            <td class="px-6 py-3 text-gray-500">{{ formatDate(entry.date) }}</td>
            <td class="px-6 py-3 font-mono text-primary-600">{{ entry.entry_number }}</td>
            <td class="px-6 py-3">{{ entry.description }}</td>
            <td class="px-6 py-3 text-right font-medium">
              {{ Number(entry.total_amount).toLocaleString() }}
            </td>
            <td class="px-6 py-3 text-right">
              <span
                class="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 capitalize"
              >
                {{ entry.status }}
              </span>
            </td>
            <td class="px-6 py-3 text-right text-gray-400 hover:text-gray-600 cursor-pointer">
              View
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="store.journals.length === 0" class="p-8 text-center text-gray-500">
        No journal entries found.
      </div>
    </div>
  </div>
</template>
