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
  payment_proof_url: string | null
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
  tierType: string
  paymentMethod: string
  notes?: string
}) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Anda harus login untuk melanjutkan.' }
    }

    // Map tierType (junior, expert, complete) to the one in DB if needed.
    // Or just fetch directly.
    const { data: tierData, error: tierError } = await supabase
      .from('marketing_program_tiers')
      .select('id, label, price, program_id, marketing_programs(name)')
      .eq('program_id', order.programId)
      .eq('tier_type', order.tierType)
      .single()

    if (tierError || !tierData) {
      console.error('createCheckoutOrder tier fetch error:', tierError)
      return { success: false, error: 'Tier program tidak ditemukan.' }
    }

    const { data, error } = await supabase
      .from('checkout_orders')
      .insert({
        user_id: user.id,
        program_id: tierData.program_id,
        program_name: Array.isArray(tierData.marketing_programs) 
          ? (tierData.marketing_programs[0] as any)?.name 
          : (tierData.marketing_programs as any)?.name || 'Unknown Program',
        tier_type: order.tierType,
        tier_label: tierData.label,
        amount: tierData.price,
        payment_method: order.paymentMethod,
        notes: order.notes || null,
        status: 'pending'
      })
      .select('id')
      .single()

    if (error || !data) {
      console.error('createCheckoutOrder error:', error)
      return { success: false, error: error?.message || 'Gagal membuat order' }
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
      .select('*, users!checkout_orders_user_id_fkey(full_name, email)')
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

export async function getOrderForPayment(orderId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'Anda harus login.' };
    }

    const { data, error } = await supabase
      .from('checkout_orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single();

    if (error || !data) {
      return { success: false, error: 'Pesanan tidak ditemukan.' };
    }

    return { success: true, order: data };
  } catch (err) {
    console.error('getOrderForPayment exception:', err);
    return { success: false, error: 'Terjadi kesalahan server.' };
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: string,
  adminNotes?: string,
  rejectedReason?: string
) {
  try {
    const supabase = await createAdminClient() // Use admin client to bypass RLS for direct updates on locked table
    const { data: { user } } = await supabase.auth.getUser()

    const updateData: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    }

    if (adminNotes !== undefined) {
      updateData.admin_notes = adminNotes
    }

    if (status === 'rejected' && rejectedReason !== undefined) {
      updateData.rejected_reason = rejectedReason
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

export async function confirmCheckoutOrder(
  orderId: string,
  batchId: string,
  adminNotes?: string
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Anda harus login.' }

    const { error } = await supabase.rpc('confirm_checkout_order', {
      p_order_id: orderId,
      p_batch_id: batchId,
      p_admin_notes: adminNotes || null
    })

    if (error) {
      console.error('confirmCheckoutOrder error:', error)
      return { success: false, error: error.message }
    }

    // Otomatis berikan akses video Expert ke user (karena Bootcamp include semua video)
    const { data: orderData } = await supabase
      .from('checkout_orders')
      .select('user_id, program_id')
      .eq('id', orderId)
      .single()

    if (orderData) {
      await grantVideoAccess({
        userId: orderData.user_id,
        programId: orderData.program_id,
        tier: 'expert',
        orderId: orderId,
        notes: 'Auto-granted from bootcamp confirmation',
      })
    }

    revalidatePath('/admin/marketing/orders')
    return { success: true }
  } catch (err) {
    console.error('confirmCheckoutOrder exception:', err)
    return { success: false, error: 'Terjadi kesalahan server.' }
  }
}

export async function getProgramBatches(marketingProgramId: string) {
  try {
    const supabase = await createClient()

    const { data: program, error: programError } = await supabase
      .from('marketing_programs')
      .select('lms_program_id')
      .eq('id', marketingProgramId)
      .single()

    if (programError || !program) {
      return { success: false, error: 'Program marketing tidak ditemukan' }
    }

    if (!program.lms_program_id) {
      return { success: true, lmsProgramId: null, batches: [] }
    }

    const { data: batches, error: batchError } = await supabase
      .from('batches')
      .select('id, name')
      .eq('program_id', program.lms_program_id)
      .order('start_date', { ascending: false })

    if (batchError) {
      return { success: false, error: 'Gagal mengambil batch' }
    }

    return { success: true, lmsProgramId: program.lms_program_id, batches: batches || [] }
  } catch (err) {
    console.error('getProgramBatches exception:', err)
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

    // Try fetching page views safely
    let pageViews = 0;
    let guestViews = 0;
    let loggedInViews = 0;
    try {
      // Get guest views (user_id is null)
      const { count: guestCount } = await supabase
        .from('marketing_page_views')
        .select('*', { count: 'exact', head: true })
        .is('user_id', null);
      
      // Get logged in views (user_id is not null)
      const { count: loggedInCount } = await supabase
        .from('marketing_page_views')
        .select('*', { count: 'exact', head: true })
        .not('user_id', 'is', null);

      guestViews = guestCount ?? 0;
      loggedInViews = loggedInCount ?? 0;
      pageViews = guestViews + loggedInViews;
    } catch (e) {
      console.log('marketing_page_views table not yet available');
    }

    return { pending, confirmed, paid, cancelled, totalRevenue, pageViews, guestViews, loggedInViews }
  } catch (err) {
    console.error('getOrderStats error:', err)
    return { pending: 0, confirmed: 0, paid: 0, cancelled: 0, totalRevenue: 0, pageViews: 0, guestViews: 0, loggedInViews: 0 }
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
  expiresAt?: string
}) {
  try {
    const authClient = await createClient()
    const { data: { user } } = await authClient.auth.getUser()

    const supabase = await createAdminClient()

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
        expires_at: params.expiresAt ?? null,
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

export async function uploadPaymentProof(orderId: string, formData: FormData) {
  try {
    const file = formData.get('file') as File;
    if (!file) return { success: false, error: 'File tidak ditemukan.' }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Anda harus login.' }

    const fileExt = file.name.split('.').pop()?.toLowerCase()
    if (!fileExt || !['jpg', 'jpeg', 'png', 'pdf'].includes(fileExt)) {
      return { success: false, error: 'Hanya file JPG, PNG, dan PDF yang diperbolehkan.' }
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
        payment_proof_url: fileName,
        status: 'paid'
      })
      .eq('id', orderId)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('uploadPaymentProof rpc error:', updateError)
      return { success: false, error: updateError.message }
    }

    revalidatePath('/admin/marketing/orders')
    revalidatePath('/dashboard-pembeli')
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

