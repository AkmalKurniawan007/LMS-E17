"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export type MarketingLead = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  program_interest: string | null;
  source: string;
  status: string;
  notes: string | null;
  converted_user_id: string | null;
  converted_at: string | null;
  last_activity: string;
  created_at: string;
  updated_at: string;
};

// CRM View Type
export type MarketingLeadCrm = MarketingLead & {
  latest_order_id: string | null;
  latest_order_tier: string | null;
  latest_order_amount: number | null;
  latest_order_status: string | null;
  order_created_at: string | null;
  converted_user_name: string | null;
};

// ==========================================
// PUBLIC ACTIONS (Form Register Marketing)
// ==========================================

export async function submitMarketingLead(data: {
  fullName: string;
  email: string;
  phone: string;
  programInterest?: string;
  source?: string;
}) {
  const supabase = await createClient();

  // Cek apakah email sudah terdaftar di leads
  const { data: existingLead } = await supabase
    .from("marketing_leads")
    .select("id")
    .eq("email", data.email)
    .single();

  if (existingLead) {
    // Jika sudah ada, update last_activity dan data terbaru
    const { error } = await supabase
      .from("marketing_leads")
      .update({
        full_name: data.fullName,
        phone: data.phone,
        program_interest: data.programInterest || null,
        last_activity: new Date().toISOString(),
      })
      .eq("id", existingLead.id);

    if (error) throw new Error(error.message);
    return { success: true, leadId: existingLead.id, isNew: false };
  }

  // Insert lead baru
  const { data: newLead, error } = await supabase
    .from("marketing_leads")
    .insert({
      full_name: data.fullName,
      email: data.email,
      phone: data.phone,
      program_interest: data.programInterest || null,
      source: data.source || "web_register",
      status: "new",
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return { success: true, leadId: newLead.id, isNew: true };
}


// ==========================================
// ADMIN ACTIONS (CRM Dashboard)
// ==========================================

export async function getMarketingLeads(filters?: { status?: string; program?: string }) {
  const supabase = await createClient();

  let query = supabase
    .from("marketing_leads_crm")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }
  if (filters?.program) {
    query = query.eq("program_interest", filters.program);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return data as MarketingLeadCrm[];
}

export async function updateLeadStatus(leadId: string, status: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("marketing_leads")
    .update({ 
      status,
      last_activity: new Date().toISOString()
    })
    .eq("id", leadId);

  if (error) throw new Error(error.message);
  revalidatePath('/admin/marketing/leads');
  return { success: true };
}

export async function updateLeadNotes(leadId: string, notes: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("marketing_leads")
    .update({ 
      notes,
      last_activity: new Date().toISOString()
    })
    .eq("id", leadId);

  if (error) throw new Error(error.message);
  revalidatePath('/admin/marketing/leads');
  return { success: true };
}

export async function deleteLead(leadId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("marketing_leads")
    .delete()
    .eq("id", leadId);

  if (error) throw new Error(error.message);
  revalidatePath('/admin/marketing/leads');
  return { success: true };
}
