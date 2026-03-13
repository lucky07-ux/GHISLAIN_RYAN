import { useEffect, useState } from 'react';
import { vendorService } from '../../services/vendorService';
import VendorLayout from '../../components/layout/VendorLayout';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../utils/formatters';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const res = await vendorService.getVendorOrders();
      setOrders(res.orders || []);
    } catch (err) {
      toast.error('Erreur chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const changeStatus = async (order, next) => {
    try {
      await vendorService.updateOrderStatus(order.id, next);
      load();
    } catch {
      toast.error('Erreur statut');
    }
  };

  const renderActions = (o) => {
    if (o.status === 'PENDING') return <button onClick={() => changeStatus(o, 'ACCEPTED')} className="px-3 py-1 bg-green-600 rounded">Accepter</button>;
    if (o.status === 'ACCEPTED') return <button onClick={() => changeStatus(o, 'READY')} className="px-3 py-1 bg-yellow-600 rounded">Prêt</button>;
    if (o.status === 'READY') return <button onClick={() => changeStatus(o, 'DELIVERED')} className="px-3 py-1 bg-blue-600 rounded">Livré</button>;
    return null;
  };

  return (
    <VendorLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Commandes</h1>
          <button onClick={load} className="px-3 py-2 bg-[#34D399]/20 rounded">Rafraîchir</button>
        </div>

        {loading ? (
          <p className="text-[#A0A0A0]">Chargement...</p>
        ) : orders.length ? (
          <div className="space-y-4">
            {orders.map((o) => (
              <div key={o.id} className="bg-[#1A1A1A] p-4 rounded">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[#A0A0A0]">#{o.id}</span>
                  <span className="text-[#FF6B35] font-bold">{o.status}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>TOTAL: {formatCurrency(o.total_amount)}</span>
                  {renderActions(o)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[#A0A0A0]">Aucune commande</p>
        )}
      </div>
    </VendorLayout>
  );
}