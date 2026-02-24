import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, RefreshCw, Phone } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { formatCurrency } from '../../utils/formatters';
import { formatDate } from '../../utils/formatters';

interface Customer {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  stats?: { totalOrders: number; totalSpent: number; lastOrderDate?: string };
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const res = await adminService.getCustomers();
      setCustomers(res.customers || res || []);
    } catch {
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const list = Array.isArray(customers) ? customers : [];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Base de Données Clients</h1>
          <p className="text-[#A0A0A0]">{list.length} clients</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-4 py-2 bg-[#34D399]/20 border border-[#34D399]/30 rounded-lg hover:bg-[#34D399]/30 transition"
        >
          <RefreshCw size={18} />
          Actualiser
        </button>
      </div>

      <div className="bg-[#1A1A1A] border border-[#34D399]/20 rounded-xl overflow-hidden">
        {loading ? (
          <p className="p-12 text-center text-[#A0A0A0]">Chargement...</p>
        ) : list.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="mx-auto text-[#A0A0A0] mb-4" size={48} />
            <p className="text-[#A0A0A0]">Aucun client pour le moment</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#34D399]/20 text-left">
                  <th className="p-4 text-[#A0A0A0] font-medium">Nom</th>
                  <th className="p-4 text-[#A0A0A0] font-medium">Téléphone</th>
                  <th className="p-4 text-[#A0A0A0] font-medium">Email</th>
                  <th className="p-4 text-[#A0A0A0] font-medium">Commandes</th>
                  <th className="p-4 text-[#A0A0A0] font-medium">Total dépensé</th>
                  <th className="p-4 text-[#A0A0A0] font-medium">Dernière commande</th>
                  <th className="p-4 text-[#A0A0A0] font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {list.map((c) => (
                  <tr key={c._id} className="border-b border-[#34D399]/10 hover:bg-[#0A0A0A]/50">
                    <td className="p-4 font-medium text-white">{c.name}</td>
                    <td className="p-4 text-[#D1D5DB]">{c.phone}</td>
                    <td className="p-4 text-[#A0A0A0]">{c.email || '—'}</td>
                    <td className="p-4 text-[#D1D5DB]">{c.stats?.totalOrders ?? 0}</td>
                    <td className="p-4 font-bold text-[#FF6B35]">{formatCurrency(c.stats?.totalSpent ?? 0)}</td>
                    <td className="p-4 text-[#A0A0A0]">
                      {c.stats?.lastOrderDate ? formatDate(c.stats.lastOrderDate) : '—'}
                    </td>
                    <td className="p-4">
                      <Link to={`/admin/customers/${c._id}`} className="text-[#34D399] hover:underline">
                        Détails
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
