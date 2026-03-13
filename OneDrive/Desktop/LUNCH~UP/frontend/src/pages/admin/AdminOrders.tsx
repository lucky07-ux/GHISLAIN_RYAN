import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ShoppingBag, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';

interface OrderItem {
  _id: string;
  orderNumber: string;
  customerInfo: { name: string; phone: string };
  items: { name: string; quantity: number; price: number }[];
  pricing: { total: number };
  payment: { method: string };
  status: string;
  createdAt: string;
}

const statusBadge: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  confirmed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  processing: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  shipped: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  delivered: 'bg-green-500/20 text-green-400 border-green-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const paymentBadge: Record<string, string> = {
  orange_money: 'bg-orange-500/20 text-orange-400',
  mtn_momo: 'bg-yellow-500/20 text-yellow-400',
  cash: 'bg-green-500/20 text-green-400',
};

export default function AdminOrders() {
  const [searchParams] = useSearchParams();
  const statusFromUrl = searchParams.get('status') || '';
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const user = useAuthStore(state => state.user);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(statusFromUrl);

  const updateStatus = async (id: string, status: string) => {
    try {
      await orderService.updateOrderStatus(id, status);
      toast.success('Statut mis à jour');
      loadOrders();
    } catch {
      toast.error('Erreur mise à jour statut');
    }
  };

  const location = window.location.pathname;
  const basePath = location.startsWith('/vendor') ? '/vendor' : '/admin';

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await orderService.getAllOrders({ limit: 50, ...(statusFilter && { status: statusFilter }) });
      setOrders(res.orders || []);
    } catch (err) {
      toast.error('Erreur chargement commandes');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setStatusFilter(statusFromUrl);
  }, [statusFromUrl]);

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestion des Commandes</h1>
          <p className="text-[#A0A0A0]">{orders.length} commandes</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-[#1A1A1A] border border-[#34D399]/30 rounded-lg text-white focus:outline-none focus:border-[#FF6B35]"
          >
            <option value="">Toutes</option>
            <option value="pending">En attente</option>
            <option value="confirmed">Confirmées</option>
            <option value="processing">En préparation</option>
            <option value="delivered">Livrées</option>
          </select>
          <button
            onClick={loadOrders}
            className="flex items-center gap-2 px-4 py-2 bg-[#34D399]/20 border border-[#34D399]/30 rounded-lg hover:bg-[#34D399]/30 transition"
          >
            <RefreshCw size={18} />
            Actualiser
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-[#A0A0A0] text-center py-12">Chargement...</p>
      ) : orders.length === 0 ? (
        <div className="bg-[#1A1A1A] border border-[#34D399]/20 rounded-xl p-12 text-center">
          <ShoppingBag className="mx-auto text-[#A0A0A0] mb-4" size={48} />
          <p className="text-[#A0A0A0]">Aucune commande</p>
        </div>
      ) : (
        <div className="bg-[#1A1A1A] border border-[#34D399]/20 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#34D399]/20 text-left">
                  <th className="p-4 text-[#A0A0A0] font-medium">N° Commande</th>
                  <th className="p-4 text-[#A0A0A0] font-medium">Date</th>
                  <th className="p-4 text-[#A0A0A0] font-medium">Client</th>
                  <th className="p-4 text-[#A0A0A0] font-medium">Montant</th>
                  <th className="p-4 text-[#A0A0A0] font-medium">Paiement</th>
                  <th className="p-4 text-[#A0A0A0] font-medium">Statut</th>
                  <th className="p-4 text-[#A0A0A0] font-medium">Action</th>
                  {user?.role === 'vendor' && <th className="p-4 text-[#A0A0A0] font-medium">Rapide</th>}
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="border-b border-[#34D399]/10 hover:bg-[#0A0A0A]/50">
                    <td className="p-4 font-mono text-white">{order.orderNumber}</td>
                    <td className="p-4 text-[#D1D5DB]">{formatDate(order.createdAt)}</td>
                    <td className="p-4 text-[#D1D5DB]">
                      {order.customerInfo?.name}
                      <br />
                      <span className="text-sm text-[#A0A0A0]">{order.customerInfo?.phone}</span>
                    </td>
                    <td className="p-4 font-bold text-[#FF6B35]">{formatCurrency(order.pricing?.total || 0)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${paymentBadge[order.payment?.method] || 'bg-[#1A1A1A]'}`}>
                        {order.payment?.method === 'orange_money' && 'OM'}
                        {order.payment?.method === 'mtn_momo' && 'MOMO'}
                        {order.payment?.method === 'cash' && 'Cash'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${statusBadge[order.status] || 'bg-[#1A1A1A]'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <Link
                        to={`${basePath}/orders/${order._id}`}
                        className="text-[#34D399] hover:text-[#34D399]/80 font-medium"
                      >
                        Voir détails
                      </Link>
                    </td>
                    {user?.role === 'vendor' && (
                      <td className="p-4">
                        <div className="flex gap-2">
                          {order.status === 'pending' && (
                            <button
                              onClick={() => updateStatus(order._id, 'confirmed')}
                              className="text-blue-400 text-sm"
                            >Accepter</button>
                          )}
                          {order.status === 'confirmed' && (
                            <button
                              onClick={() => updateStatus(order._id, 'processing')}
                              className="text-orange-400 text-sm"
                            >Préparer</button>
                          )}
                          {order.status === 'processing' && (
                            <button
                              onClick={() => updateStatus(order._id, 'delivered')}
                              className="text-green-400 text-sm"
                            >Livré</button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
