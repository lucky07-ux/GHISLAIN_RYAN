import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface Props { children: ReactNode }

export default function VendorLayout({ children }: Props) {
  const { logout } = useAuthStore();

  return (
    <div className="min-h-screen flex bg-[#0A0A0A] text-white">
      <aside className="w-64 bg-[#0F1720] p-4 border-r border-[#222]">
        <h2 className="text-xl font-bold mb-6">Vendor Portal</h2>
        <nav className="space-y-2">
          <Link to="/vendor/dashboard" className="block py-2 px-3 rounded hover:bg-[#111827]">Dashboard</Link>
          <Link to="/vendor/restaurant" className="block py-2 px-3 rounded hover:bg-[#111827]">My Restaurant</Link>
          <Link to="/vendor/menu" className="block py-2 px-3 rounded hover:bg-[#111827]">Menu Management</Link>
          <Link to="/vendor/orders" className="block py-2 px-3 rounded hover:bg-[#111827]">Orders</Link>
          <Link to="/vendor/promotions" className="block py-2 px-3 rounded hover:bg-[#111827]">Promotions</Link>
          <Link to="/vendor/customers" className="block py-2 px-3 rounded hover:bg-[#111827]">Customers</Link>
          <Link to="/vendor/settings" className="block py-2 px-3 rounded hover:bg-[#111827]">Settings</Link>
        </nav>
        <div className="mt-6">
          <button onClick={() => logout()} className="w-full py-2 bg-[#FF6B35] rounded font-bold">Logout</button>
        </div>
      </aside>

      <main className="flex-1 p-6 max-w-6xl">
        {children}
      </main>
    </div>
  );
}
