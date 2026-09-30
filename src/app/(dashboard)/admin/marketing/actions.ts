'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

// ================================================================
// TYPES
// ================================================================
export type MarketingSection = {
  id: string
  section_key: string
  label: string
  data: Record<string, unknown>
  updated_at: string
  updated_by: string | null
}

export type CheckoutOrder = {
  id: string
  user_id: string | null
  program_id: string
  program_name: string
  tier_type: string
  tier_label: string
  amount: number
  payment_method: string
  status: string
  notes: string | null
  admin_notes: string | null
  confirmed_by: string | null
  confirmed_at: string | null
  created_at: string
  updated_at: string
  users?: { full_name: string; email: string } | null
  payment_proof_path: string | null
  payment_proof_uploaded_at: string | null
  payment_account_id: string | null
}

// ================================================================
// MARKETING CONTENT: Admin CMS
// ================================================================

export async function getAllMarketingContent(): Promise<MarketingSection[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('marketing_content')
      .select('*')
      .order('section_key')

    if (error) throw error
    return data || []
  } catch (err) {
    console.error('getAllMarketingContent error:', err)
    return []
  }
}

export async function getMarketingSection(sectionKey: string): Promise<Record<string, unknown> | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('marketing_content')
      .select('data')
      .eq('section_key', sectionKey)
      .single()

    if (error || !data) return null
    return data.data as Record<string, unknown>
  } catch {
    return null
  }
}

export async function updateMarketingSection(
  sectionKey: string,
  sectionData: Record<string, unknown>
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Cek apakah section sudah ada
    const { data: existing } = await supabase
      .from('marketing_content')
      .select('id')
      .eq('section_key', sectionKey)
      .single()

    let error;
    if (existing) {
      const { error: updateError } = await supabase
        .from('marketing_content')
        .update({
          data: sectionData,
          updated_at: new Date().toISOString(),
          updated_by: user?.id ?? null,
        })
        .eq('section_key', sectionKey)
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('marketing_content')
        .insert({
          section_key: sectionKey,
          label: sectionKey,
          data: sectionData,
          updated_by: user?.id ?? null,
        })
      error = insertError;
    }

    if (error) {
      console.error('updateMarketingSection error:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/')
    revalidatePath('/admin/marketing')
    return { success: true }
  } catch (err) {
    console.error('updateMarketingSection exception:', err)
    return { success: false, error: 'Terjadi kesalahan server.' }
  }
}

// ================================================================
// CHECKOUT ORDERS: Backend
// ================================================================

export async function createCheckoutOrder(order: {
  programId: string
  programName: string
  tierType: string
  tierLabel: string
  amount: number
  paymentMethod: string
  paymentAccountId?: string
}) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Anda harus login untuk melanjutkan.' }
    }

    const { data, error } = await supabase
      .from('checkout_orders')
      .insert({
        user_id: user.id,
        program_id: order.programId,
        program_name: order.programName,
        tier_type: order.tierType,
        tier_label: order.tierLabel,
        amount: order.amount,
        payment_method: order.paymentMethod,
        payment_account_id: order.paymentAccountId,
        status: 'pending',
      })
      .select('id')
      .single()

    if (error) {
      console.error('createCheckoutOrder error:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/marketing/orders')
    return { success: true, orderId: data.id }
  } catch (err) {
    console.error('createCheckoutOrder exception:', err)
    return { success: false, error: 'Terjadi kesalahan server.' }
  }
}

export async function getAllOrders(filter?: {
  status?: string
  programId?: string
}): Promise<CheckoutOrder[]> {
  try {
    const supabase = await createClient()
    let query = supabase
      .from('checkout_orders')
      .select('*, users(full_name, email)')
      .order('created_at', { ascending: false })

    if (filter?.status) {
      query = query.eq('status', filter.status)
    }
    if (filter?.programId) {
      query = query.eq('program_id', filter.programId)
    }

    const { data, error } = await query
    if (error) throw error
    return (data || []) as CheckoutOrder[]
  } catch (err) {
    console.error('getAllOrders error:', err)
    return []
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: string,
  adminNotes?: string
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const updateData: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    }

    if (adminNotes !== undefined) {
      updateData.admin_notes = adminNotes
    }

    if (status === 'confirmed' || status === 'paid') {
      updateData.confirmed_by = user?.id ?? null
      updateData.confirmed_at = new Date().toISOString()
    }

    const { error } = await supabase
      .from('checkout_orders')
      .update(updateData)
      .eq('id', orderId)

    if (error) {
      console.error('updateOrderStatus error:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/marketing/orders')
    return { success: true }
  } catch (err) {
    console.error('updateOrderStatus exception:', err)
    return { success: false, error: 'Terjadi kesalahan server.' }
  }
}

export async function getOrderStats() {
  try {
    const supabase = await createClient()

    const statuses = ['pending', 'confirmed', 'paid', 'cancelled']
    const results = await Promise.all(
      statuses.map((s) =>
        supabase
          .from('checkout_orders')
          .select('*', { count: 'exact', head: true })
          .eq('status', s)
      )
    )

    const [pending, confirmed, paid, cancelled] = results.map((r) => r.count ?? 0)

    const { data: revenueData } = await supabase
      .from('checkout_orders')
      .select('amount')
      .eq('status', 'paid')

    const totalRevenue = (revenueData || []).reduce(
      (sum, row) => sum + Number(row.amount),
      0
    )

    return { pending, confirmed, paid, cancelled, totalRevenue }
  } catch (err) {
    console.error('getOrderStats error:', err)
    return { pending: 0, confirmed: 0, paid: 0, cancelled: 0, totalRevenue: 0 }
  }
}

// ================================================================
// VIDEO ACCESS: Grant / Revoke / Read
// ================================================================

export type VideoAccess = {
  id: string
  user_id: string
  program_id: string
  tier: 'junior' | 'expert'
  order_id: string | null
  granted_by: string | null
  granted_at: string
  is_active: boolean
  notes: string | null
  users?: { full_name: string; email: string } | null
}

export async function grantVideoAccess(params: {
  userId: string
  programId: string
  tier: 'junior' | 'expert'
  orderId?: string
  notes?: string
}) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('video_access')
      .upsert({
        user_id: params.userId,
        program_id: params.programId,
        tier: params.tier,
        order_id: params.orderId ?? null,
        granted_by: user?.id ?? null,
        granted_at: new Date().toISOString(),
        is_active: true,
        notes: params.notes ?? null,
      }, { onConflict: 'user_id,program_id' })

    if (error) {
      console.error('grantVideoAccess error:', error)
      return { success: false, error: error.message }
    }

    // Tandai order sebagai access_granted
    if (params.orderId) {
      await supabase
        .from('checkout_orders')
        .update({
          access_granted: true,
          access_granted_at: new Date().toISOString(),
          status: 'paid',
        })
        .eq('id', params.orderId)
    }

    revalidatePath('/admin/marketing/orders')
    revalidatePath('/siswa')
    return { success: true }
  } catch (err) {
    console.error('grantVideoAccess exception:', err)
    return { success: false, error: 'Terjadi kesalahan server.' }
  }
}

export async function revokeVideoAccess(videoAccessId: string) {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('video_access')
      .update({ is_active: false })
      .eq('id', videoAccessId)

    if (error) return { success: false, error: error.message }

    revalidatePath('/admin/marketing/orders')
    return { success: true }
  } catch (err) {
    console.error('revokeVideoAccess exception:', err)
    return { success: false, error: 'Terjadi kesalahan server.' }
  }
}

export async function getUserVideoAccess(userId: string): Promise<VideoAccess[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('video_access')
      .select('*, users(full_name, email)')
      .eq('user_id', userId)
      .eq('is_active', true)

    if (error) throw error
    return (data || []) as VideoAccess[]
  } catch (err) {
    console.error('getUserVideoAccess error:', err)
    return []
  }
}

export async function getMyVideoAccess(): Promise<VideoAccess[]> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('video_access')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)

    if (error) throw error
    return (data || []) as VideoAccess[]
  } catch (err) {
    console.error('getMyVideoAccess error:', err)
    return []
  }
}

// ================================================================
// PAYMENT ACCOUNTS: Admin Management
// ================================================================

export type PaymentAccount = {
  id: string
  method_type: 'bank_transfer' | 'ewallet'
  provider_name: string
  account_number: string
  account_holder: string
  instructions: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export async function getAllPaymentAccounts(): Promise<PaymentAccount[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('payment_accounts')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (error) throw error
    return (data || []) as PaymentAccount[]
  } catch (err) {
    console.error('getAllPaymentAccounts error:', err)
    return []
  }
}

export async function getActivePaymentAccounts(methodType?: 'bank_transfer' | 'ewallet'): Promise<PaymentAccount[]> {
  try {
    const supabase = await createClient()
    let query = supabase
      .from('payment_accounts')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (methodType) {
      query = query.eq('method_type', methodType)
    }

    const { data, error } = await query
    if (error) throw error
    return (data || []) as PaymentAccount[]
  } catch (err) {
    console.error('getActivePaymentAccounts error:', err)
    return []
  }
}

export async function createPaymentAccount(account: {
  methodType: 'bank_transfer' | 'ewallet'
  providerName: string
  accountNumber: string
  accountHolder: string
  instructions?: string
  sortOrder?: number
}) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('payment_accounts')
      .insert({
        method_type: account.methodType,
        provider_name: account.providerName,
        account_number: account.accountNumber,
        account_holder: account.accountHolder,
        instructions: account.instructions ?? null,
        sort_order: account.sortOrder ?? 0,
        is_active: true,
        created_by: user?.id ?? null,
      })

    if (error) {
      console.error('createPaymentAccount error:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/marketing/payment-accounts')
    revalidatePath('/checkout')
    return { success: true }
  } catch (err) {
    console.error('createPaymentAccount exception:', err)
    return { success: false, error: 'Terjadi kesalahan server.' }
  }
}

export async function updatePaymentAccount(
  accountId: string,
  updates: {
    providerName?: string
    accountNumber?: string
    accountHolder?: string
    instructions?: string
    isActive?: boolean
    sortOrder?: number
  }
) {
  try {
    const supabase = await createClient()
    const updateData: Record<string, unknown> = {}

    if (updates.providerName !== undefined) updateData.provider_name = updates.providerName
    if (updates.accountNumber !== undefined) updateData.account_number = updates.accountNumber
    if (updates.accountHolder !== undefined) updateData.account_holder = updates.accountHolder
    if (updates.instructions !== undefined) updateData.instructions = updates.instructions
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive
    if (updates.sortOrder !== undefined) updateData.sort_order = updates.sortOrder

    const { error } = await supabase
      .from('payment_accounts')
      .update(updateData)
      .eq('id', accountId)

    if (error) {
      console.error('updatePaymentAccount error:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/marketing/payment-accounts')
    revalidatePath('/checkout')
    return { success: true }
  } catch (err) {
    console.error('updatePaymentAccount exception:', err)
    return { success: false, error: 'Terjadi kesalahan server.' }
  }
}

export async function deletePaymentAccount(accountId: string) {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('payment_accounts')
      .delete()
      .eq('id', accountId)

    if (error) {
      console.error('deletePaymentAccount error:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/marketing/payment-accounts')
    return { success: true }
  } catch (err) {
    console.error('deletePaymentAccount exception:', err)
    return { success: false, error: 'Terjadi kesalahan server.' }
  }
}

// ================================================================
// PAYMENT PROOF: Upload & View
// ================================================================

export async function uploadPaymentProof(orderId: string, file: File) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Anda harus login.' }

    const fileExt = file.name.split('.').pop()?.toLowerCase()
    if (!fileExt || !['jpg', 'jpeg', 'png'].includes(fileExt)) {
      return { success: false, error: 'Hanya file JPG dan PNG yang diperbolehkan.' }
    }

    const fileName = `${user.id}/${orderId}_${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('payment-proofs')
      .upload(fileName, file, { upsert: false })

    if (uploadError) {
      console.error('uploadPaymentProof storage error:', uploadError)
      return { success: false, error: uploadError.message }
    }

    const { error: updateError } = await supabase
      .from('checkout_orders')
      .update({
        payment_proof_path: fileName,
        payment_proof_uploaded_at: new Date().toISOString(),
        status: 'confirmed',
      })
      .eq('id', orderId)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('uploadPaymentProof db error:', updateError)
      return { success: false, error: updateError.message }
    }

    revalidatePath('/admin/marketing/orders')
    revalidatePath('/siswa')
    return { success: true }
  } catch (err) {
    console.error('uploadPaymentProof exception:', err)
    return { success: false, error: 'Terjadi kesalahan server.' }
  }
}

export async function getPaymentProofUrl(path: string): Promise<string | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.storage
      .from('payment-proofs')
      .createSignedUrl(path, 3600)

    if (error || !data) {
      console.error('getPaymentProofUrl error:', error)
      return null
    }
    return data.signedUrl
  } catch (err) {
    console.error('getPaymentProofUrl exception:', err)
    return null
  }
}

