const supabase = require('../utils/supabase');
const { getIo, connectedUsers } = require('../utils/socket');

// GET /api/client/vendors
async function getVendors(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('status', 'ACTIVE');

    if (error) return next(error);
    res.json({ vendors: data });
  } catch (err) {
    next(err);
  }
}

// GET /api/client/vendors/:vendorId/menu
async function getVendorMenu(req, res, next) {
  try {
    const { vendorId } = req.params;
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('vendor_id', vendorId)
      .eq('available', true);

    if (error) return next(error);
    res.json({ menu: data });
  } catch (err) {
    next(err);
  }
}

// POST /api/client/orders
async function createOrder(req, res, next) {
  try {
    const clientId = req.user.id;
    const { vendorId, items } = req.body;

    if (!vendorId || !Array.isArray(items) || !items.length) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    // fetch prices for items
    const ids = items.map((i) => i.menu_item_id);
    const { data: menuRows, error: fetchError } = await supabase
      .from('menu_items')
      .select('id,price')
      .in('id', ids);
    if (fetchError) throw fetchError;

    let total = 0;
    const priceMap = {};
    menuRows.forEach((row) => { priceMap[row.id] = row.price; });

    for (const it of items) {
      const price = priceMap[it.menu_item_id];
      if (price === undefined) {
        return res.status(400).json({ error: 'Invalid menu item' });
      }
      total += price * it.quantity;
    }

    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([{ client_id: clientId, vendor_id: vendorId, total_amount: total, status: 'PENDING', payment_method: 'SIMULATED' }])
      .single();

    if (orderError) throw orderError;

    const orderId = orderData.id;
    const orderItems = items.map((it) => ({
      order_id: orderId,
      menu_item_id: it.menu_item_id,
      quantity: it.quantity,
      price: priceMap[it.menu_item_id],
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    if (itemsError) throw itemsError;

    // notify vendor if connected
    try {
      const io = getIo();
      const vendorSocket = connectedUsers[vendorId];
      if (vendorSocket) {
        io.to(vendorSocket).emit('new_order', { order: orderData, items: orderItems });
      }
    } catch (e) {
      // socket not available or error – ignore
    }
    res.json({ order: orderData, items: orderItems });
  } catch (err) {
    next(err);
  }
}

// GET /api/client/orders
async function getMyOrders(req, res, next) {
  try {
    const clientId = req.user.id;
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('client_id', clientId);
    if (error) throw error;
    res.json({ orders: data });
  } catch (err) {
    next(err);
  }
}

module.exports = { getVendors, getVendorMenu, createOrder, getMyOrders };
