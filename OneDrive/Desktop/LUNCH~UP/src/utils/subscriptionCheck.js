// Helper to check vendor subscription status
// Requires: vendor object and supabase client

/**
 * Checks vendor subscription and updates status if expired.
 * @param {object} vendor - Vendor object from Supabase
 * @param {object} supabase - Supabase client instance
 * @returns {Promise<{access: string, expired: boolean}>}
 */
export async function checkVendorSubscription(vendor, supabase) {
  const now = new Date();

  // Free plan: limited access
  if (vendor.subscription_plan === 'free') {
    return { access: 'limited', expired: false };
  }

  // Parse subscription_end
  const end = vendor.subscription_end ? new Date(vendor.subscription_end) : null;
  if (!end || end < now) {
    // Mark as expired in DB
    await supabase
      .from('vendors')
      .update({ status: 'suspended' })
      .eq('id', vendor.id);
    return { access: 'expired', expired: true };
  }

  // Valid subscription
  return { access: 'full', expired: false };
}

// ---
// Usage example (in login or middleware):
// const { data: vendor } = await supabase.from('vendors').select('*').eq('id', user.id).single();
// const subStatus = await checkVendorSubscription(vendor, supabase);
// if (subStatus.access !== 'full') { /* restrict features */ }
