import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  CreditCard,
  UtensilsCrossed,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  RefreshCw,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const navItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/orders', label: 'Commandes', icon: ShoppingBag },
  { path: '/admin/payments', label: 'Paiements', icon: CreditCard },
  { path: '/admin/menu', label: 'Menu / Inventaire', icon: UtensilsCrossed },
  { path: '/admin/customers', label: 'Clients', icon: Users },
  { path: '/admin/reviews', label: 'Avis Communauté', icon: MessageSquare },
  { path: '/admin/settings', label: 'Paramètres', icon: Settings },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Déconnecté');
      navigate('/admin/login');
    } catch {
      toast.error('Erreur de déconnexion');
    }
  };

  if (!token) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#1A1A1A] border-r border-[#34D399]/20 fixed inset-y-0 left-0 z-40">
        <div className="p-6 border-b border-[#34D399]/20">
          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#FF6B35] to-[#34D399] rounded-lg flex items-center justify-center">
              <span className="font-bold text-white">L</span>
            </div>
            <span className="font-bold text-lg">LunchUp Admin</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path || (path !== '/admin/dashboard' && location.pathname.startsWith(path));
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                  isActive
                    ? 'bg-[#34D399]/20 text-[#34D399] border border-[#34D399]/30'
                    : 'text-[#A0A0A0] hover:bg-[#34D399]/10 hover:text-white'
                }`}
              >
                <Icon size={20} />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Sidebar - Mobile overlay */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 w-64 bg-[#1A1A1A] border-r border-[#34D399]/20 z-50 lg:hidden flex flex-col">
            <div className="p-6 border-b border-[#34D399]/20 flex justify-between items-center">
              <span className="font-bold">LunchUp Admin</span>
              <button onClick={() => setSidebarOpen(false)} className="p-2">
                <X size={24} />
              </button>
            </div>
            <nav className="p-4 space-y-1">
              {navItems.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                    location.pathname === path ? 'bg-[#34D399]/20 text-[#34D399]' : 'text-[#A0A0A0] hover:bg-[#34D399]/10'
                  }`}
                >
                  <Icon size={20} />
                  {label}
                </Link>
              ))}
            </nav>
          </aside>
        </>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-h-screen lg:pl-64">
        <header className="bg-[#1A1A1A] border-b border-[#34D399]/20 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-[#34D399]/10 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <div>
              <h1 className="text-xl font-bold">Dashboard LunchUp</h1>
              <p className="text-[#A0A0A0] text-sm">Vue d'ensemble de votre activité</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.location.reload()}
              className="p-2 hover:bg-[#34D399]/10 rounded-lg transition"
              title="Actualiser"
            >
              <RefreshCw size={20} />
            </button>
            <span className="text-sm text-[#A0A0A0] hidden sm:inline">
              {user?.email || 'Admin'}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-lg transition"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
