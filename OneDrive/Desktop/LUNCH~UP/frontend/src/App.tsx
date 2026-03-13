import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { CartProvider } from './contexts/CartContext';
import { SocketProvider } from './contexts/SocketContext';
import NotificationPopup from './components/NotificationPopup';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Vendors from './pages/Vendors';
import Menu from './pages/Menu';
import VendorMenu from './pages/VendorMenu';
import Cart from './pages/Cart';
import MyOrders from './pages/MyOrders';
import Checkout from './pages/checkout';
import PaymentCallback from './pages/PaymentCallback';
import OrderTracking from './pages/OrderTracking';
import Admin from './pages/Admin';
import AdminDashboard from './pages/AdminDashboard';

// Admin Pages
import AdminOrders from './pages/admin/AdminOrders';
import AdminOrderDetails from './pages/admin/AdminOrderDetails';
import AdminPayments from './pages/admin/AdminPayments';
import AdminMenu from './pages/admin/AdminMenu';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminReviews from './pages/admin/AdminReviews';
import AdminSettings from './pages/admin/AdminSettings';
import AdminVendors from './pages/admin/AdminVendors';
import AdminLoyalty from './pages/admin/AdminLoyalty';

// Vendor Pages
import VendorLogin from './pages/vendor/VendorLogin';
import VendorDashboard from './pages/vendor/VendorDashboard';
import MenuManagement from './pages/vendor/MenuManagement';
import VendorOrders from './pages/vendor/Orders';
import Promotions from './pages/vendor/Promotions';
import Customers from './pages/vendor/Customers';
import Settings from './pages/vendor/Settings';
import MyRestaurant from './pages/vendor/MyRestaurant';
// reuse AdminMenu and AdminOrders for vendor area (deprecated)

// Layouts
import AdminLayout from './components/admin/AdminLayout';
import VendorLayout from './components/vendor/VendorLayout';

function App() {
  const loadUser = useAuthStore((state) => state.loadUser);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <>
      <NotificationPopup />
      <BrowserRouter>
        <SocketProvider>
          <CartProvider>
          <Routes>
          {/* Client Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/vendors" element={<Vendors />} />
          <Route path="/vendors/:id/menu" element={<VendorMenu />} />
          <Route path="/track/:orderNumber" element={<OrderTracking />} />
          <Route element={<ProtectedRoute allowedRoles={['user']} />}>
            <Route path="/cart" element={<Cart />} />
            <Route path="/my-orders" element={<MyOrders />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment/callback" element={<PaymentCallback />} />
          </Route>
          <Route path="/community" element={<Home />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<Admin />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin','super_admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="orders/:id" element={<AdminOrderDetails />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="menu" element={<AdminMenu />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="vendors" element={<AdminVendors />} />
            <Route path="loyalty" element={<AdminLoyalty />} />
          </Route>

          {/* Vendor Routes */}
          <Route path="/vendor/login" element={<VendorLogin />} />
          <Route
            path="/vendor"
            element={
              <ProtectedRoute allowedRoles={['vendor']}>
                <VendorLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<VendorDashboard />} />
            <Route path="restaurant" element={<MyRestaurant />} />
            <Route path="orders" element={<VendorOrders />} />
            <Route path="orders/:id" element={<AdminOrderDetails />} />
            <Route path="menu" element={<MenuManagement />} />
            <Route path="promotions" element={<Promotions />} />
            <Route path="customers" element={<Customers />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </CartProvider>
        </SocketProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
