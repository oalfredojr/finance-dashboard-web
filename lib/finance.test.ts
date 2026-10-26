import { describe, expect, it } from 'vitest'
import { filterTransactionsByPeriod, getLocalDateInputValue, sanitizeCsvCell, summarizeTransactions } from './finance'
import { Transaction } from './types'

const transactions: Transaction[] = [
  { id: 'a', user_id: 'u', name: 'Salário', date: '2025-01-15', amount: 5000, type: 'EARNING' },
  { id: 'b', user_id: 'u', name: 'Aluguel', date: '2025-01-20', amount: 1500, type: 'EXPENSE' },
  { id: 'c', user_id: 'u', name: 'CDB', date: '2025-01-21', amount: 800, type: 'INVESTMENT' },
  { id: 'd', user_id: 'u', name: 'Bônus', date: '2026-01-15', amount: 500, type: 'EARNING' },
]

describe('finance helpers', () => {
  it('filters by month and year, not month alone', () => {
    expect(filterTransactionsByPeriod(transactions, 0, 2025).map(({ id }) => id)).toEqual([
      'a',
      'b',
      'c',
    ])
  })

  it('subtracts investments from the net balance, matching the API contract', () => {
    expect(summarizeTransactions(transactions)).toEqual({
      total_earnings: 5500,
      total_expenses: 1500,
      total_investments: 800,
      net_balance: 3200,
    })
  })

  it('neutralizes spreadsheet formula prefixes in exported cells', () => {
    expect(sanitizeCsvCell('=HYPERLINK("https://example.test")')).toBe(
      '\'=HYPERLINK("https://example.test")'
    )
    expect(sanitizeCsvCell('despesa normal')).toBe('despesa normal')
  })

  it('formats the date input using the local calendar date', () => {
    expect(getLocalDateInputValue(new Date(2026, 0, 3))).toBe('2026-01-03')
  })
})