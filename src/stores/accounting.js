import { api } from '@/utils/api'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useAccountingStore = defineStore('accounting', () => {
  const accounts = ref([])
  const journals = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Centralized account options for SelectDropdown
  const accountOptions = computed(() => {
    const typeOrder = ['Asset', 'Liability', 'Equity', 'Income', 'Expense']
    return [...accounts.value]
      .sort((a, b) => {
        const typeOrderA = typeOrder.indexOf(a.type)
        const typeOrderB = typeOrder.indexOf(b.type)
        if (typeOrderA !== typeOrderB) return typeOrderA - typeOrderB
        return a.code.localeCompare(b.code)
      })
      .map((acc) => ({
        label: `${acc.code} - ${acc.name}`,
        value: acc.id,
        group: acc.type,
        subtext: acc.sub_type,
      }))
  })

  // Fetch all accounts
  async function fetchAccounts() {
    loading.value = true
    try {
      accounts.value = await api.get('/api/v1/accounts')
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  // Create a new account
  async function createAccount(accountData) {
    loading.value = true
    try {
      const data = await api.post('/api/v1/accounts', accountData)
      await fetchAccounts()
      return data
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  // Create a new journal entry
  async function createJournalEntry(entryData) {
    loading.value = true
    try {
      const data = await api.post('/api/v1/journals', entryData)
      return data
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }
  
  // Create a quick journal entry
  async function createQuickJournalEntry(entryData) {
    loading.value = true
    try {
      const data = await api.post('/api/v1/journals/quick', entryData)
      return data
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  // Fetch journals with optional query params
  async function fetchJournals(params = {}) {
    loading.value = true
    try {
      const query = new URLSearchParams(params).toString()
      const data = await api.get(`/api/v1/journals?${query}`)
      journals.value = data
      return data
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  // Fetch a single journal entry
  async function fetchJournalEntry(id) {
    loading.value = true
    try {
      return await api.get(`/api/v1/journals/${id}`)
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  // Delete a journal entry
  async function deleteJournalEntry(id) {
    loading.value = true
    try {
      await api.delete(`/api/v1/journals/${id}`)
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  // Fetch journal lines
  async function fetchJournalLines(params = {}) {
    loading.value = true
    try {
      const query = new URLSearchParams(params).toString()
      return await api.get(`/api/v1/journal-lines?${query}`)
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  // Fetch ledger report
  async function fetchLedger(accountId, startDate, endDate) {
    loading.value = true
    try {
      const query = new URLSearchParams({ start_date: startDate, end_date: endDate }).toString()
      return await api.get(`/api/v1/reports/ledger/${accountId}?${query}`)
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  // Fetch trial balance report
  async function fetchTrialBalance(date) {
    loading.value = true
    try {
      const query = new URLSearchParams({ date }).toString()
      return await api.get(`/api/v1/reports/trial-balance?${query}`)
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  // Fetch income statement
  async function fetchIncomeStatement(startDate, endDate) {
    loading.value = true
    try {
      const query = new URLSearchParams({ start_date: startDate, end_date: endDate }).toString()
      return await api.get(`/api/v1/reports/income-statement?${query}`)
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  // Fetch balance sheet
  async function fetchBalanceSheet(date) {
    loading.value = true
    try {
      const query = new URLSearchParams({ date }).toString()
      return await api.get(`/api/v1/reports/balance-sheet?${query}`)
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  // Fetch worksheet
  async function fetchWorksheet(date) {
    loading.value = true
    try {
      const query = new URLSearchParams({ date }).toString()
      return await api.get(`/api/v1/reports/worksheet?${query}`)
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  // Fetch dashboard stats
  async function fetchDashboardStats() {
    loading.value = true
    try {
      return await api.get('/api/v1/dashboard/stats')
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  // Companies
  async function fetchCompanies() {
    return await api.get('/api/v1/companies')
  }

  async function updateCompany(id, data) {
    return await api.put(`/api/v1/companies/${id}`, data)
  }

  async function createCompany(data) {
    return await api.post('/api/v1/companies', data)
  }

  // Fiscal Years
  async function fetchFiscalYears() {
    return await api.get('/api/v1/fiscal-years')
  }

  async function updateFiscalYear(id, data) {
    return await api.put(`/api/v1/fiscal-years/${id}`, data)
  }

  async function createFiscalYear(data) {
    return await api.post('/api/v1/fiscal-years', data)
  }

  return {
    accounts,
    accountOptions,
    journals,
    loading,
    error,
    fetchAccounts,
    createAccount,
    createJournalEntry,
    createQuickJournalEntry,
    fetchJournals,
    fetchJournalEntry,
    deleteJournalEntry,
    fetchJournalLines,
    fetchLedger,
    fetchTrialBalance,
    fetchIncomeStatement,
    fetchBalanceSheet,
    fetchWorksheet,
    fetchDashboardStats,
    fetchCompanies,
    updateCompany,
    createCompany,
    fetchFiscalYears,
    updateFiscalYear,
    createFiscalYear
  }
})
