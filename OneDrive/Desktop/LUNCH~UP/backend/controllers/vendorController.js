const supabase = require('../utils/supabase');
const { getIo, connectedUsers } = require('../utils/socket');

// POST /api/vendor/menu
async function addMenuItem(req, res, next) {
  try {
    const vendorId = req.user.id;
    const { name, price, image_url, available } = req.body;
    const { data, error } = await supabase
      .from('menu_items')
      .insert([{ vendor_id: vendorId, name, price, image_url, available }])
      .single();
    if (error) throw error;
    res.status(201).json({ menuItem: data });
  } catch (err) {
    next(err);
  }
}

// PUT /api/vendor/menu/:id
async function updateMenuItem(req, res, next) {
  try {
    const vendorId = req.user.id;
    const { id } = req.params;
    const updates = req.body;
    const { data: existing, error: fetchError } = await supabase
      .from('menu_items')
      .select('*')
      .eq('id', id)
      .single();
    if (fetchError) throw fetchError;
    if (!existing || existing.vendor_id !== vendorId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const { data, error } = await supabase
      .from('menu_items')
      .update(updates)
      .eq('id', id)
      .single();
    if (error) throw error;
    res.json({ menuItem: data });
  } catch (err) {
    next(err);
  }
}

// GET /api/vendor/orders
async function getVendorOrders(req, res, next) {
  try {
    const vendorId = req.user.id;
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('vendor_id', vendorId);
    if (error) throw error;
    res.json({ orders: data });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/vendor/orders/:id/status
async function updateOrderStatus(req, res, next) {
  try {
    const vendorId = req.user.id;
    const { id } = req.params;
    const { status } = req.body;

    // allowed states and precise forward transition mapping
    const transitions = {
      PENDING: 'ACCEPTED',
      ACCEPTED: 'READY',
      READY: 'DELIVERED',
    };

    // fetch and authorization
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();
    if (fetchError) throw fetchError;
    if (!order || order.vendor_id !== vendorId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // ensure target status is the immediate next step
    const expected = transitions[order.status];
    if (!expected) {
      return res.status(400).json({ error: 'Current order state cannot be changed' });
    }
    if (status !== expected) {
      return res.status(400).json({ error: 'Invalid status transition' });
    }

    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .single();
    if (error) throw error;

    // notify client if connected
    try {
      const io = getIo();
      const clientSocket = connectedUsers[data.client_id];
      if (clientSocket) {
        io.to(clientSocket).emit('order_updated', { order: data });
      }
    } catch (e) {
      // ignore
    }
    res.json({ order: data });
  } catch (err) {
    next(err);
  }
}

module.exports = { addMenuItem, updateMenuItem, getVendorOrders, updateOrderStatus };
