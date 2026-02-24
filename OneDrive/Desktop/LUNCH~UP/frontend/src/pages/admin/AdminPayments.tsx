import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, RefreshCw, DollarSign } from 'lucide-react';
import { orderService } from '../../services/orderService';
import { formatCurrency } from '../../utils/formatters';
import { formatDate } from '../../utils/formatters';

interface PaymentRow {
  _id: string;
  orderNumber: string;
  customerInfo: { name: string };
  pricing: { total: number };
  payment: { method: string; status: string };
  createdAt: string;
}

export default function AdminPayments() {
  const [orders, setOrders] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await orderService.getAllOrders({ limit: 100 });
      setOrders(res.orders || []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const byMethod = orders.reduce(
    (acc, o) => {
      const m = o.payment?.method || 'cash';
      if (!acc[m]) acc[m] = { total: 0, count: 0 };
      acc[m].total += o.pricing?.total || 0;
      acc[m].count += 1;
      return acc;
    },
    {} as Record<string, { total: number; count: number }>
  );
  const pending = orders.filter((o) => o.payment?.status === 'pending');
  const pendingAmount = pending.reduce((s, o) => s + (o.pricing?.total || 0), 0);
  const totalReceived = orders
    .filter((o) => o.payment?.status === 'paid')
    .reduce((s, o) => s + (o.pricing?.total || 0), 0);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Suivi des Paiements</h1>
          <p className="text-[#A0A0A0]">Total reçu: {formatCurrency(totalReceived)}</p>
        </div>
        <button
          onClick={loadOrders}
          className="flex items-center gap-2 px-4 py-2 bg-[#34D399]/20 border border-[#34D399]/30 rounded-lg hover:bg-[#34D399]/30 transition"
        >
          <RefreshCw size={18} />
          Actualiser
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#1A1A1A] border border-orange-500/30 p-6 rounded-xl">
          <DollarSign className="text-orange-500 mb-2" size={24} />
          <p className="text-2xl font-bold text-white">{formatCurrency(byMethod.orange_money?.total || 0)}</p>
          <p className="text-sm text-[#A0A0A0]">Orange Money ({byMethod.orange_money?.count || 0} tx)</p>
        </div>
        <div className="bg-[#1A1A1A] border border-yellow-500/30 p-6 rounded-xl">
          <CreditCard className="text-yellow-500 mb-2" size={24} />
          <p className="text-2xl font-bold text-white">{formatCurrency(byMethod.mtn_momo?.total || 0)}</p>
          <p className="text-sm text-[#A0A0A0]">MTN MOMO ({byMethod.mtn_momo?.count || 0} tx)</p>
        </div>
        <div className="bg-[#1A1A1A] border border-green-500/30 p-6 rounded-xl">
          <DollarSign className="text-green-500 mb-2" size={24} />
          <p className="text-2xl font-bold text-white">{formatCurrency(byMethod.cash?.total || 0)}</p>
          <p className="text-sm text-[#A0A0A0]">Cash ({byMethod.cash?.count || 0} tx)</p>
        </div>
        <div className="bg-[#1A1A1A] border border-[#34D399]/20 p-6 rounded-xl">
          <p className="text-2xl font-bold text-yellow-400">{formatCurrency(pendingAmount)}</p>
          <p className="text-sm text-[#A0A0A0]">En attente ({pending.length} cmd)</p>
        </div>
      </div>

      <div className="bg-[#1A1A1A] border border-[#34D399]/20 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#34D399]/20 text-left">
                <th className="p-4 text-[#A0A0A0] font-medium">Date</th>
                <th className="p-4 text-[#A0A0A0] font-medium">N° Commande</th>
                <th className="p-4 text-[#A0A0A0] font-medium">Client</th>
                <th className="p-4 text-[#A0A0A0] font-medium">Montant</th>
                <th className="p-4 text-[#A0A0A0] font-medium">Méthode</th>
                <th className="p-4 text-[#A0A0A0] font-medium">Statut</th>
                <th className="p-4 text-[#A0A0A0] font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[#A0A0A0]">
                    Chargement...
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="border-b border-[#34D399]/10 hover:bg-[#0A0A0A]/50">
                    <td className="p-4 text-[#D1D5DB]">{formatDate(order.createdAt)}</td>
                    <td className="p-4 font-mono text-white">{order.orderNumber}</td>
                    <td className="p-4 text-[#D1D5DB]">{order.customerInfo?.name}</td>
                    <td className="p-4 font-bold text-[#FF6B35]">{formatCurrency(order.pricing?.total || 0)}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded text-xs">
                        {order.payment?.method === 'orange_money' && 'OM'}
                        {order.payment?.method === 'mtn_momo' && 'MOMO'}
                        {order.payment?.method === 'cash' && 'Cash'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          order.payment?.status === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                        }`}
                      >
                        {order.payment?.status === 'paid' ? 'Payé' : 'En attente'}
                      </span>
                    </td>
                    <td className="p-4">
                      <Link to={`/admin/orders/${order._id}`} className="text-[#34D399] hover:underline">
                        Détails
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
