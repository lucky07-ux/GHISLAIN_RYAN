import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Trash2 } from 'lucide-react';
import { orderService } from '../../services/orderService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

const statusOptions = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const statusLabels: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  processing: 'En préparation',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};
const statusBadge: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  confirmed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  processing: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  shipped: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  delivered: 'bg-green-500/20 text-green-400 border-green-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function AdminOrderDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const basePath = window.location.pathname.startsWith('/vendor') ? '/vendor' : '/admin';
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        setLoading(true);
        const res = await orderService.getOrderById(id);
        setOrder(res.order);
        setNewStatus(res.order?.status || '');
      } catch {
        toast.error('Commande introuvable');
        navigate(`${basePath}/orders`);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  const handleUpdateStatus = async () => {
    if (!id || newStatus === order?.status) return;
    try {
      setUpdating(true);
      await orderService.updateOrderStatus(id, newStatus);
      setOrder((prev: any) => ({ ...prev, status: newStatus }));
      toast.success('Statut mis à jour');
    } catch {
      toast.error('Erreur mise à jour statut');
    } finally {
      setUpdating(false);
    }
  };

  const handleConfirmOrder = async () => {
    if (!id || !window.confirm('Confirmer et notifier le client?')) return;
    try {
      await orderService.confirmOrder(id);
      setOrder((prev: any) => ({ ...prev, status: 'confirmed' }));
      toast.success('✅ Commande confirmée! WhatsApp envoyé');
    } catch {
      toast.error('Erreur confirmation commande');
    }
  };

  const handleConfirmPayment = async () => {
    if (!id || !window.confirm('Valider le paiement?')) return;
    try {
      await orderService.confirmPayment(id);
      setOrder((prev: any) => ({
        ...prev,
        payment: { ...prev.payment, status: 'paid', paidAt: new Date() }
      }));
      toast.success('✅ Paiement validé! WhatsApp envoyé');
    } catch {
      toast.error('Erreur validation paiement');
    }
  };

  const handleDelete = async () => {
    if (!id || !window.confirm('Supprimer cette commande ?')) return;
    try {
      await orderService.deleteOrder(id);
      toast.success('Commande supprimée');
      navigate(`${basePath}/orders`);
    } catch {
      toast.error('Erreur suppression');
    }
  };

  if (loading || !order) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-[#A0A0A0]">Chargement...</p>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => navigate(`${basePath}/orders`)}
        className="flex items-center gap-2 text-[#A0A0A0] hover:text-white mb-6 transition"
      >
        <ArrowLeft size={20} />
        Retour aux commandes
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Détails de la Commande</h1>
          <span className={`inline-block mt-2 px-3 py-1 rounded-lg text-sm font-medium border ${statusBadge[order.status] || ''}`}>
            {statusLabels[order.status] || order.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#1A1A1A] border border-[#34D399]/20 p-6 rounded-xl">
          <h3 className="text-[#A0A0A0] text-sm font-medium mb-1">Date commande</h3>
          <p className="text-white font-medium">{formatDate(order.createdAt)}</p>
        </div>
        <div className="bg-[#1A1A1A] border border-[#34D399]/20 p-6 rounded-xl">
          <h3 className="text-[#A0A0A0] text-sm font-medium mb-1">Montant total</h3>
          <p className="text-2xl font-bold text-[#FF6B35]">{formatCurrency(order.pricing?.total || 0)}</p>
        </div>
        <div className="bg-[#1A1A1A] border border-[#34D399]/20 p-6 rounded-xl">
          <h3 className="text-[#A0A0A0] text-sm font-medium mb-1">Nombre d'items</h3>
          <p className="text-white font-medium">{order.items?.length || 0}</p>
        </div>
      </div>

      <div className="bg-[#1A1A1A] border border-[#34D399]/20 p-6 rounded-xl mb-8">
        <h2 className="text-lg font-bold text-white mb-4">Gestion du statut</h2>
        <div className="flex flex-wrap items-center gap-4">
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="px-4 py-2 bg-[#0A0A0A] border border-[#34D399]/30 rounded-lg text-white focus:outline-none focus:border-[#FF6B35]"
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>{statusLabels[s]}</option>
            ))}
          </select>
          <button
            onClick={handleUpdateStatus}
            disabled={updating || newStatus === order.status}
            className="px-4 py-2 bg-[#34D399]/20 border border-[#34D399]/30 rounded-lg hover:bg-[#34D399]/30 transition disabled:opacity-50"
          >
            {updating ? 'Mise à jour...' : 'Mettre à jour'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-[#1A1A1A] border border-[#34D399]/20 p-6 rounded-xl">
          <h2 className="text-lg font-bold text-white mb-4">Informations client</h2>
          <p className="text-[#D1D5DB] font-medium">{order.customerInfo?.name}</p>
          <a href={`tel:${order.customerInfo?.phone}`} className="flex items-center gap-2 text-[#34D399] hover:underline mt-2">
            <Phone size={18} />
            {order.customerInfo?.phone}
          </a>
          {order.customerInfo?.email && (
            <p className="text-[#A0A0A0] mt-2">{order.customerInfo.email}</p>
          )}
          <p className="text-[#A0A0A0] mt-4">
            <strong>Adresse:</strong> {order.deliveryInfo?.address}
          </p>
          {order.deliveryInfo?.instructions && (
            <p className="text-[#A0A0A0] mt-2">{order.deliveryInfo.instructions}</p>
          )}
        </div>

        <div className="bg-[#1A1A1A] border border-[#34D399]/20 p-6 rounded-xl">
          <h2 className="text-lg font-bold text-white mb-4">Résumé commande</h2>
          <div className="space-y-2">
            {order.items?.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between text-[#D1D5DB]">
                <span>{item.name} x{item.quantity}</span>
                <span>{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-[#34D399]/20 mt-4 pt-4 space-y-2">
            <div className="flex justify-between text-[#A0A0A0]">
              <span>Sous-total</span>
              <span>{formatCurrency(order.pricing?.subtotal || 0)}</span>
            </div>
            <div className="flex justify-between text-[#A0A0A0]">
              <span>Livraison</span>
              <span>{formatCurrency(order.pricing?.deliveryFee || 0)}</span>
            </div>
            <div className="flex justify-between text-white font-bold text-lg">
              <span>Total</span>
              <span>{formatCurrency(order.pricing?.total || 0)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleConfirmOrder}
          disabled={order.status === 'confirmed'}
          className="px-4 py-2 bg-green-600/20 border border-green-500/30 rounded-lg hover:bg-green-600/30 text-green-400 transition disabled:opacity-50"
        >
          ✅ Confirmer Commande (+ WhatsApp)
        </button>

        <button
          onClick={handleConfirmPayment}
          disabled={order.payment?.status === 'paid'}
          className="px-4 py-2 bg-blue-600/20 border border-blue-500/30 rounded-lg hover:bg-blue-600/30 text-blue-400 transition disabled:opacity-50"
        >
          💳 Valider Paiement (+ WhatsApp)
        </button>

        <button
          onClick={handleDelete}
          className="flex items-center gap-2 px-4 py-2 bg-red-600/20 border border-red-500/30 rounded-lg hover:bg-red-600/30 text-red-400 transition"
        >
          <Trash2 size={18} />
          Supprimer la commande
        </button>
      </div>
    </div>
  );
}
