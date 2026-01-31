<script setup>
import { ArrowLeft, Calendar, Check, Edit2, FileText, Hash, Trash2, X } from 'lucide-vue-next'
import { nextTick, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAccountingStore } from '../stores/accounting'
import { formatDate } from '../utils/format'

const route = useRoute()
const router = useRouter()
const store = useAccountingStore()

const entry = ref(null)
const loading = ref(true)

const isEditingDate = ref(false)
const editDateValue = ref('')
const dateInput = ref(null)
const isSaving = ref(false)

async function loadEntry() {
  loading.value = true
  try {
    entry.value = await store.fetchJournalEntry(route.params.id)
  } catch (e) {
    console.error(e)
    alert('Failed to load journal entry')
    router.push('/journals')
  } finally {
    loading.value = false
  }
}

async function startEditingDate() {
  const dateStr = entry.value.date
  editDateValue.value = dateStr ? dateStr.substring(0, 10) : ''
  isEditingDate.value = true
  await nextTick()
  dateInput.value?.focus()
}

function cancelEditingDate() {
  isEditingDate.value = false
}

async function saveDate() {
  if (isSaving.value) return
  isSaving.value = true
  try {
    const updated = await store.updateJournalEntry(entry.value.id, { date: editDateValue.value })
    entry.value.date = updated.date
    isEditingDate.value = false
  } catch (e) {
    console.error(e)
    const errorMsg = e.response?.data?.error || e.message || 'Error updating date'
    alert('Error updating date: ' + errorMsg)
  } finally {
    isSaving.value = false
  }
}

async function confirmDelete() {
  if (
    confirm('Are you sure you want to delete this journal entry? This action cannot be undone.')
  ) {
    try {
      await store.deleteJournalEntry(entry.value.id)
      alert('Journal entry deleted successfully')
      router.push('/journals')
    } catch (e) {
      alert('Error deleting entry: ' + e.message)
    }
  }
}

onMounted(() => {
  loadEntry()
})
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <!-- Breadcrumbs / Back -->
    <div class="mb-6">
      <button
        @click="router.back()"
        class="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft class="w-4 h-4" />
        Back to Journals
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="py-12 text-center text-gray-500">
      <div
        class="inline-block animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mb-4"
      ></div>
      <p>Loading journal entry...</p>
    </div>

    <template v-else-if="entry">
      <!-- Header Card -->
      <div class="card p-6 mb-6">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-3 mb-2">
              <span
                class="px-2 py-1 rounded bg-primary-50 text-primary-700 text-xs font-bold uppercase"
              >
                Journal Entry
              </span>
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ entry.entry_number }}
              </h1>
            </div>
            <div class="flex items-center gap-2 min-h-[40px]">
              <Calendar class="w-4 h-4 text-gray-400 shrink-0" />
              <template v-if="!isEditingDate">
                <div
                  @click="startEditingDate"
                  class="group flex items-center gap-2 cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900/10 px-2 py-1 -ml-2 rounded-lg transition-all"
                  title="Click to edit date"
                >
                  <span class="text-gray-600 dark:text-gray-400 font-medium">{{
                    formatDate(entry.date)
                  }}</span>
                  <Edit2
                    class="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </div>
              </template>
              <div
                v-else
                class="flex items-center gap-2 animate-in fade-in slide-in-from-left-1 duration-200"
              >
                <input
                  ref="dateInput"
                  v-model="editDateValue"
                  type="date"
                  :disabled="isSaving"
                  class="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
                  @keyup.enter="saveDate"
                  @keyup.esc="cancelEditingDate"
                />
                <button
                  @click="saveDate"
                  :disabled="isSaving"
                  class="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md transition-all disabled:opacity-50"
                  title="Save changes"
                >
                  <Check v-if="!isSaving" class="w-4 h-4" />
                  <div
                    v-else
                    class="w-4 h-4 animate-spin border-2 border-green-600 border-t-transparent rounded-full"
                  ></div>
                </button>
                <button
                  @click="cancelEditingDate"
                  :disabled="isSaving"
                  class="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-all disabled:opacity-50"
                  title="Cancel"
                >
                  <X class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          <div class="flex gap-3">
            <button
              @click="confirmDelete"
              class="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium transition-colors"
            >
              <Trash2 class="w-4 h-4" />
              Delete Entry
            </button>
          </div>
        </div>

        <div
          class="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 pt-6 border-t border-gray-100 dark:border-gray-700"
        >
          <div>
            <h3
              class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2"
            >
              <FileText class="w-4 h-4" /> Description
            </h3>
            <p class="text-gray-900 dark:text-gray-100 text-lg">{{ entry.description }}</p>
          </div>
          <div>
            <h3
              class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2"
            >
              <Hash class="w-4 h-4" /> Reference
            </h3>
            <p class="text-gray-900 dark:text-gray-100">{{ entry.reference || 'No reference' }}</p>
          </div>
        </div>
      </div>

      <!-- Items Table -->
      <div class="card overflow-hidden">
        <div
          class="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50"
        >
          <h2 class="font-bold text-gray-900 dark:text-white">Transaction Details</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead
              class="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 uppercase text-xs font-semibold"
            >
              <tr>
                <th class="px-6 py-3">Account</th>
                <th class="px-6 py-3">Line Description</th>
                <th class="px-6 py-3 text-right">Debit</th>
                <th class="px-6 py-3 text-right">Credit</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
              <tr
                v-for="item in entry.items"
                :key="item.id"
                class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <div class="font-semibold text-gray-900 dark:text-gray-100">
                      {{ item.account.name }}
                    </div>
                    <span
                      v-if="item.account.is_restricted"
                      class="px-1.5 py-0.5 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-[10px] font-bold uppercase"
                    >
                      Restricted
                    </span>
                  </div>
                  <div class="text-xs text-primary-600 font-mono">{{ item.account.code }}</div>
                </td>
                <td class="px-6 py-4 text-gray-600 dark:text-gray-400 text-sm">
                  {{ item.description || '-' }}
                </td>
                <td class="px-6 py-4 text-right font-medium text-gray-900 dark:text-gray-100">
                  {{
                    item.debit > 0
                      ? Number(item.debit).toLocaleString(undefined, { minimumFractionDigits: 2 })
                      : '-'
                  }}
                </td>
                <td class="px-6 py-4 text-right font-medium text-gray-900 dark:text-gray-100">
                  {{
                    item.credit > 0
                      ? Number(item.credit).toLocaleString(undefined, { minimumFractionDigits: 2 })
                      : '-'
                  }}
                </td>
              </tr>
            </tbody>
            <tfoot class="bg-gray-50 dark:bg-gray-800/80 font-bold">
              <tr>
                <td colspan="2" class="px-6 py-4 text-right text-gray-500 uppercase text-xs">
                  Totals
                </td>
                <td class="px-6 py-4 text-right text-primary-600">
                  {{
                    Number(entry.total_amount).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })
                  }}
                </td>
                <td class="px-6 py-4 text-right text-primary-600">
                  {{
                    Number(entry.total_amount).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })
                  }}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>
