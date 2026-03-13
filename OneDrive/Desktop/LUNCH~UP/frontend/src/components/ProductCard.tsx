
import { Utensils } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCartStore } from '../store/cartstore';
import { formatCurrency } from '../utils/formatters';
import type { MenuItem } from '../types/index';

interface ProductCardProps {
  item: MenuItem;
  showDay?: boolean;
}

export default function ProductCard({ item, showDay = true }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addItem({
      menuItemId: item._id!,
      name: item.name,
      price: item.price,
      quantity: 1,
    });
    toast.success(`${item.name} ajouté au panier!`);
  };

  const backendBaseUrl = (import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000');

  return (
    <div className="bg-[#1A1A1A] border border-[#34D399]/20 rounded-xl overflow-hidden hover:border-[#34D399]/50 transition group">
      <div className="aspect-video bg-gradient-to-br from-[#FF6B35]/20 to-[#34D399]/20 flex items-center justify-center relative">
        {item.imageUrl ? (
          <img
            src={`${backendBaseUrl}${item.imageUrl}`}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to icon if image fails to load
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        {!item.imageUrl && <Utensils size={60} className="text-[#FF6B35]" />}
        <Utensils size={60} className="text-[#FF6B35] hidden" />
        {showDay && (
          <div className="absolute top-2 right-2 bg-[#34D399] text-[#0A0A0A] px-3 py-1 rounded-full text-sm font-bold">
            {item.dayOfWeek}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold text-white mb-2">{item.name}</h3>
        <p className="text-[#A0A0A0] text-sm mb-4">
          {item.description || 'Plat délicieux avec accompagnements'}
        </p>
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-[#FF6B35]">
            {formatCurrency(item.price)}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={item.quantityAvailable === 0}
            className="px-4 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-orange-600 transition font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {item.quantityAvailable === 0 ? 'Rupture' : 'Ajouter'}
          </button>
        </div>
      </div>
    </div>
  );
}
