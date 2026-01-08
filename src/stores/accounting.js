import { api } from '@/utils/api'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAccountingStore = defineStore('accounting', () => {
  const accounts = ref([])
  const journals = ref([])
  const loading = ref(false)
  const error = ref(null)

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
    journals,
    loading,
    error,
    fetchAccounts,
    createAccount,
    createJournalEntry,
    fetchJournals,
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
