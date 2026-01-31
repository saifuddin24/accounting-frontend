<script setup>
import {
  BookText,
  CheckCircle2,
  ChevronLeft,
  CreditCard,
  PlusCircle,
  Save,
  Scale,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-vue-next'
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

// Stepper state
const currentStep = ref(1)
const selectedType = ref(null)
const selectedAccount = ref(null)

// Form state
const entryDate = ref(new Date().toISOString().slice(0, 10))
const mainDescription = ref('')
const mainAccountItems = ref([{ description: '', amount: '', type: 'debit' }])
const otherItems = ref([])
const oppositeItems = ref([{ account_id: '', description: '', amount: '', type: 'credit' }])

const accountTypes = [
  {
    id: 'Asset',
    name: 'Assets',
    icon: Wallet,
    color: 'text-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
  },
  {
    id: 'Liability',
    name: 'Liabilities',
    icon: CreditCard,
    color: 'text-red-600',
    bg: 'bg-red-50 dark:bg-red-900/20',
  },
  {
    id: 'Equity',
    name: 'Equity',
    icon: Scale,
    color: 'text-purple-600',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
  },
  {
    id: 'Income',
    name: 'Income',
    icon: TrendingUp,
    color: 'text-green-600',
    bg: 'bg-green-50 dark:bg-green-900/20',
  },
  {
    id: 'Expense',
    name: 'Expense',
    icon: TrendingDown,
    color: 'text-orange-600',
    bg: 'bg-orange-50 dark:bg-orange-900/20',
  },
]

const filteredAccounts = computed(() => {
  if (!selectedType.value) return []
  return store.accounts.filter((acc) => acc.type === selectedType.value)
})

function selectType(type) {
  selectedType.value = type
  currentStep.value = 2
}

function selectAccount(account) {
  selectedAccount.value = account
  if (!mainDescription.value) {
    mainDescription.value = `${account.name} Transaction`
  }

  const isDebitAccount = ['Asset', 'Expense'].includes(selectedAccount.value.type)
  mainAccountItems.value = [
    {
      description: mainDescription.value,
      amount: '',
      type: isDebitAccount ? 'debit' : 'credit',
    },
  ]

  oppositeItems.value = [
    {
      account_id: '',
      description: mainDescription.value,
      amount: '',
      type: isDebitAccount ? 'credit' : 'debit',
    },
  ]

  currentStep.value = 3
}

function addMainRow() {
  mainAccountItems.value.push({
    description: mainDescription.value,
    amount: '',
    type: mainAccountItems.value[0].type,
  })
}

function removeMainRow(index) {
  if (mainAccountItems.value.length > 1) {
    mainAccountItems.value.splice(index, 1)
  }
}

function addOtherRow() {
  otherItems.value.push({
    account_id: '',
    description: mainDescription.value,
    amount: '',
    type: mainAccountItems.value[0].type,
  })
}

function removeOtherRow(index) {
  otherItems.value.splice(index, 1)
}

function addOppositeRow() {
  oppositeItems.value.push({
    account_id: '',
    description: mainDescription.value,
    amount: '',
    type: oppositeItems.value[0].type,
  })
}

function removeOppositeRow(index) {
  if (oppositeItems.value.length > 1) {
    oppositeItems.value.splice(index, 1)
  }
}

const totalMainAmount = computed(() => {
  const mainTotal = mainAccountItems.value.reduce(
    (sum, item) => sum + (parseFloat(item.amount) || 0),
    0,
  )
  const otherTotal = otherItems.value.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)
  return mainTotal + otherTotal
})

const isValid = computed(() => {
  return (
    mainDescription.value &&
    mainAccountItems.value.length > 0 &&
    mainAccountItems.value.every((item) => (parseFloat(item.amount) || 0) > 0) &&
    otherItems.value.every((item) => item.account_id && (parseFloat(item.amount) || 0) > 0) &&
    oppositeItems.value.every((item) => item.account_id)
  )
})

async function submitEntry() {
  if (!isValid.value) return

  await form.submit(async () => {
    await store.createQuickJournalEntry({
      date: entryDate.value,
      description: mainDescription.value,
      main_account_id: selectedAccount.value.id,
      main_account_items: [
        ...mainAccountItems.value.map((item) => ({
          description: item.description || mainDescription.value,
          amount: parseFloat(item.amount),
          type: item.type,
        })),
        ...otherItems.value.map((item) => ({
          account_id: item.account_id,
          description: item.description || mainDescription.value,
          amount: parseFloat(item.amount),
          type: item.type,
        })),
      ],
      opposite_items: oppositeItems.value.map((item, idx) => ({
        account_id: item.account_id,
        description: item.description || mainDescription.value,
        amount: idx === 0 ? null : parseFloat(item.amount) || 0,
        type: item.type,
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
  <div class="max-w-5xl mx-auto px-4 py-6">
    <!-- Header/Stepper -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Create Journal Shortcut</h1>
      <p class="text-gray-500 dark:text-gray-400">
        Follow the steps to quickly record a transaction
      </p>

      <div class="flex items-center mt-6">
        <div
          class="flex items-center"
          :class="currentStep >= 1 ? 'text-primary-600' : 'text-gray-400'"
        >
          <div
            class="w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold"
            :class="
              currentStep >= 1
                ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-300'
            "
          >
            1
          </div>
          <span class="ml-2 font-medium">Type</span>
        </div>
        <div
          class="flex-1 border-t-2 mx-4"
          :class="currentStep >= 2 ? 'border-primary-600' : 'border-gray-200'"
        ></div>
        <div
          class="flex items-center"
          :class="currentStep >= 2 ? 'text-primary-600' : 'text-gray-400'"
        >
          <div
            class="w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold"
            :class="
              currentStep >= 2
                ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-300'
            "
          >
            2
          </div>
          <span class="ml-2 font-medium">Account</span>
        </div>
        <div
          class="flex-1 border-t-2 mx-4"
          :class="currentStep >= 3 ? 'border-primary-600' : 'border-gray-200'"
        ></div>
        <div
          class="flex items-center"
          :class="currentStep >= 3 ? 'text-primary-600' : 'text-gray-400'"
        >
          <div
            class="w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold"
            :class="
              currentStep >= 3
                ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-300'
            "
          >
            3
          </div>
          <span class="ml-2 font-medium">Entry</span>
        </div>
      </div>
    </div>

    <!-- Step 1: Account Types -->
    <div
      v-if="currentStep === 1"
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
    >
      <button
        v-for="type in accountTypes"
        :key="type.id"
        @click="selectType(type.id)"
        class="card hover:shadow-lg transition-all duration-300 p-6 flex flex-col items-center group"
      >
        <div
          class="p-4 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300"
          :class="type.bg"
        >
          <component :is="type.icon" class="w-8 h-8" :class="type.color" />
        </div>
        <span class="font-bold text-gray-900 dark:text-white">{{ type.name }}</span>
        <span class="text-xs text-gray-500 mt-1">Select {{ type.name.toLowerCase() }} account</span>
      </button>
    </div>

    <!-- Step 2: Accounts Grid -->
    <div v-if="currentStep === 2">
      <div class="flex items-center gap-4 mb-6">
        <button
          @click="currentStep = 1"
          class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ChevronLeft class="w-5 h-5" />
        </button>
        <h2 class="text-xl font-bold flex items-center gap-2">
          Select
          <span :class="accountTypes.find((t) => t.id === selectedType)?.color">{{
            selectedType
          }}</span>
          Account
        </h2>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          v-for="acc in filteredAccounts"
          :key="acc.id"
          @click="selectAccount(acc)"
          class="card p-4 text-left hover:border-primary-500 hover:ring-1 hover:ring-primary-500 transition-all flex items-center gap-4 group"
        >
          <div
            class="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 font-bold group-hover:bg-primary-50 group-hover:text-primary-600"
          >
            {{ acc.code.charAt(0) }}
          </div>
          <div>
            <div class="font-bold text-gray-900 dark:text-white">{{ acc.name }}</div>
            <div class="text-xs text-gray-500">{{ acc.code }} • {{ acc.sub_type }}</div>
          </div>
        </button>
      </div>

      <div v-if="filteredAccounts.length === 0" class="text-center py-12 card">
        <BookText class="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p class="text-gray-500">No accounts found for this type.</p>
        <button @click="router.push('/accounts')" class="text-primary-600 mt-2 font-medium">
          Create one in Chart of Accounts
        </button>
      </div>
    </div>

    <!-- Step 3: Fast Entry Form -->
    <div v-if="currentStep === 3">
      <div class="flex items-center gap-4 mb-6">
        <button
          @click="currentStep = 2"
          class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ChevronLeft class="w-5 h-5" />
        </button>
        <div>
          <h2 class="text-xl font-bold">
            Fast Entry for <span class="text-primary-600">{{ selectedAccount.name }}</span>
          </h2>
          <div class="text-sm text-gray-500">
            {{ selectedAccount.code }} • {{ selectedAccount.type }}
          </div>
        </div>
      </div>

      <FormAlert :message="form.errorMessage.value" type="error" />
      <FormAlert :message="form.successMessage.value" type="success" />

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Form -->
        <div class="lg:col-span-2 space-y-6">
          <div class="card p-6 shadow-md border-t-4 border-primary-600">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div>
                <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2"
                  >Transaction Date</label
                >
                <input
                  type="date"
                  v-model="entryDate"
                  class="input-primary"
                  :class="{ 'border-red-500 ring-red-500/20': form.errors.value.date }"
                />
                <InputError :message="form.errors.value.date" />
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2"
                  >General Narrative</label
                >
                <input
                  type="text"
                  v-model="mainDescription"
                  class="input-primary"
                  :class="{ 'border-red-500 ring-red-500/20': form.errors.value.description }"
                  placeholder="e.g. Purchase of Assets"
                />
                <InputError :message="form.errors.value.description" />
              </div>
            </div>

            <div class="space-y-6">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="w-1.5 h-6 bg-primary-600 rounded-full"></div>
                  <h3
                    class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest"
                  >
                    {{ selectedAccount.name }} Lines (Mandatory)
                  </h3>
                </div>
              </div>

              <div class="space-y-3">
                <div
                  v-for="(item, index) in mainAccountItems"
                  :key="'main-' + index"
                  class="relative group animate-fade-in"
                >
                  <div
                    class="grid grid-cols-1 sm:grid-cols-12 gap-4 p-4 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-900/30 transition-all shadow-sm"
                  >
                    <div class="sm:col-span-7">
                      <label class="text-[10px] font-black text-gray-400 uppercase mb-1 block"
                        >Description</label
                      >
                      <input
                        type="text"
                        v-model="item.description"
                        class="input-primary text-sm py-1.5"
                        placeholder="Detail for this line"
                      />
                    </div>
                    <div class="sm:col-span-4">
                      <label class="text-[10px] font-black text-gray-400 uppercase mb-1 block"
                        >Amount</label
                      >
                      <div class="relative">
                        <input
                          type="number"
                          v-model="item.amount"
                          step="0.01"
                          class="input-primary text-sm py-1.5 pr-12 font-bold"
                          placeholder="0.00"
                        />
                        <span
                          class="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 uppercase"
                        >
                          {{ item.type === 'debit' ? 'DR' : 'CR' }}
                        </span>
                      </div>
                    </div>
                    <div class="sm:col-span-1 flex items-end justify-center">
                      <button
                        v-if="mainAccountItems.length > 1"
                        @click="removeMainRow(index)"
                        class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                      >
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Add Main Line Button Moved to Bottom -->
                <div class="flex justify-end pt-2">
                  <button
                    @click="addMainRow"
                    class="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors border border-primary-600/20"
                  >
                    <PlusCircle class="w-4 h-4" /> ADD LINE
                  </button>
                </div>
              </div>

              <!-- Other Transactions Section -->
              <div class="pt-6 space-y-6">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <div class="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
                    <h3
                      class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest"
                    >
                      Other transactions (Primary side)
                    </h3>
                  </div>
                </div>

                <div class="space-y-3">
                  <div
                    v-for="(item, index) in otherItems"
                    :key="'other-' + index"
                    class="relative group animate-fade-in"
                  >
                    <div
                      class="grid grid-cols-1 sm:grid-cols-12 gap-4 p-4 rounded-xl bg-indigo-50/30 dark:bg-indigo-900/10 border border-indigo-100/50 dark:border-indigo-900/20 hover:border-indigo-200 transition-all shadow-sm"
                    >
                      <div class="sm:col-span-4">
                        <label class="text-[10px] font-black text-gray-400 uppercase mb-1 block"
                          >Account</label
                        >
                        <SelectDropdown
                          v-model="item.account_id"
                          :options="store.accountOptions"
                          placeholder="Select Account"
                        />
                      </div>
                      <div class="sm:col-span-4">
                        <label class="text-[10px] font-black text-gray-400 uppercase mb-1 block"
                          >Description</label
                        >
                        <input
                          type="text"
                          v-model="item.description"
                          class="input-primary text-sm py-1.5"
                          placeholder="Detail for this line"
                        />
                      </div>
                      <div class="sm:col-span-3">
                        <label class="text-[10px] font-black text-gray-400 uppercase mb-1 block"
                          >Amount</label
                        >
                        <div class="relative">
                          <input
                            type="number"
                            v-model="item.amount"
                            step="0.01"
                            class="input-primary text-sm py-1.5 pr-12 font-bold"
                            placeholder="0.00"
                          />
                          <span
                            class="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 uppercase"
                          >
                            {{ item.type === 'debit' ? 'DR' : 'CR' }}
                          </span>
                        </div>
                      </div>
                      <div class="sm:col-span-1 flex items-end justify-center">
                        <button
                          @click="removeOtherRow(index)"
                          class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                        >
                          <Trash2 class="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div class="flex justify-end pt-2">
                    <button
                      @click="addOtherRow"
                      class="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors border border-indigo-600/20"
                    >
                      <PlusCircle class="w-4 h-4" /> ADD OTHER LINE
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="my-10 border-t border-dashed border-gray-200 dark:border-gray-700"></div>

            <div class="space-y-6">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="w-1.5 h-6 bg-orange-500 rounded-full"></div>
                  <h3
                    class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest"
                  >
                    Opposite Account (Auto-calculated)
                  </h3>
                </div>
                <!-- Optional: Allow more than one opposite, though first will be the balancing one -->
                <button
                  @click="addOppositeRow"
                  class="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors border border-gray-200 dark:border-gray-700"
                >
                  <PlusCircle class="w-4 h-4" /> ADD ACCOUNT
                </button>
              </div>

              <div class="space-y-4">
                <div
                  v-for="(item, index) in oppositeItems"
                  :key="'opp-' + index"
                  class="p-5 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50"
                  :class="{ 'opacity-100': item.account_id, 'opacity-70': !item.account_id }"
                >
                  <div class="grid grid-cols-1 sm:grid-cols-12 gap-6">
                    <div class="sm:col-span-7">
                      <label class="text-[10px] font-black text-gray-400 uppercase mb-2 block"
                        >Balancing Account</label
                      >
                      <SelectDropdown
                        v-model="item.account_id"
                        :options="store.accountOptions"
                        placeholder="Search for Bank, Cash or Payable account..."
                        :class="{
                          'border-red-500': form.errors.value[`opposite_items.${index}.account_id`],
                        }"
                      />
                      <InputError
                        :message="form.errors.value[`opposite_items.${index}.account_id`]"
                      />
                    </div>
                    <div class="sm:col-span-4">
                      <label class="text-[10px] font-black text-gray-400 uppercase mb-2 block"
                        >Value</label
                      >
                      <div
                        class="h-10 flex items-center px-4 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm font-bold text-gray-900 dark:text-white border border-gray-100 dark:border-gray-700"
                      >
                        <span v-if="index === 0" class="text-orange-600 italic">
                          Auto-calculated
                        </span>
                        <input
                          v-else
                          type="number"
                          v-model="item.amount"
                          class="bg-transparent w-full outline-none"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div class="sm:col-span-1 flex items-end justify-center">
                      <button
                        v-if="oppositeItems.length > 1"
                        @click="removeOppositeRow(index)"
                        class="p-2 text-gray-400 hover:text-red-500 rounded-lg"
                      >
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Summary & Post -->
        <div class="space-y-6">
          <div class="card p-6 sticky top-6 overflow-hidden">
            <div
              class="absolute top-0 right-0 w-32 h-32 bg-primary-100/20 dark:bg-primary-900/10 rounded-full -mr-16 -mt-16"
            ></div>

            <div class="relative">
              <h3 class="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <CheckCircle2 class="w-5 h-5 text-green-500" />
                Posting Summary
              </h3>

              <div class="space-y-5">
                <div class="flex flex-col">
                  <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1"
                    >Primary Side</span
                  >
                  <div class="flex justify-between items-baseline">
                    <span class="font-bold text-gray-900 dark:text-white truncate max-w-[150px]">
                      {{ selectedAccount.name }}
                      <span v-if="otherItems.length > 0" class="text-xs text-gray-400 font-normal">
                        (+{{ otherItems.length }} others)
                      </span>
                    </span>
                    <span class="font-black text-lg text-primary-600">
                      {{
                        (totalMainAmount || 0).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })
                      }}
                    </span>
                  </div>
                </div>

                <div class="flex flex-col">
                  <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1"
                    >Balancing Side</span
                  >
                  <div class="flex justify-between items-baseline">
                    <span class="text-gray-600 dark:text-gray-400 italic">Auto-calculated</span>
                    <span class="font-black text-lg text-orange-600">
                      {{
                        (totalMainAmount || 0).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })
                      }}
                    </span>
                  </div>
                  <p v-if="oppositeItems[0]?.account_id" class="text-[10px] text-gray-400 mt-1">
                    Target:
                    {{ store.accounts.find((a) => a.id === oppositeItems[0].account_id)?.name }}
                  </p>
                </div>

                <div class="pt-4 border-t border-gray-100 dark:border-gray-800">
                  <div class="flex justify-between text-xs text-gray-500 mb-2">
                    <span>Transaction Date</span>
                    <span class="font-medium">{{ entryDate }}</span>
                  </div>
                  <div class="flex justify-between text-xs text-gray-500">
                    <span>Reference Items</span>
                    <span class="font-medium underline decoration-primary-300"
                      >{{ mainAccountItems.length }} lines</span
                    >
                  </div>
                </div>
              </div>

              <div class="mt-10">
                <button
                  @click="submitEntry"
                  :disabled="!isValid"
                  class="group relative w-full px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl overflow-hidden transition-all hover:ring-4 hover:ring-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div
                    class="absolute inset-0 bg-primary-600 w-0 group-hover:w-full transition-all duration-300"
                  ></div>
                  <div class="relative flex items-center justify-center gap-2">
                    <span v-if="form.processing.value" class="animate-spin mr-2">⏳</span>
                    <Save v-else class="w-5 h-5" />
                    {{ form.processing.value ? 'RECORDING...' : 'RECORD TRANSACTION' }}
                  </div>
                </button>
                <p class="text-[10px] text-center text-gray-400 mt-4 leading-relaxed">
                  Clicking record will generate a balanced double-entry journal across your selected
                  ledger accounts.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
