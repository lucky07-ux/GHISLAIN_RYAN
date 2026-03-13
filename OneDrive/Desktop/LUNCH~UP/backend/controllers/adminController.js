const supabase = require('../utils/supabase');

// GET /api/admin/stats
async function getDashboardStats(req, res, next) {
  try {
    const { data: deliveredOrders, error: dErr } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('status', 'DELIVERED');
    if (dErr) throw dErr;

    const totalRevenue = deliveredOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

    const { count: totalOrdersCount, error: tErr } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });
    if (tErr) throw tErr;

    const { count: pendingCount, error: pErr } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'PENDING');
    if (pErr) throw pErr;

    res.json({ totalRevenue, totalOrders: totalOrdersCount, pendingOrders: pendingCount });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/vendors
async function getAllVendors(req, res, next) {
  try {
    const { data, error } = await supabase.from('vendors').select('*');
    if (error) throw error;
    res.json({ vendors: data });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/admin/vendors/:id/status
async function updateVendorStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['ACTIVE', 'SUSPENDED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const { data, error } = await supabase
      .from('vendors')
      .update({ status })
      .eq('id', id)
      .single();
    if (error) throw error;
    res.json({ vendor: data });
  } catch (err) {
    next(err);
  }
}

module.exports = { getDashboardStats, getAllVendors, updateVendorStatus };