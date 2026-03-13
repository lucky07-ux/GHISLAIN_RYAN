import { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { clientService } from '../services/clientService';
import toast from 'react-hot-toast';
import MainLayout from '../components/layout/MainLayout';
import { formatCurrency } from '../utils/formatters';

export default function Cart() {
  const { items, removeItem, clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const handleOrder = async () => {
    if (!items.length) return;
    setSubmitting(true);
    try {
      const payload = {
        vendorId: items[0].vendorId || null,
        items: items.map((i) => ({ menu_item_id: i.menuItemId, quantity: i.quantity })),
      };
      await clientService.createOrder(payload);
      toast.success('Commande créée');
      clearCart();
    } catch (err) {
      console.error('Order error', err);
      toast.error('Échec de création de la commande');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto py-12">
        <h1 className="text-4xl font-bold text-white mb-8">Mon Panier</h1>
        {items.length === 0 ? (
          <div className="text-center text-[#A0A0A0]">Votre panier est vide</div>
        ) : (
          <>
            <div className="space-y-4 mb-8">
              {items.map((i) => (
                <div key={i.menuItemId} className="flex justify-between items-center bg-[#1A1A1A] p-4 rounded-lg">
                  <div>
                    <h3 className="text-white font-bold">{i.name}</h3>
                    <p className="text-[#A0A0A0]">Quantité: {i.quantity}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[#FF6B35] font-bold">{formatCurrency(i.price * i.quantity)}</span>
                    <button
                      onClick={() => removeItem(i.menuItemId)}
                      className="text-red-500 hover:text-red-400"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-xl text-white font-bold">Total:</span>
              <span className="text-2xl font-bold text-[#FF6B35]">{formatCurrency(total)}</span>
            </div>
            <div className="flex gap-4">
              <button
                onClick={clearCart}
                className="px-6 py-3 bg-[#555] text-white rounded-lg hover:bg-[#666] transition"
              >
                Vider
              </button>
              <button
                disabled={submitting}
                onClick={handleOrder}
                className="px-6 py-3 bg-[#FF6B35] text-white rounded-lg hover:bg-orange-600 transition font-bold"
              >
                {submitting ? 'En cours...' : 'Commander'}
              </button>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
