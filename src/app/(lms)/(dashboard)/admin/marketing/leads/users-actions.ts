"use server";

import { createAdminClient } from "@/utils/supabase/admin";

export type AuthUserList = {
  id: string;
  email: string;
  provider: string;
  created_at: string;
  last_sign_in_at: string | null;
  user_metadata: any;
  purchases: {
    programName: string;
    tier: string;
    amount: number;
  }[];
};

export async function getAuthUsersList(): Promise<AuthUserList[]> {
  try {
    const supabase = createAdminClient();
    
    // 1. Fetch all users from Auth
    const { data, error } = await supabase.auth.admin.listUsers({
      perPage: 1000,
    });

    if (error) {
      console.error("Error fetching auth users:", error);
      return [];
    }
    
    // 2. Fetch all paid checkout_orders
    const { data: orders, error: ordersError } = await supabase
      .from('checkout_orders')
      .select(`
        user_id,
        tier_type,
        amount,
        program_name,
        tier_label
      `)
      .eq('status', 'paid');
      
    if (ordersError) {
      console.error("Error fetching orders:", ordersError);
    }
    
    // Group orders by user_id
    const ordersByUser: Record<string, { programName: string, tier: string, amount: number }[]> = {};
    if (orders) {
      for (const order of orders) {
        if (!order.user_id) continue;
        if (!ordersByUser[order.user_id]) ordersByUser[order.user_id] = [];
        ordersByUser[order.user_id].push({
          programName: order.program_name || 'Unknown Program',
          tier: order.tier_label || order.tier_type,
          amount: order.amount,
        });
      }
    }

    // 3. Map and Filter Users
    // We only want users who registered on the web (they usually do NOT have an explicit role in user_metadata)
    // Admin, mentor, and imported students usually have user_metadata.role set.
    return data.users
      .filter(u => !u.user_metadata?.role) // Exclude imported/admin users
      .map((u) => {
        // Determine provider
        const providers = u.app_metadata?.providers || [];
        const primaryProvider = providers.length > 0 ? providers[0] : "email";

        return {
          id: u.id,
          email: u.email || "",
          provider: primaryProvider,
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at || null,
          user_metadata: u.user_metadata || {},
          purchases: ordersByUser[u.id] || [],
        };
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } catch (err) {
    console.error("Error in getAuthUsersList:", err);
    return [];
  }
}

