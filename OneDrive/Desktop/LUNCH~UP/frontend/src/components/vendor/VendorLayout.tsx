import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  LogOut,
  X,
  Store,
  Users,
  Tag,
  Settings,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useSocket } from '../../contexts/SocketContext';
import toast from 'react-hot-toast';

const navItems = [
  { path: '/vendor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/vendor/restaurant', label: 'Mon Restaurant', icon: Store },
  { path: '/vendor/menu', label: 'Menu', icon: UtensilsCrossed },
  { path: '/vendor/orders', label: 'Commandes', icon: ShoppingBag },
  { path: '/vendor/promotions', label: 'Promotions', icon: Tag },
  { path: '/vendor/customers', label: 'Clients', icon: Users },
  { path: '/vendor/settings', label: 'Paramètres', icon: Settings },
];

export default function VendorLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, logout } = useAuthStore();
  const { newOrderCount, resetOrderCount } = useSocket();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (location.pathname === '/vendor/orders') {
      resetOrderCount();
    }
  }, [location.pathname, resetOrderCount]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Déconnecté');
      navigate('/vendor/login');
    } catch {
      toast.error('Erreur de déconnexion');
    }
  };

  if (!token) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#1A1A1A] border-r border-[#34D399]/20 fixed inset-y-0 left-0 z-40">
        <div className="p-6 border-b border-[#34D399]/20">
          <Link to="/vendor/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#FF6B35] to-[#34D399] rounded-lg flex items-center justify-center">
              <span className="font-bold text-white">L</span>
            </div>
            <span className="font-bold text-lg">LunchUp Vendeur</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path || (path !== '/vendor/dashboard' && location.pathname.startsWith(path));
            const isOrders = path === '/vendor/orders';
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition relative ${
                  isActive
                    ? 'bg-[#34D399]/20 text-[#34D399] border border-[#34D399]/30'
                    : 'text-[#A0A0A0] hover:bg-[#34D399]/10 hover:text-white'
                }`}
              >
                <Icon size={20} />
                {label}
                {isOrders && newOrderCount > 0 && (
                  <span className="ml-auto flex items-center justify-center w-6 h-6 bg-red-500 rounded-full text-xs font-bold animate-pulse">
                    {newOrderCount > 99 ? '99+' : newOrderCount}
                  </span>
                )}
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-600/10 transition mt-4"
          >
            <LogOut size={20} />
            Déconnexion
          </button>
        </nav>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 w-64 bg-[#1A1A1A] border-r border-[#34D399]/20 z-50 lg:hidden flex flex-col">
            <div className="p-6 border-b border-[#34D399]/20 flex justify-between items-center">
              <span className="font-bold">LunchUp Vendeur</span>
              <button onClick={() => setSidebarOpen(false)} className="p-2">
                <X size={24} />
              </button>
            </div>
            <nav className="p-4 space-y-1">
              {navItems.map(({ path, label, icon: Icon }) => {
                const isOrders = path === '/vendor/orders';
                return (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition relative ${
                      location.pathname === path ? 'bg-[#34D399]/20 text-[#34D399]' : 'text-[#A0A0A0] hover:bg-[#34D399]/10'
                    }`}
                  >
                    <Icon size={20} />
                    {label}
                    {isOrders && newOrderCount > 0 && (
                      <span className="ml-auto flex items-center justify-center w-6 h-6 bg-red-500 rounded-full text-xs font-bold animate-pulse">
                        {newOrderCount > 99 ? '99+' : newOrderCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-h-screen lg:pl-64">
        <header className="bg-[#1A1A1A] border-b border-[#34D399]/20 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-[#A0A0A0] hover:text-white"
          >
            <ShoppingBag size={24} />
          </button>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
