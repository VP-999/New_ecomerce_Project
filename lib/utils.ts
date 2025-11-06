import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrencyBDT(amount: number): string {
  if (Number.isNaN(amount)) return '৳0.00'
  return `৳${amount.toFixed(2)}`
}
