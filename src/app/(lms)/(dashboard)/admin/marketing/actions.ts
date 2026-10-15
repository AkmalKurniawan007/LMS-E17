'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { Tier, TIER_RANK, getVideoTier, requiresEnrollment } from '@/lib/access-tier'
import { sendInAppNotification, notifyAdmins } from '@/app/actions/notification-actions'

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
  video_access?: { expires_at: string | null; is_active: boolean }[] | null
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

export async function getUserPendingOrder(programId?: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    let query = supabase
      .from('checkout_orders')
      .select('id, program_id, program_name, tier_type, tier_label, amount, payment_method, payment_proof_url, created_at')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (programId) {
      query = query.eq('program_id', programId)
    }

    const { data } = await query
    return data && data.length > 0 ? data[0] : null
  } catch (err) {
    console.error('getUserPendingOrder error:', err)
    return null
  }
}

export async function cancelCheckoutOrder(orderId: string, reason?: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Anda harus login.' }
    }

    const adminClient = createAdminClient()
    const { data: order, error: fetchErr } = await adminClient
      .from('checkout_orders')
      .select('id, user_id, status')
      .eq('id', orderId)
      .single()

    if (fetchErr || !order) {
      return { success: false, error: 'Pesanan tidak ditemukan.' }
    }

    if (order.user_id !== user.id) {
      const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
      if (userData?.role !== 'admin' && userData?.role !== 'super_admin') {
        return { success: false, error: 'Anda tidak memiliki hak untuk membatalkan pesanan ini.' }
      }
    }

    if (order.status !== 'pending') {
      return { success: false, error: 'Hanya pesanan berstatus Menunggu yang dapat dibatalkan.' }
    }

    const { error: updateErr } = await adminClient
      .from('checkout_orders')
      .update({
        status: 'cancelled',
        notes: reason ? `Dibatalkan: ${reason}` : 'Dibatalkan oleh pemesan',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)

    if (updateErr) {
      console.error('cancelCheckoutOrder error:', updateErr)
      return { success: false, error: updateErr.message }
    }

    revalidatePath('/admin/marketing/orders')
    revalidatePath('/pembeli/kelas-saya')
    revalidatePath(`/pembeli/payment/${orderId}`)
    return { success: true }
  } catch (err) {
    console.error('cancelCheckoutOrder exception:', err)
    return { success: false, error: 'Terjadi kesalahan server.' }
  }
}

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

    // 1. Fetch tier data
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

    const programName = Array.isArray(tierData.marketing_programs) 
      ? (tierData.marketing_programs[0] as any)?.name 
      : (tierData.marketing_programs as any)?.name || 'Unknown Program'

    // 2. Cek apakah ini transaksi UPGRADE (user sudah punya paket aktif sebelumnya di program ini)
    const adminClient = createAdminClient()
    const TIER_RANK: Record<string, number> = { junior: 1, self_paced: 1, expert: 2, mentoring: 2, complete: 3, bootcamp: 3 }
    const { data: paidOrders } = await adminClient
      .from('checkout_orders')
      .select('id, tier_type, amount, status')
      .eq('user_id', user.id)
      .eq('program_id', tierData.program_id)
      .in('status', ['confirmed', 'paid'])
      .order('created_at', { ascending: false })

    const highestPaid = paidOrders?.sort(
      (a, b) => (TIER_RANK[b.tier_type] || 0) - (TIER_RANK[a.tier_type] || 0)
    )?.[0]

    let finalAmount = tierData.price
    let orderNotes = order.notes || ''

    if (highestPaid && (TIER_RANK[order.tierType] || 0) > (TIER_RANK[highestPaid.tier_type] || 0)) {
      const discount = highestPaid.amount || 0
      finalAmount = Math.max(0, tierData.price - discount)
      const upgradeTag = `[Upgrade dari ${highestPaid.tier_type} (Potongan Rp ${new Intl.NumberFormat('id-ID').format(discount)})]`
      orderNotes = orderNotes ? `${orderNotes} ${upgradeTag}` : upgradeTag
    }

    // 3. Cegah duplikasi: Cek apakah user sudah punya order berstatus 'pending'
    const { data: pendingOrders } = await adminClient
      .from('checkout_orders')
      .select('id, program_id, program_name, tier_type, payment_proof_url')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (pendingOrders && pendingOrders.length > 0) {
      // Cek apakah ada pending order untuk program yang sama
      const sameProgramOrder = pendingOrders.find(o => o.program_id === tierData.program_id)

      if (sameProgramOrder) {
        // Jika sudah upload bukti pembayaran, jangan buat baru
        if (sameProgramOrder.payment_proof_url) {
          return {
            success: false,
            error: 'Anda sudah mengunggah bukti pembayaran untuk pesanan ini dan sedang menunggu verifikasi admin.',
            orderId: sameProgramOrder.id,
            hasProof: true
          }
        }

        // Jika BELUM upload bukti transfer: Perbarui pesanan yang sudah ada (tidak bikin duplikat)
        const { error: updateErr } = await adminClient
          .from('checkout_orders')
          .update({
            tier_type: order.tierType,
            tier_label: tierData.label,
            amount: finalAmount,
            payment_method: order.paymentMethod,
            notes: orderNotes || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', sameProgramOrder.id)

        if (updateErr) {
          console.error('update existing pending order error:', updateErr)
          return { success: false, error: updateErr.message }
        }

        revalidatePath('/admin/marketing/orders')
        revalidatePath('/pembeli/kelas-saya')
        return { success: true, orderId: sameProgramOrder.id, isReused: true }
      }

      // Jika ada pending order untuk program lain yang belum selesai:
      const unpaidOther = pendingOrders[0]
      if (!unpaidOther.payment_proof_url) {
        return {
          success: false,
          error: `Anda masih memiliki pesanan yang belum diselesaikan (${unpaidOther.program_name}). Harap selesaikan atau batalkan pesanan tersebut terlebih dahulu agar pembayaran tidak menumpuk.`,
          orderId: unpaidOther.id,
          hasProof: false
        }
      }
    }

    // 4. Masukkan order baru jika belum ada pending order
    const { data, error } = await supabase
      .from('checkout_orders')
      .insert({
        user_id: user.id,
        program_id: tierData.program_id,
        program_name: programName,
        tier_type: order.tierType,
        tier_label: tierData.label,
        amount: finalAmount,
        payment_method: order.paymentMethod,
        notes: orderNotes || null,
        status: 'pending'
      })
      .select('id')
      .single()

    if (error || !data) {
      console.error('createCheckoutOrder error:', error)
      return { success: false, error: error?.message || 'Gagal membuat order' }
    }

    // Kirim notifikasi konfirmasi pembuatan pesanan ke pembeli
    try {
      await sendInAppNotification({
        userId: user.id,
        title: `Pesanan Baru: ${programName}`,
        message: `Pesanan paket ${tierData.label} berhasil dibuat. Total tagihan: Rp ${new Intl.NumberFormat('id-ID').format(finalAmount)}. Silakan selesaikan pembayaran.`,
        actionUrl: `/pembeli/payment/${data.id}`,
      })
    } catch (notifErr) {
      console.warn('Failed to send order creation notification:', notifErr)
    }

    revalidatePath('/admin/marketing/orders')
    revalidatePath('/pembeli/kelas-saya')
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
      .select('*, users!checkout_orders_user_id_fkey(full_name, email), video_access(expires_at, is_active)')
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
  rejectedReason?: string,
  expiresAt?: string | null
) {
  try {
    const serverSupabase = await createClient()
    const { data: { user } } = await serverSupabase.auth.getUser()
    const supabase = createAdminClient() // Use admin client to bypass RLS for direct updates

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

    if (status === 'rejected' || status === 'cancelled') {
      updateData.access_granted = false
      await supabase
        .from('video_access')
        .update({ is_active: false })
        .eq('order_id', orderId)

      // Cabut pendaftaran kelas LMS (enrollments) jika pesanan dibatalkan atau ditolak
      const statusReason = status === 'rejected'
        ? (rejectedReason ? `Pesanan ditolak: ${rejectedReason}` : 'Pesanan ditolak oleh admin')
        : 'Pesanan dibatalkan'

      // 1. Coba update status enrollments menjadi 'nonaktif' berdasarkan checkout_order_id
      const { error: enrollUpdateErr, data: updatedEnrolls } = await supabase
        .from('enrollments')
        .update({
          status: 'nonaktif' as any,
          status_reason: statusReason,
        })
        .eq('checkout_order_id', orderId)
        .select('id')

      if (enrollUpdateErr) {
        // Fallback jika enum enrollment_status di DB belum di-migrate memiliki value 'nonaktif'
        console.warn('Gagal update status enrollments ke nonaktif, mencoba fallback ke mengundurkan diri:', enrollUpdateErr.message)
        await supabase
          .from('enrollments')
          .update({
            status: 'mengundurkan diri' as any,
            status_reason: statusReason,
          })
          .eq('checkout_order_id', orderId)
      }

      // 2. Fallback untuk data legacy: jika tidak ada baris terupdate via checkout_order_id,
      // cari enrollment aktif user pada batch yang terkait dengan program order ini
      if (!updatedEnrolls || updatedEnrolls.length === 0) {
        const { data: ord } = await supabase
          .from('checkout_orders')
          .select('user_id, program_id')
          .eq('id', orderId)
          .single()

        if (ord?.user_id && ord?.program_id) {
          const { data: mp } = await supabase
            .from('marketing_programs')
            .select('lms_program_id')
            .eq('id', ord.program_id)
            .single()

          if (mp?.lms_program_id) {
            const { data: progBatches } = await supabase
              .from('batches')
              .select('id')
              .eq('program_id', mp.lms_program_id)

            const batchIds = (progBatches || []).map(b => b.id)
            if (batchIds.length > 0) {
              const { error: fbErr } = await supabase
                .from('enrollments')
                .update({
                  status: 'nonaktif' as any,
                  status_reason: statusReason,
                })
                .eq('user_id', ord.user_id)
                .in('batch_id', batchIds)
                .eq('status', 'aktif')

              if (fbErr) {
                await supabase
                  .from('enrollments')
                  .update({
                    status: 'mengundurkan diri' as any,
                    status_reason: statusReason,
                  })
                  .eq('user_id', ord.user_id)
                  .in('batch_id', batchIds)
                  .eq('status', 'aktif')
              }
            }
          }
        }
      }
    }

    if (status === 'confirmed' || status === 'paid') {
      updateData.confirmed_by = user?.id ?? null
      updateData.confirmed_at = new Date().toISOString()
      updateData.access_granted = true
      updateData.access_granted_at = new Date().toISOString()

      // Otomatis berikan akses video ke user
      const { data: orderData } = await supabase
        .from('checkout_orders')
        .select('user_id, program_id, tier_type')
        .eq('id', orderId)
        .single()

      if (orderData?.user_id && orderData?.program_id) {
        // Validasi tier_type (gagalkan jika di luar 3 nilai valid)
        const validTiers: Tier[] = ['junior', 'expert', 'complete']
        if (!orderData.tier_type || !validTiers.includes(orderData.tier_type as Tier)) {
          return { success: false, error: 'Tipe tier tidak valid.' }
        }

        const tierForVideo = getVideoTier(orderData.tier_type)
        await supabase
          .from('video_access')
          .upsert({
            user_id: orderData.user_id,
            program_id: orderData.program_id,
            tier: tierForVideo,
            order_id: orderId,
            granted_by: user?.id ?? null,
            granted_at: new Date().toISOString(),
            expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
            is_active: true,
            notes: `Auto-granted when order status updated to ${status}`,
          }, { onConflict: 'user_id,program_id' })

        // Jika paket live mentoring (expert / complete), daftarkan ke batch LMS jika tersedia
        if (requiresEnrollment(orderData.tier_type)) {
          // Pastikan user mendapatkan role 'siswa' di public.users jika sebelumnya NULL
          await supabase
            .from('users')
            .update({ role: 'siswa' })
            .eq('id', orderData.user_id)
            .is('role', null)

          try {
            const { data: mp } = await supabase
              .from('marketing_programs')
              .select('lms_program_id')
              .eq('id', orderData.program_id)
              .single()

            if (mp?.lms_program_id) {
              const { data: activeBatch } = await supabase
                .from('batches')
                .select('id')
                .eq('program_id', mp.lms_program_id)
                .in('status', ['aktif', 'akan_datang'])
                .order('start_date', { ascending: true })
                .limit(1)
                .single()

              if (activeBatch?.id) {
                const { data: existingEn } = await supabase
                  .from('enrollments')
                  .select('id, tier')
                  .eq('user_id', orderData.user_id)
                  .eq('batch_id', activeBatch.id)
                  .maybeSingle()

                if (!existingEn) {
                  const { error: insertEnrollError } = await supabase.from('enrollments').insert({
                    user_id: orderData.user_id,
                    batch_id: activeBatch.id,
                    tier: orderData.tier_type,
                    status: 'aktif',
                    created_at: new Date().toISOString(),
                    enrollment_source: 'marketing',
                    checkout_order_id: orderId
                  })

                  if (insertEnrollError) {
                    console.error('Auto-enroll insert error:', insertEnrollError)
                    return { success: false, error: insertEnrollError.message }
                  }
                } else {
                  // Update tier hanya jika tier baru memiliki rank lebih tinggi
                  const oldTier = (existingEn.tier as Tier) || 'bootcamp'
                  const newTier = orderData.tier_type as Tier
                  const oldRank = TIER_RANK[oldTier] ?? 0
                  const newRank = TIER_RANK[newTier] ?? 0

                  if (newRank > oldRank) {
                    const { error: updateTierError } = await supabase
                      .from('enrollments')
                      .update({ tier: newTier })
                      .eq('id', existingEn.id)

                    if (updateTierError) {
                      console.error('Auto-enroll update tier error:', updateTierError)
                      return { success: false, error: updateTierError.message }
                    }

                    // Catat ke audit_logs (kolom: old_values, new_values)
                    const { error: auditError } = await supabase.from('audit_logs').insert({
                      user_id: user?.id ?? null,
                      action_type: 'tier_upgrade',
                      entity_type: 'enrollment',
                      entity_id: existingEn.id,
                      old_values: { tier: oldTier },
                      new_values: { tier: newTier, order_id: orderId }
                    })
                    if (auditError) {
                      console.error('Audit log insert error on tier upgrade:', auditError)
                    }
                  }
                }
              }
            }
          } catch (e) {
            const message = e instanceof Error ? e.message : 'Gagal memproses pendaftaran batch.'
            console.error('Auto-enroll batch exception:', e)
            return { success: false, error: message }
          }
        }
      }
    }

    const { error } = await supabase
      .from('checkout_orders')
      .update(updateData)
      .eq('id', orderId)

    if (error) {
      console.error('updateOrderStatus error:', error)
      return { success: false, error: error.message }
    }

    // Kirim notifikasi otomatis sesuai perubahan status (Ditolak / Dibatalkan)
    try {
      const { data: ord } = await supabase
        .from('checkout_orders')
        .select('user_id, program_name')
        .eq('id', orderId)
        .single()

      if (ord?.user_id) {
        if (status === 'rejected') {
          await sendInAppNotification({
            userId: ord.user_id,
            title: 'Pembayaran Memerlukan Tindakan ⚠️',
            message: `Bukti transfer Anda belum dapat diverifikasi. Alasan: ${rejectedReason || 'Bukti transfer tidak valid atau tidak terbaca'}. Silakan unggah kembali bukti pembayaran yang benar.`,
            actionUrl: `/pembeli/payment/${orderId}`,
          })
        } else if (status === 'cancelled') {
          await sendInAppNotification({
            userId: ord.user_id,
            title: 'Pesanan Dibatalkan',
            message: `Pesanan Anda untuk ${ord.program_name || 'program'} telah dibatalkan.`,
            actionUrl: '/',
          })
        }
      }
    } catch (notifErr) {
      console.warn('Failed to send status update notification:', notifErr)
    }

    revalidatePath('/admin/marketing/orders')
    revalidatePath('/siswa')
    revalidatePath('/siswa/video')
    revalidatePath('/pembeli/kelas-saya')
    return { success: true }
  } catch (err) {
    console.error('updateOrderStatus exception:', err)
    return { success: false, error: 'Terjadi kesalahan server.' }
  }
}

export async function confirmCheckoutOrder(
  orderId: string,
  batchId?: string | null,
  adminNotes?: string,
  expiresAt?: string | null,
  targetStatus: 'confirmed' | 'paid' = 'confirmed'
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Anda harus login.' }

    // Validasi tier_type sebelum memanggil RPC
    const { data: orderData, error: fetchOrderError } = await supabase
      .from('checkout_orders')
      .select('tier_type')
      .eq('id', orderId)
      .maybeSingle()

    if (fetchOrderError || !orderData) {
      return { success: false, error: 'Pesanan tidak ditemukan.' }
    }

    const validTiers: Tier[] = ['junior', 'expert', 'complete']
    if (!orderData.tier_type || !validTiers.includes(orderData.tier_type as Tier)) {
      return { success: false, error: 'Tipe tier tidak valid.' }
    }

    const { error } = await supabase.rpc('confirm_checkout_order', {
      p_order_id: orderId,
      p_batch_id: batchId || null,
      p_admin_notes: adminNotes || null,
      p_expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
    })

    if (error) {
      console.error('confirmCheckoutOrder error:', error)
      return { success: false, error: error.message }
    }

    // Jika admin secara eksplisit memilih status 'paid', sinkronkan status menjadi 'paid'.
    // Jika memilih 'confirmed', status tetap 'confirmed' sesuai hasil RPC confirm_checkout_order.
    if (targetStatus === 'paid') {
      const adminClient = await createAdminClient()
      await adminClient
        .from('checkout_orders')
        .update({
          status: 'paid',
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)
    }

    // Double-safety: pastikan hak akses video & role tersinkronkan
    const { data: fullOrderData } = await supabase
      .from('checkout_orders')
      .select('user_id, program_id, tier_type, program_name, tier_label')
      .eq('id', orderId)
      .single()

    if (fullOrderData) {
      if (requiresEnrollment(fullOrderData.tier_type) && fullOrderData.user_id) {
        await supabase
          .from('users')
          .update({ role: 'siswa' })
          .eq('id', fullOrderData.user_id)
          .is('role', null)
      }

      const videoTier = getVideoTier(fullOrderData.tier_type)
      await grantVideoAccess({
        userId: fullOrderData.user_id,
        programId: fullOrderData.program_id,
        tier: videoTier as 'junior' | 'expert',
        orderId: orderId,
        notes: 'Auto-granted from checkout confirmation',
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
        updateOrderStatusToPaid: false, // JANGAN timpa status menjadi 'paid'
      })

      // Kirim notifikasi konfirmasi sukses ke siswa
      if (fullOrderData.user_id) {
        try {
          const isBootcamp = requiresEnrollment(fullOrderData.tier_type)
          await sendInAppNotification({
            userId: fullOrderData.user_id,
            title: 'Pembayaran Dikonfirmasi! 🎉',
            message: `Selamat! Pembayaran untuk ${fullOrderData.program_name || 'kelas'} (${fullOrderData.tier_label || 'Akses'}) telah disetujui. Akses materi dan video pembelajaran Anda telah aktif.`,
            actionUrl: isBootcamp ? '/siswa' : '/siswa/video',
          })
        } catch (notifErr) {
          console.warn('Failed to send confirm notification:', notifErr)
        }
      }
    }

    revalidatePath('/admin/marketing/orders')
    revalidatePath('/siswa')
    revalidatePath('/siswa/video')
    revalidatePath('/pembeli/kelas-saya')
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
      .in('status', ['confirmed', 'paid'])

    const totalRevenue = (revenueData || []).reduce(
      (sum, row) => sum + Number(row.amount),
      0
    )

    // Try fetching page views safely
    let pageViews = 0;
    let guestViews = 0;
    let loggedInViews = 0;
    try {
      // Get guest views (user_id is null) - unique by session_id
      const { data: guestData } = await supabase
        .from('marketing_page_views')
        .select('session_id')
        .is('user_id', null)
        .limit(50000); // allow up to 50k rows for distinct calculation
      
      // Get logged in views (user_id is not null) - unique by user_id
      const { data: loggedInData } = await supabase
        .from('marketing_page_views')
        .select('user_id')
        .not('user_id', 'is', null)
        .limit(50000);

      // Hitung pengunjung unik (Unique Visitors)
      const uniqueGuestSessions = new Set((guestData || []).map(row => row.session_id));
      const uniqueLoggedInUsers = new Set((loggedInData || []).map(row => row.user_id));

      guestViews = uniqueGuestSessions.size;
      loggedInViews = uniqueLoggedInUsers.size;
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
  tier: 'junior' | 'expert' | 'complete' | 'bootcamp'
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
  tier: 'junior' | 'expert' | 'complete' | 'bootcamp' | string
  orderId?: string
  notes?: string
  expiresAt?: string
  updateOrderStatusToPaid?: boolean
}) {
  try {
    const authClient = await createClient()
    const { data: { user } } = await authClient.auth.getUser()

    const supabase = await createAdminClient()

    const tierForVideo = getVideoTier(params.tier)

    const { error } = await supabase
      .from('video_access')
      .upsert({
        user_id: params.userId,
        program_id: params.programId,
        tier: tierForVideo,
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

    // Hanya tandai status order menjadi 'paid' jika secara eksplisit diminta (misal dari manual override)
    if (params.orderId && params.updateOrderStatusToPaid) {
      await supabase
        .from('checkout_orders')
        .update({
          status: 'paid',
          updated_at: new Date().toISOString(),
        })
        .eq('id', params.orderId)
    }

    revalidatePath('/admin/marketing/orders')
    revalidatePath('/siswa')
    revalidatePath('/siswa/video')
    revalidatePath('/pembeli/kelas-saya')
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
      .upload(fileName, file, { upsert: true })

    if (uploadError) {
      console.error('uploadPaymentProof storage error:', uploadError)
      return { success: false, error: uploadError.message }
    }

    // Gunakan admin client untuk bypass RLS pada tabel checkout_orders
    const adminSupabase = await createAdminClient()
    const { data: updatedOrder, error: updateError } = await adminSupabase
      .from('checkout_orders')
      .update({ 
        payment_proof_url: fileName,
        status: 'pending', // Revert ke pending jika sebelumnya ditolak agar muncul kembali di antrean verifikasi admin
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .eq('user_id', user.id)
      .select('id, program_name, amount')
      .single()

    if (updateError) {
      console.error('uploadPaymentProof update error:', updateError)
      return { success: false, error: updateError.message }
    }

    // Trigger notifikasi otomatis
    try {
      const orderShortId = orderId.slice(0, 8)
      const progName = updatedOrder?.program_name || 'Program'

      // 1. Notifikasi ke pembeli
      await sendInAppNotification({
        userId: user.id,
        title: 'Bukti Pembayaran Diterima',
        message: `Bukti transfer Anda untuk "${progName}" (#${orderShortId}) berhasil diunggah. Tim admin kami sedang memverifikasi pembayaran Anda.`,
        actionUrl: `/pembeli/payment/${orderId}`
      })

      // 2. Notifikasi ke seluruh admin
      await notifyAdmins({
        title: 'Bukti Pembayaran Baru Diunggah',
        message: `Pembeli telah mengunggah bukti transfer untuk pesanan "${progName}" (#${orderShortId}). Segera periksa dan verifikasi pembayaran.`,
        actionUrl: `/admin/marketing/orders`
      })
    } catch (notifErr) {
      console.error('Error triggering notification on uploadPaymentProof:', notifErr)
    }

    revalidatePath('/admin/marketing/orders')
    revalidatePath('/pembeli/payment/' + orderId)
    revalidatePath('/pembeli/kelas-saya')
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

