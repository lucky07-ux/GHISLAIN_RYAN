import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import MainLayout from '../components/layout/MainLayout';
import { clientService } from '../services/clientService';
import { formatCurrency } from '../utils/formatters';
import { useCartStore } from '../store/cartstore';

export default function MyOrders() {
  const [phone, setPhone] = useState(() => localStorage.getItem('customerPhone') || '');
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const addToCart = useCartStore((s) => s.addItem);

  const loadData = async (currentPhone) => {
    if (!currentPhone) return;
    setLoading(true);
    try {
      const [profileRes, ordersRes] = await Promise.all([
        clientService.getProfile(currentPhone),
        clientService.getMyOrders(currentPhone),
      ]);
      setProfile(profileRes.profile || null);
      setOrders(ordersRes.orders || []);
    } catch (err) {
      console.error('Error loading customer dashboard', err);
      toast.error('Impossible de charger vos informations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (phone) {
      loadData(phone);
    }
  }, []);

  const handleSubmitPhone = (e) => {
    e.preventDefault();
    if (!phone.trim()) return;
    localStorage.setItem('customerPhone', phone.trim());
    loadData(phone.trim());
  };

  const handleReorder = (order) => {
    if (!order.items || !order.items.length) return;
    order.items.forEach((it) => {
      addToCart({
        menuItemId: it.name, // on n'a pas l'id menuItem d'origine ici
        name: it.name,
        price: it.price,
        quantity: it.quantity,
        vendorId: null,
      });
    });
    toast.success('Articles ajoutés au panier');
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto py-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Mon espace LunchUp</h1>
            <p className="text-sm text-[#9ca3af]">
              Suivez vos commandes, consultez votre solde cashback et vos adresses.
            </p>
          </div>
          <form onSubmit={handleSubmitPhone} className="flex gap-2">
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+237 6XX XX XX XX"
              className="px-3 py-2 rounded-lg bg-[#020617] border border-[#374151] text-sm text-white placeholder-[#6b7280] focus:outline-none focus:border-[#22c55e]"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#22c55e] text-black text-sm font-semibold hover:bg-[#16a34a] transition"
            >
              Charger
            </button>
          </form>
        </div>

        {loading && <div className="text-center text-[#A0A0A0]">Chargement...</div>}

        {!loading && profile && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-[#020617] border border-[#1f2937] rounded-2xl p-5 space-y-2">
              <h2 className="text-lg font-semibold text-white">Profil</h2>
              <p className="text-sm text-[#e5e7eb]">
                {profile.name || 'Client LunchUp'} • {profile.phone}
              </p>
              {profile.email && (
                <p className="text-xs text-[#9ca3af]">{profile.email}</p>
              )}
              <p className="text-xs text-[#9ca3af] mt-2">
                Commandes: {profile.stats?.totalOrders ?? 0} • Total dépensé:{' '}
                {formatCurrency(profile.stats?.totalSpent ?? 0)}
              </p>
            </div>
            <div className="bg-[#020617] border border-[#1f2937] rounded-2xl p-5 space-y-2">
              <h2 className="text-lg font-semibold text-white">Portefeuille</h2>
              <p className="text-sm text-[#9ca3af]">Solde Cashback</p>
              <p className="text-2xl font-bold text-[#22c55e]">
                {formatCurrency(profile.walletBalance ?? 0)}
              </p>
            </div>
          </div>
        )}

        {!loading && profile && (
          <div className="bg-[#020617] border border-[#1f2937] rounded-2xl p-5">
            <h2 className="text-lg font-semibold text-white mb-3">Adresses enregistrées</h2>
            {profile.addresses && profile.addresses.length ? (
              <ul className="space-y-2 text-sm text-[#e5e7eb]">
                {profile.addresses.map((addr, idx) => (
                  <li key={idx} className="flex items-center justify-between">
                    <span>{addr.address}</span>
                    {addr.isDefault && (
                      <span className="text-xs text-[#22c55e] border border-[#22c55e]/40 rounded-full px-2 py-0.5">
                        Par défaut
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[#9ca3af]">
                Aucune adresse enregistrée pour le moment.
              </p>
            )}
          </div>
        )}

        {!loading && profile && (
          <div className="bg-[#020617] border border-[#1f2937] rounded-2xl p-5">
            <h2 className="text-lg font-semibold text-white mb-4">Historique des commandes</h2>
            {orders.length ? (
              <div className="space-y-4">
                {orders.map((o) => (
                  <div
                    key={o.id}
                    className="border border-[#1f2937] rounded-xl p-4 flex flex-col gap-2"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-[#9ca3af]">Commande</p>
                        <p className="text-sm font-mono text-white">
                          {o.orderNumber}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-[#9ca3af]">Total</p>
                        <p className="text-sm font-semibold text-[#FF6B35]">
                          {formatCurrency(o.total)}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-[#9ca3af] capitalize">
                      Statut: <span className="text-white">{o.status}</span>
                    </p>
                    <div className="text-xs text-[#e5e7eb]">
                      {o.items?.slice(0, 3).map((it, idx) => (
                        <span key={idx}>
                          {it.quantity}x {it.name}
                          {idx < (o.items.length - 1) ? ', ' : ''}
                        </span>
                      ))}
                      {o.items?.length > 3 && '...'}
                    </div>
                    <div className="flex justify-between mt-2">
                      <button
                        type="button"
                        onClick={() => handleReorder(o)}
                        className="px-3 py-1.5 rounded-lg border border-[#374151] text-xs text-[#e5e7eb] hover:bg-[#111827] transition"
                      >
                        Commander à nouveau
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#9ca3af]">
                Vous n'avez pas encore de commandes associées à ce numéro.
              </p>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
