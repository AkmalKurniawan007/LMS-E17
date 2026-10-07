"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function createProgram(formData: { name: string, description: string, isActive: boolean }) {
  if (!formData.name.trim()) {
    return { error: "Nama program tidak boleh kosong." }
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('programs')
    .insert({
      name: formData.name,
      description: formData.description,
      is_active: formData.isActive
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // Log action
  try {
    const { logAction } = await import('@/utils/logger-actions')
    await logAction('admin', 'Pembuatan Program Baru', `Mendaftarkan kurikulum/program baru bernama: ${formData.name}`)
  } catch (logError) {
    console.error("Failed to log action:", logError)
  }

  // Revalidate the programs page to show the new data
  revalidatePath('/admin/programs')
  revalidatePath(`/admin/programs/${data.id}`)

  return { success: true, program: data }
}

export async function updateProgram(id: string, formData: { name: string, description: string, isActive: boolean }) {
  if (!formData.name.trim()) {
    return { error: "Nama program tidak boleh kosong." }
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('programs')
    .update({
      name: formData.name,
      description: formData.description,
      is_active: formData.isActive
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/programs')
  revalidatePath(`/admin/programs/${id}`)

  return { success: true, program: data }
}

export async function deleteProgram(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('programs')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/programs')

  return { success: true }
}
