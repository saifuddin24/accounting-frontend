<script setup>
import { ref, onMounted } from 'vue'
import { useAccountingStore } from '../stores/accounting'
import { Search, Printer, Layout } from 'lucide-vue-next'

const store = useAccountingStore()

const asOfDate = ref(new Date().toISOString().slice(0, 10))
const reportData = ref(null)

async function generateReport() {
    try {
        reportData.value = await store.fetchWorksheet(asOfDate.value)
    } catch (e) {
        // Handled
    }
}

const formatCurrency = (val) => val === 0 ? '-' : Number(val).toLocaleString(undefined, { minimumFractionDigits: 2 })

onMounted(() => {
    generateReport()
})
</script>

<template>
    <div class="max-w-[100vw] overflow-hidden">
        <div class="flex items-center justify-between mb-6">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">10-Column Worksheet</h1>
            <button class="btn-primary bg-gray-600 hover:bg-gray-700">
                <Printer class="w-4 h-4"/> Print
            </button>
        </div>

        <div class="card p-4 mb-6 flex items-end gap-4">
            <div>
                <label class="block text-sm font-medium mb-1">Date</label>
                <input type="date" v-model="asOfDate" class="input-primary w-48">
            </div>
            <button @click="generateReport" class="btn-primary">
                <Search class="w-4 h-4" /> Run Report
            </button>
        </div>

        <div v-if="reportData" class="card overflow-x-auto animate-fade-in">
            <table class="w-full text-xs text-left border-collapse">
                <thead class="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 uppercase font-semibold">
                    <tr>
                        <th rowspan="2" class="px-4 py-3 border border-gray-200 dark:border-gray-700">Account</th>
                        <th colspan="2" class="px-4 py-2 border border-gray-200 dark:border-gray-700 text-center bg-gray-200/50 dark:bg-gray-700/50">Trial Balance</th>
                        <th colspan="2" class="px-4 py-2 border border-gray-200 dark:border-gray-700 text-center bg-blue-50 dark:bg-blue-900/20">Income Statement</th>
                        <th colspan="2" class="px-4 py-2 border border-gray-200 dark:border-gray-700 text-center bg-green-50 dark:bg-green-900/20">Balance Sheet</th>
                    </tr>
                    <tr class="text-[10px]">
                        <th class="px-2 py-2 border border-gray-200 dark:border-gray-700 text-right w-24">Dr.</th>
                        <th class="px-2 py-2 border border-gray-200 dark:border-gray-700 text-right w-24">Cr.</th>
                        <th class="px-2 py-2 border border-gray-200 dark:border-gray-700 text-right w-24">Dr.</th>
                        <th class="px-2 py-2 border border-gray-200 dark:border-gray-700 text-right w-24">Cr.</th>
                        <th class="px-2 py-2 border border-gray-200 dark:border-gray-700 text-right w-24">Dr.</th>
                        <th class="px-2 py-2 border border-gray-200 dark:border-gray-700 text-right w-24">Cr.</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                    <tr v-for="line in reportData.lines" :key="line.account_code" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td class="px-4 py-2 border border-gray-100 dark:border-gray-700">
                            <span class="text-gray-500 font-mono mr-2">{{ line.account_code }}</span>
                            <span class="font-medium text-gray-900 dark:text-white">{{ line.account_name }}</span>
                        </td>
                        <td class="px-2 py-2 border border-gray-100 dark:border-gray-700 text-right text-gray-500">{{ formatCurrency(line.tb_debit) }}</td>
                        <td class="px-2 py-2 border border-gray-100 dark:border-gray-700 text-right text-gray-500">{{ formatCurrency(line.tb_credit) }}</td>
                        <td class="px-2 py-2 border border-gray-100 dark:border-gray-700 text-right">{{ formatCurrency(line.is_debit) }}</td>
                        <td class="px-2 py-2 border border-gray-100 dark:border-gray-700 text-right">{{ formatCurrency(line.is_credit) }}</td>
                        <td class="px-2 py-2 border border-gray-100 dark:border-gray-700 text-right">{{ formatCurrency(line.bs_debit) }}</td>
                        <td class="px-2 py-2 border border-gray-100 dark:border-gray-700 text-right">{{ formatCurrency(line.bs_credit) }}</td>
                    </tr>
                </tbody>
                <tfoot class="font-bold bg-gray-50 dark:bg-gray-800">
                    <!-- Totals -->
                    <tr class="text-gray-900 dark:text-white">
                        <td class="px-4 py-3 border border-gray-200 dark:border-gray-700">Totals</td>
                        <td class="px-2 py-3 border border-gray-200 dark:border-gray-700 text-right">{{ formatCurrency(reportData.totals.tb_debit) }}</td>
                        <td class="px-2 py-3 border border-gray-200 dark:border-gray-700 text-right">{{ formatCurrency(reportData.totals.tb_credit) }}</td>
                        <td class="px-2 py-3 border border-gray-200 dark:border-gray-700 text-right">{{ formatCurrency(reportData.totals.is_debit) }}</td>
                        <td class="px-2 py-3 border border-gray-200 dark:border-gray-700 text-right">{{ formatCurrency(reportData.totals.is_credit) }}</td>
                        <td class="px-2 py-3 border border-gray-200 dark:border-gray-700 text-right">{{ formatCurrency(reportData.totals.bs_debit) }}</td>
                        <td class="px-2 py-3 border border-gray-200 dark:border-gray-700 text-right">{{ formatCurrency(reportData.totals.bs_credit) }}</td>
                    </tr>
                    <!-- Net Income balancing line -->
                    <tr class="text-blue-600 dark:text-blue-400">
                        <td class="px-4 py-2 border border-gray-200 dark:border-gray-700 italic">Net Income / (Loss)</td>
                        <td class="border border-gray-200 dark:border-gray-700"></td>
                        <td class="border border-gray-200 dark:border-gray-700"></td>
                        <td class="px-2 py-2 border border-gray-200 dark:border-gray-700 text-right">
                            {{ reportData.net_income > 0 ? formatCurrency(reportData.net_income) : '-' }}
                        </td>
                        <td class="px-2 py-2 border border-gray-200 dark:border-gray-700 text-right">
                            {{ reportData.net_income < 0 ? formatCurrency(Math.abs(reportData.net_income)) : '-' }}
                        </td>
                        <td class="px-2 py-2 border border-gray-200 dark:border-gray-700 text-right">
                            {{ reportData.net_income < 0 ? formatCurrency(Math.abs(reportData.net_income)) : '-' }}
                        </td>
                        <td class="px-2 py-2 border border-gray-200 dark:border-gray-700 text-right">
                            {{ reportData.net_income > 0 ? formatCurrency(reportData.net_income) : '-' }}
                        </td>
                    </tr>
                    <!-- Grand Totals -->
                    <tr class="text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700">
                        <td class="px-4 py-3 border border-gray-200 dark:border-gray-700">Grand Totals</td>
                        <td colspan="2" class="border border-gray-200 dark:border-gray-700 text-center">—</td>
                        <td class="px-2 py-3 border border-gray-200 dark:border-gray-700 text-right underline decoration-double">
                            {{ formatCurrency(Math.max(reportData.totals.is_debit, reportData.totals.is_credit)) }}
                        </td>
                        <td class="px-2 py-3 border border-gray-200 dark:border-gray-700 text-right underline decoration-double">
                            {{ formatCurrency(Math.max(reportData.totals.is_debit, reportData.totals.is_credit)) }}
                        </td>
                         <td class="px-2 py-3 border border-gray-200 dark:border-gray-700 text-right underline decoration-double">
                            {{ formatCurrency(Math.max(reportData.totals.bs_debit, reportData.totals.bs_credit)) }}
                        </td>
                        <td class="px-2 py-3 border border-gray-200 dark:border-gray-700 text-right underline decoration-double">
                            {{ formatCurrency(Math.max(reportData.totals.bs_debit, reportData.totals.bs_credit)) }}
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    </div>
</template>
