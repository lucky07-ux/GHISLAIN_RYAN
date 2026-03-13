import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Star, Timer, MapPin, UtensilsCrossed } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import { clientService } from '../services/clientService';
import { useCart } from '../contexts/CartContext';
import { formatCurrency } from '../utils/formatters';

const CATEGORY_LABELS = [
  { key: 'popular', label: 'Popular' },
  { key: 'meals', label: 'Meals' },
  { key: 'grills', label: 'Grills' },
  { key: 'drinks', label: 'Drinks' },
  { key: 'desserts', label: 'Desserts' },
];

export default function VendorMenu() {
  const { id: vendorId } = useParams();
  const [items, setItems] = useState([]);
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('popular');
  const { addItem } = useCart();

  useEffect(() => {
    const load = async () => {
      if (!vendorId) {
        setLoading(false);
        return;
      }
      try {
        const [vendorRes, menuRes] = await Promise.all([
          clientService.getVendor(vendorId),
          clientService.getVendorMenu(vendorId),
        ]);
        setVendor(vendorRes.vendor || null);
        setItems(menuRes.menu || []);
      } catch (err) {
        console.error('Error loading vendor menu', err);
        toast.error("Impossible de charger le vendeur");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [vendorId]);

  const categorized = useMemo(() => {
    const by = {
      popular: [],
      meals: [],
      grills: [],
      drinks: [],
      desserts: [],
    };
    items.forEach((item) => {
      const cat = (item.category || '').toLowerCase();
      if (cat.includes('drink') || cat.includes('boisson')) {
        by.drinks.push(item);
      } else if (cat.includes('dessert')) {
        by.desserts.push(item);
      } else if (cat.includes('grill') || cat.includes('bbq')) {
        by.grills.push(item);
      } else {
        by.meals.push(item);
      }
    });
    by.popular = items.slice(0, 6);
    return by;
  }, [items]);

  const visibleCategories = CATEGORY_LABELS.filter(
    (c) => categorized[c.key]?.length,
  );

  useEffect(() => {
    if (visibleCategories.length && !visibleCategories.find(c => c.key === activeCategory)) {
      setActiveCategory(visibleCategories[0].key);
    }
  }, [visibleCategories, activeCategory]);

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

  const currentItems = categorized[activeCategory] || [];

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto py-8">
        {/* Vendor header */}
        <div className="mb-8 rounded-3xl overflow-hidden border border-[#1f2937] bg-gradient-to-r from-[#22c55e]/20 via-[#16a34a]/10 to-black">
          <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-[#020617]/80 border border-[#22c55e]/40 flex items-center justify-center text-3xl md:text-4xl font-bold text-white">
              {(vendor?.name || 'L')[0]}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                {vendor?.name || 'Restaurant'}
              </h1>
              <p className="text-sm text-[#9ca3af] mb-3">
                African cuisine • Street food • Campus friendly
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-[#e5e7eb]">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/40 border border-white/10">
                  <Star size={14} className="text-[#fbbf24] fill-[#fbbf24]" />
                  4.8
                  <span className="text-[#9ca3af]">(120 avis)</span>
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/40 border border-white/10">
                  <Timer size={14} />
                  Préparation: 20–25 min
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/40 border border-white/10">
                  <MapPin size={14} />
                  Livraison: 15–25 min
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {visibleCategories.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setActiveCategory(cat.key)}
                className={`inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm border transition ${
                  activeCategory === cat.key
                    ? 'bg-[#22c55e] text-black border-[#22c55e]'
                    : 'bg-[#020617] text-[#e5e7eb] border-[#1f2937] hover:border-[#4b5563]'
                }`}
              >
                <UtensilsCrossed size={14} />
                {cat.label}
              </button>
            ))}
          </div>
          <span className="hidden md:inline text-xs text-[#9ca3af]">
            {items.length} plats disponibles
          </span>
        </div>

        {loading ? (
          <div className="text-center text-[#A0A0A0] py-8">Chargement...</div>
        ) : currentItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {currentItems.map((item) => (
              <div
                key={item.id}
                className="bg-[#020617] border border-[#1f2937] rounded-2xl overflow-hidden hover:border-[#22c55e] hover:-translate-y-1 transition transform"
              >
                <div className="h-40 bg-gradient-to-br from-[#22c55e]/20 to-[#0ea5e9]/20 flex items-center justify-center text-white text-3xl">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UtensilsCrossed size={32} />
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="text-base font-semibold text-white line-clamp-2">
                    {item.name}
                  </h3>
                  <p className="text-xs text-[#9ca3af] line-clamp-2">
                    {item.description || 'Repas savoureux préparé avec des ingrédients frais.'}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-lg font-bold text-[#FF6B35]">
                      {formatCurrency(item.price)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAdd(item)}
                      className="px-3 py-2 rounded-full bg-[#22c55e] text-black text-xs font-semibold hover:bg-[#16a34a] transition"
                    >
                      Ajouter
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-[#A0A0A0] py-8">
            Aucun plat disponible pour le moment.
          </div>
        )}
      </div>
    </MainLayout>
  );
}
