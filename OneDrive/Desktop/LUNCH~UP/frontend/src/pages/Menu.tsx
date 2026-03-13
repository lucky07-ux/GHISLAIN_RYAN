import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import MainLayout from '../components/layout/MainLayout';
import { menuService } from '../services/menuService';
import { useCartStore } from '../store/cartstore';
import { formatCurrency } from '../utils/formatters';
import { Utensils } from 'lucide-react';

interface MenuItem {
  _id: string;
  name: string;
  price: number;
  description?: string;
  dayOfWeek: string;
  quantityAvailable: number;
  imageUrl?: string;
}

const DAYS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'];

export default function Menu() {
  const backendBaseUrl = (import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000');
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedDay, setSelectedDay] = useState('lundi');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMenu = async () => {
      try {
        const response = await menuService.getCurrentMenu();
        setMenuItems(response.menuItems || []);
      } catch (error) {
        console.error('Error loading menu:', error);
        toast.error('Erreur chargement menu');
      } finally {
        setLoading(false);
      }
    };
    loadMenu();
  }, []);

  const handleAddToCart = (item: MenuItem) => {
    addItem({
      menuItemId: item._id,
      name: item.name,
      price: item.price,
      quantity: 1,
    });
    toast.success(`${item.name} ajouté au panier!`);
  };

  const filteredItems = menuItems.filter(item =>
    item.dayOfWeek?.toLowerCase() === selectedDay.toLowerCase()
  );

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Notre <span className="bg-gradient-to-r from-[#FF6B35] to-[#34D399] bg-clip-text text-transparent">Menu</span>
          </h1>
          <p className="text-xl text-[#A0A0A0]">
            Découvrez nos plats frais préparés chaque jour
          </p>
        </div>

        {/* Day Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {DAYS.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-6 py-3 rounded-lg font-bold transition-all duration-300 ${
                selectedDay === day
                  ? 'bg-gradient-to-r from-[#FF6B35] to-orange-600 text-white shadow-lg shadow-[#FF6B35]/50 scale-105'
                  : 'bg-[#1A1A1A] border border-[#34D399]/20 text-[#A0A0A0] hover:border-[#34D399]/50 hover:text-white hover:scale-105'
              }`}
            >
              {day.charAt(0).toUpperCase() + day.slice(1)}
            </button>
          ))}
        </div>

        {/* Menu Items */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B35] mx-auto mb-4"></div>
            <p className="text-[#A0A0A0]">Chargement du menu...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Utensils size={64} className="mx-auto text-[#A0A0A0] mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Aucun plat disponible</h3>
                <p className="text-[#A0A0A0]">Il n'y a pas de plats pour {selectedDay} cette semaine.</p>
              </div>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={item._id}
                  className="bg-[#1A1A1A] border border-[#34D399]/20 rounded-xl overflow-hidden hover:border-[#34D399]/50 hover:scale-105 transition-all duration-300 group"
                >
                  {/* Image */}
                  <div className="aspect-video bg-gradient-to-br from-[#FF6B35]/20 to-[#34D399]/20 relative overflow-hidden">
                    {item.imageUrl ? (
                      <img
                        src={`${backendBaseUrl}${item.imageUrl}`}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          console.error('❌ Client menu image load error:', `http://localhost:5001${item.imageUrl}`);
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling!.classList.remove('hidden');
                        }}
                        onLoad={() => {
                          console.log('✅ Client menu image loaded:', `http://localhost:5001${item.imageUrl}`);
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full flex items-center justify-center ${item.imageUrl ? 'hidden' : ''}`}>
                      <Utensils size={60} className="text-[#FF6B35]" />
                    </div>
                    {/* Debug info */}
                    {item.imageUrl && (
                      <div className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-2 py-1 rounded">
                        URL: {item.imageUrl}
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-[#34D399] text-[#0A0A0A] px-3 py-1 rounded-full text-sm font-bold">
                      {item.dayOfWeek}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2">{item.name}</h3>
                    <p className="text-[#A0A0A0] text-sm mb-4 line-clamp-2">
                      {item.description || 'Plat délicieux avec accompagnements frais'}
                    </p>

                    {/* Stock Status */}
                    <div className="mb-4">
                      {item.quantityAvailable > 5 ? (
                        <span className="text-green-500 text-sm font-medium">
                          ✓ Disponible ({item.quantityAvailable} portions)
                        </span>
                      ) : item.quantityAvailable > 0 ? (
                        <span className="text-yellow-500 text-sm font-medium">
                          ⚠️ Stock faible ({item.quantityAvailable} portions)
                        </span>
                      ) : (
                        <span className="text-red-500 text-sm font-medium">
                          ✗ Rupture de stock
                        </span>
                      )}
                    </div>

                    {/* Price and Button */}
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-[#FF6B35]">
                        {formatCurrency(item.price)}
                      </span>
                      <button
                        onClick={() => handleAddToCart(item)}
                        disabled={item.quantityAvailable === 0}
                        className="px-6 py-3 bg-gradient-to-r from-[#FF6B35] to-orange-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-[#FF6B35]/50 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      >
                        {item.quantityAvailable === 0 ? 'Indisponible' : 'Ajouter au panier'}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Call to Action */}
        {!loading && filteredItems.length > 0 && (
          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/checkout')}
              className="px-8 py-4 bg-gradient-to-r from-[#FF6B35] to-orange-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-[#FF6B35]/50 hover:scale-105 transition-all duration-300"
            >
              Commander maintenant
            </button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
