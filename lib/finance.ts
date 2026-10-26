import { Transaction } from './types'

export const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

export function getLocalDateInputValue(date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function filterTransactionsByPeriod(
  transactions: Transaction[],
  monthIndex: number,
  year: number
): Transaction[] {
  const period = `${year}-${String(monthIndex + 1).padStart(2, '0')}`
  return transactions.filter((transaction) => transaction.date.startsWith(period))
}

export function summarizeTransactions(transactions: Transaction[]) {
  const total_earnings = transactions
    .filter((transaction) => transaction.type === 'EARNING')
    .reduce((sum, transaction) => sum + transaction.amount, 0)
  const total_expenses = transactions
    .filter((transaction) => transaction.type === 'EXPENSE')
    .reduce((sum, transaction) => sum + transaction.amount, 0)
  const total_investments = transactions
    .filter((transaction) => transaction.type === 'INVESTMENT')
    .reduce((sum, transaction) => sum + transaction.amount, 0)

  return {
    total_earnings,
    total_expenses,
    total_investments,
    net_balance: total_earnings - total_expenses - total_investments,
  }
}

export function sanitizeCsvCell(value: string): string {
  return /^[\s]*[=+\-@\t\r]/.test(value) ? `'${value}` : value
}