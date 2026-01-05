// Custom types for the application

export interface UserSession {
  id: string
  email: string
  fullName: string
  role: string
  permissions: string[]
}

export interface PaginationParams {
  page: number
  pageSize: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Stock transaction types
export type StockTransactionType = 
  | 'purchase' 
  | 'sale' 
  | 'transfer_in' 
  | 'transfer_out' 
  | 'adjustment' 
  | 'return'

// Status types
export type PRStatus = 'pending' | 'approved' | 'rejected' | 'converted'
export type POStatus = 'issued' | 'partial' | 'received' | 'closed' | 'cancelled'
export type LCStatus = 'open' | 'shipped' | 'documents_received' | 'cleared' | 'closed'
export type QuotationStatus = 'draft' | 'sent' | 'revised' | 'accepted' | 'rejected' | 'expired'
export type SOStatus = 'confirmed' | 'processing' | 'partial' | 'delivered' | 'closed' | 'cancelled'
export type InvoiceStatus = 'unpaid' | 'partial' | 'paid'
export type VoucherStatus = 'draft' | 'pending' | 'approved' | 'posted' | 'cancelled'

// Account types
export type AccountType = 'asset' | 'liability' | 'equity' | 'income' | 'expense'

// Payment modes
export type PaymentMode = 'cash' | 'cheque' | 'bank_transfer'
