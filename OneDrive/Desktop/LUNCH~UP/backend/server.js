// Import dependencies
const express = require('express');
const http = require('http');
const cors = require('cors');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { createPaymentLink, flutterwaveWebhook } = require('./flutterwave');

// Load environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create Supabase client with service role key (admin privileges)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const app = express();

// Configure CORS for Express
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

app.use(express.json());

// Create HTTP server and attach Socket.io
const server = http.createServer(app);

// Initialize Socket.io with proper CORS
const { initSocket } = require('./utils/socket');
initSocket(server);

// POST /create-vendor route
app.post('/create-vendor', async (req, res) => {
  const { business_name, owner_name, email, phone, subscription_plan } = req.body;

  // Generate a random temporary password
  const tempPassword = Math.random().toString(36).slice(-10);

  // Create user in Supabase Auth (admin API)
  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
  });

  if (userError) {
    return res.status(400).json({ error: userError.message });
  }

  const userId = userData.user.id;

  // Insert into vendors table
  const { error: vendorError } = await supabase
    .from('vendors')
    .insert([{
      id: userId,
      business_name,
      owner_name,
      email,
      phone,
      status: 'active',
      subscription_plan,
      created_at: new Date().toISOString(),
    }]);

  if (vendorError) {
    return res.status(400).json({ error: vendorError.message });
  }

  // Insert into profiles table (role = vendor)
  const { error: profileError } = await supabase
    .from('profiles')
    .insert([{
      id: userId,
      email,
      role: 'vendor',
    }]);

  if (profileError) {
    return res.status(400).json({ error: profileError.message });
  }

  res.json({ success: true, user_id: userId, tempPassword });
});

// Flutterwave payment link route
app.post('/create-payment-link', createPaymentLink);

// Flutterwave webhook route
app.post('/webhook/flutterwave', express.json({ type: '*/*' }), flutterwaveWebhook);

// PayUnit routes
app.use('/api/payunit', require('./routes/payunitRoutes'));

// Marketplace routes (client/vendor/admin)
app.use('/api/client', require('./routes/clientRoutes'));
app.use('/api/vendor', require('./routes/vendorRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// centralized error handler (must come after all routes)
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

server.listen(5000, () => {
  console.log('Server running on port 5000');
});
