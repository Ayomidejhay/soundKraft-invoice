import { supabase } from '@/lib/supabase'

export interface Customer {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  address?: string | null
  created_at?: string
}

export interface CustomerForm {
  name: string
  email?: string
  phone?: string
  address?: string
}

// Create
export async function createCustomer(data: CustomerForm) {
  const { error } = await supabase.from('customers').insert([data])
  if (error) throw error
}

// Fetch with pagination + search
export async function getCustomers(
  search: string,
  page: number,
  pageSize: number
) {
  let query = supabase
    .from('customers')
    .select('*')
    .order('name', { ascending: true })
    .range(page * pageSize, page * pageSize + pageSize - 1)

  if (search) {
    query = query.ilike('name', `%${search}%`)
  }

  const { data, error } = await query

  if (error) throw error
  return data as Customer[]
}

// Update
export async function updateCustomer(id: string, data: CustomerForm) {
  const { error } = await supabase
    .from('customers')
    .update(data)
    .eq('id', id)

  if (error) throw error
}

// Delete
export async function deleteCustomer(id: string) {
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id)

  if (error) throw error
}