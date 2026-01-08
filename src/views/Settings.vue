<script setup>
import { Building2, Calendar, Plus, X } from 'lucide-vue-next'
import { onMounted, ref } from 'vue'
import { useAccountingStore } from '../stores/accounting'

const store = useAccountingStore()
const activeTab = ref('company')

const companies = ref([])
const fiscalYears = ref([])
const isLoading = ref(false)
const activeCompanyId = ref(localStorage.getItem('company_id'))
const activeFYId = ref(localStorage.getItem('fiscal_year_id'))

// Selectors for editing
const editingCompany = ref(null)
const editingFY = ref(null)

async function loadData() {
  isLoading.value = true
  try {
    companies.value = await store.fetchCompanies()
    fiscalYears.value = await store.fetchFiscalYears()
  } catch (e) {
    console.error(e)
  } finally {
    isLoading.value = false
  }
}

async function saveCompany() {
  try {
    if (editingCompany.value.id) {
      await store.updateCompany(editingCompany.value.id, editingCompany.value)
    } else {
      await store.createCompany(editingCompany.value)
    }
    editingCompany.value = null
    await loadData()
  } catch (e) {
    alert('Error saving company')
  }
}

async function saveFY() {
  try {
    if (editingFY.value.id) {
      await store.updateFiscalYear(editingFY.value.id, editingFY.value)
    } else {
      await store.createFiscalYear(editingFY.value)
    }
    editingFY.value = null
    await loadData()
  } catch (e) {
    alert('Error saving fiscal year')
  }
}

function startEditCompany(company = null) {
  editingCompany.value = company
    ? { ...company }
    : {
        name: '',
        tax_id: '',
        currency_code: 'BDT',
        address: '',
        phone: '',
        email: '',
      }
}

function startEditFY(fy = null) {
  editingFY.value = fy
    ? { ...fy }
    : {
        name: '',
        start_date: new Date().toISOString().slice(0, 10),
        end_date: new Date(new Date().getFullYear(), 11, 31).toISOString().slice(0, 10),
        is_closed: false,
      }
}

onMounted(loadData)
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
      <p class="text-gray-500 dark:text-gray-400">Manage your companies and fiscal periods.</p>
    </div>

    <!-- Tabs -->
    <div class="flex gap-4 border-b border-gray-200 dark:border-gray-700 mb-8">
      <button
        @click="activeTab = 'company'"
        :class="
          activeTab === 'company'
            ? 'border-primary-500 text-primary-600'
            : 'border-transparent text-gray-500 hover:text-gray-700'
        "
        class="pb-4 px-2 border-b-2 font-medium transition-colors"
      >
        Companies
      </button>
      <button
        @click="activeTab = 'fiscal'"
        :class="
          activeTab === 'fiscal'
            ? 'border-primary-500 text-primary-600'
            : 'border-transparent text-gray-500 hover:text-gray-700'
        "
        class="pb-4 px-2 border-b-2 font-medium transition-colors"
      >
        Fiscal Years
      </button>
    </div>

    <!-- Company Settings -->
    <div v-if="activeTab === 'company'" class="space-y-6 animate-fade-in">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold text-gray-800 dark:text-white">Registered Companies</h2>
        <button @click="startEditCompany()" class="btn-primary py-2 px-4 text-sm">
          <Plus class="w-4 h-4" /> Add Company
        </button>
      </div>

      <div class="grid grid-cols-1 gap-4">
        <div
          v-for="company in companies"
          :key="company.id"
          class="card p-5 flex justify-between items-center hover:shadow-md transition-shadow"
        >
          <div class="flex items-center gap-4">
            <div
              class="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center"
            >
              <Building2 class="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 class="font-bold text-gray-900 dark:text-white">{{ company.name }}</h3>
              <p class="text-sm text-gray-500">
                {{ company.email || 'No email set' }} • {{ company.currency_code }}
              </p>
            </div>
          </div>
          <button
            @click="startEditCompany(company)"
            class="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            Edit
          </button>
        </div>
      </div>

      <!-- Company Modal -->
      <div
        v-if="editingCompany"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      >
        <div
          class="bg-white dark:bg-dark-surface w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-zoom-in"
        >
          <div
            class="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center"
          >
            <h3 class="text-lg font-bold">
              {{ editingCompany.id ? 'Edit Company' : 'New Company' }}
            </h3>
            <button @click="editingCompany = null" class="text-gray-400 hover:text-gray-600">
              <X class="w-5 h-5" />
            </button>
          </div>
          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium mb-1">Company Name</label>
              <input
                v-model="editingCompany.name"
                type="text"
                class="input-primary"
                placeholder="Enter name"
              />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-1">Tax ID</label>
                <input
                  v-model="editingCompany.tax_id"
                  type="text"
                  class="input-primary"
                  placeholder="e.g. 123456"
                />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Currency (ISO)</label>
                <input
                  v-model="editingCompany.currency_code"
                  type="text"
                  class="input-primary"
                  placeholder="BDT"
                />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Email</label>
              <input
                v-model="editingCompany.email"
                type="email"
                class="input-primary"
                placeholder="company@example.com"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Address</label>
              <textarea
                v-model="editingCompany.address"
                class="input-primary h-20"
                placeholder="Street address..."
              ></textarea>
            </div>
          </div>
          <div class="p-6 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
            <button
              @click="editingCompany = null"
              class="px-4 py-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              Cancel
            </button>
            <button @click="saveCompany" class="btn-primary px-6">Save Changes</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Fiscal Year Settings -->
    <div v-if="activeTab === 'fiscal'" class="space-y-6 animate-fade-in">
      <div class="flex justify-between items-center mb-4">
        <div>
          <h2 class="text-xl font-semibold text-gray-800 dark:text-white">Accounting Periods</h2>
          <p class="text-xs text-gray-500">
            Filtered by Company ID: {{ activeCompanyId || 'None' }}
          </p>
        </div>
        <button @click="startEditFY()" class="btn-primary py-2 px-4 text-sm">
          <Plus class="w-4 h-4" /> Add Fiscal Year
        </button>
      </div>

      <div class="overflow-hidden card">
        <table class="w-full text-left text-sm">
          <thead
            class="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 uppercase font-semibold"
          >
            <tr>
              <th class="px-6 py-3">Period Name</th>
              <th class="px-6 py-3">Start Date</th>
              <th class="px-6 py-3">End Date</th>
              <th class="px-6 py-3">Status</th>
              <th class="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
            <tr
              v-for="fy in fiscalYears"
              :key="fy.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <Calendar class="w-4 h-4 text-indigo-500" />
                  <span class="font-bold text-gray-900 dark:text-white">{{ fy.name }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-gray-600 dark:text-gray-400">{{ fy.start_date }}</td>
              <td class="px-6 py-4 text-gray-600 dark:text-gray-400">{{ fy.end_date }}</td>
              <td class="px-6 py-4">
                <span
                  v-if="fy.is_closed"
                  class="px-2 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-700 uppercase"
                  >Closed</span
                >
                <span
                  v-else
                  class="px-2 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700 uppercase"
                  >Open</span
                >
                <span
                  v-if="fy.id == activeFYId"
                  class="ml-2 px-2 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 uppercase"
                  >Active</span
                >
              </td>
              <td class="px-6 py-4 text-right">
                <button
                  @click="startEditFY(fy)"
                  class="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Edit
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="fiscalYears.length === 0 && !isLoading" class="p-8 text-center text-gray-500">
          No fiscal years found for this company.
        </div>
      </div>

      <!-- FY Modal -->
      <div
        v-if="editingFY"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      >
        <div
          class="bg-white dark:bg-dark-surface w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-zoom-in"
        >
          <div
            class="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center"
          >
            <h3 class="text-lg font-bold">
              {{ editingFY.id ? 'Edit Fiscal Year' : 'New Fiscal Year' }}
            </h3>
            <button @click="editingFY = null" class="text-gray-400 hover:text-gray-600">
              <X class="w-5 h-5" />
            </button>
          </div>
          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium mb-1">Period Name</label>
              <input
                v-model="editingFY.name"
                type="text"
                class="input-primary"
                placeholder="e.g. FY 2025"
              />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-1">Start Date</label>
                <input v-model="editingFY.start_date" type="date" class="input-primary" />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">End Date</label>
                <input v-model="editingFY.end_date" type="date" class="input-primary" />
              </div>
            </div>
            <div class="flex items-center gap-3 py-2">
              <input
                v-model="editingFY.is_closed"
                type="checkbox"
                id="is_closed"
                class="w-4 h-4 text-primary-600 rounded"
              />
              <label for="is_closed" class="text-sm font-medium">Mark as Closed (Immutable)</label>
            </div>
          </div>
          <div class="p-6 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
            <button
              @click="editingFY = null"
              class="px-4 py-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              Cancel
            </button>
            <button @click="saveFY" class="btn-primary px-6">Save Period</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
