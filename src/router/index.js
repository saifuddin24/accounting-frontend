import { createRouter, createWebHistory } from 'vue-router'
import ChartOfAccounts from '../views/ChartOfAccounts.vue'
import Dashboard from '../views/Dashboard.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_BASE_PATH),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard,
    },
    {
      path: '/journals',
      name: 'journals',
      component: () => import('../views/JournalEntryList.vue'),
    },
    {
      path: '/journals/create',
      name: 'journals-create',
      component: () => import('../views/JournalEntryCreate.vue'),
    },
    {
      path: '/journals/quick',
      name: 'journals-quick',
      component: () => import('../views/JournalQuickCreate.vue'),
    },
    {
      path: '/journals/:id',
      name: 'journals-show',
      component: () => import('../views/JournalEntryShow.vue'),
    },
    {
      path: '/reports',
      name: 'reports',
      component: () => import('../views/LedgerReport.vue')
    },
    {
      path: '/trial-balance',
      name: 'trial-balance',
      component: () => import('../views/TrialBalance.vue')
    },
    {
      path: '/accounts',
      name: 'accounts',
      component: ChartOfAccounts,
    },
    {
      path: '/income-statement',
      name: 'income-statement',
      component: () => import('../views/IncomeStatement.vue')
    },
    {
      path: '/balance-sheet',
      name: 'balance-sheet',
      component: () => import('../views/BalanceSheet.vue')
    },
    {
      path: '/worksheet',
      name: 'worksheet',
      component: () => import('../views/WorksheetReport.vue')
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/Settings.vue')
    }
  ],
})

export default router
