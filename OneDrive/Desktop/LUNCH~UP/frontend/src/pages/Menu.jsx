import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import MainLayout from '../components/layout/MainLayout';
import { clientService } from '../services/clientService';
import { useCart } from '../contexts/CartContext';
import { formatCurrency } from '../utils/formatters';

export default function Menu() {
  const { id: vendorId } = useParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await clientService.getVendorMenu(vendorId);
        setItems(res.menu || []);
      } catch (err) {
        console.error('Error loading menu', err);
        toast.error('Impossible de charger le menu');
      } finally {
        setLoading(false);
      }
    };
    if (vendorId) {
      load();
    } else {
      setLoading(false);
    }
  }, [vendorId]);

  const handleAdd = (item) => {
    addItem({ menuItemId: item.id, name: item.name, price: item.price, quantity: 1, vendorId });
    toast.success(`${item.name} ajouté au panier`);
  };

  if (!vendorId) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto py-12 text-center text-[#A0A0A0]">
          Sélectionnez un vendeur pour voir son menu
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto py-12">
        <h1 className="text-4xl font-bold text-white mb-8">Menu</h1>
        {loading ? (
          <div className="text-center text-[#A0A0A0]">Chargement...</div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-[#1A1A1A] border border-[#34D399]/20 rounded-xl overflow-hidden hover:border-[#34D399]/50 transition group"
              >
                <div className="p-4">
                  <h3 className="text-lg font-bold text-white mb-2">{item.name}</h3>
                  <p className="text-[#A0A0A0] text-sm mb-4">
                    {item.description || 'Aucune description'}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-[#FF6B35]">
                      {formatCurrency(item.price)}
                    </span>
                    <button
                      onClick={() => handleAdd(item)}
                      className="px-4 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-orange-600 transition font-bold"
                    >
                      Ajouter
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-[#A0A0A0]">Aucun plat disponible</div>
        )}
      </div>
    </MainLayout>
  );
}
