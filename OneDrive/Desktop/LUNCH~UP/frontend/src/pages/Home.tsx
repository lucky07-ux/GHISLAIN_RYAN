import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Truck, Utensils, DollarSign, Leaf } from 'lucide-react';
import toast from 'react-hot-toast';
import MainLayout from '../components/layout/MainLayout';
import { menuService } from '../services/menuService';
import { useCartStore } from '../store/cartstore';
import { formatCurrency } from '../utils/formatters';
import flyer from '../assets/flyer/lunchup-flyer.jpg';

interface MenuItem {
  _id: string;
  name: string;
  price: number;
  description?: string;
  dayOfWeek: string;
  quantityAvailable: number;
}

export default function Home() {
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);
  const [featuredItems, setFeaturedItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMenu = async () => {
      try {
        const response = await menuService.getCurrentMenu();
        setFeaturedItems(response.menuItems.slice(0, 3));
      } catch (error) {
        console.error('Error loading menu:', error);
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

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Délicieux repas
              <br />
              <span className="bg-gradient-to-r from-[#FF6B35] to-[#34D399] bg-clip-text text-transparent">
                livrés jusqu'à vous
              </span>
            </h1>
            <p className="text-xl text-[#A0A0A0] mb-8">
              Cuisine camerounaise faite maison. Commandez maintenant et dégustez l'authenticité.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button
                onClick={() => navigate('/menu')}
                className="px-8 py-3 bg-gradient-to-r from-[#FF6B35] to-orange-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-[#FF6B35]/50 transition"
              >
                Voir le menu
              </button>
              <button
                onClick={() => {
                  const phone = '+237691710289';
                  window.open(`https://wa.me/${phone}?text=Bonjour%20LunchUp`, '_blank');
                }}
                className="px-8 py-3 border-2 border-[#34D399] text-[#34D399] font-bold rounded-lg hover:bg-[#34D399]/10 transition"
              >
                Nous contacter
              </button>
            </div>

            {/* Info */}
            <div className="space-y-2">
              <p className="text-[#D1D5DB]">
                ⏰ <strong>Horaires:</strong> Lundi - Vendredi, 8H - 15H
              </p>
              <p className="text-[#D1D5DB]">
                📞 <strong>Téléphone:</strong> +237 6 91 71 02 89
              </p>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <img src={flyer} alt="LunchUp Flyer" className="aspect-square rounded-xl object-cover shadow-lg" />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="mb-20">
        <h2 className="text-4xl font-bold text-white mb-12 text-center">Nos Avantages</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Truck, title: 'Livraison Rapide', desc: 'Sur le campus en moins d\'1h' },
            { icon: Utensils, title: 'Cuisine Authentique', desc: 'Recettes traditionnelles camerounaises' },
            { icon: DollarSign, title: 'Prix Étudiant', desc: 'À partir de 1500 FCFA' },
            { icon: Leaf, title: 'Ingrédients Frais', desc: 'Acheté chaque matin' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-[#1A1A1A] border border-[#34D399]/20 p-6 rounded-xl hover:border-[#34D399]/50 transition"
            >
              <item.icon size={40} className="text-[#FF6B35] mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
              <p className="text-[#A0A0A0]">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Menu */}
      <section className="mb-20">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-4xl font-bold text-white">Menu de cette semaine</h2>
          <button
            onClick={() => navigate('/menu')}
            className="text-[#FF6B35] hover:text-orange-600 font-bold transition"
          >
            Voir tout →
          </button>
        </div>

        {loading ? (
          <div className="text-center text-[#A0A0A0] py-12">
            Chargement...
          </div>
        ) : featuredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredItems.map((item) => (
              <div
                key={item._id}
                className="bg-[#1A1A1A] border border-[#34D399]/20 rounded-xl overflow-hidden hover:border-[#34D399]/50 transition group"
              >
                <div className="aspect-video bg-gradient-to-br from-[#FF6B35]/20 to-[#34D399]/20 flex items-center justify-center relative">
                  <Utensils size={60} className="text-[#FF6B35]" />
                  <div className="absolute top-2 right-2 bg-[#34D399] text-[#0A0A0A] px-3 py-1 rounded-full text-sm font-bold">
                    {item.dayOfWeek}
                  </div>
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
                      onClick={() => handleAddToCart(item)}
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
          <div className="text-center text-[#A0A0A0] py-12">
            <Utensils size={80} className="mx-auto text-[#FF6B35] mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Menu en préparation</h3>
            <p className="text-[#A0A0A0] mb-6">
              Notre menu de la semaine arrive bientôt ! Découvrez nos délicieux plats camerounais.
            </p>
            <button
              onClick={() => navigate('/menu')}
              className="px-6 py-3 bg-[#FF6B35] text-white rounded-lg hover:bg-orange-600 transition font-bold"
            >
              Voir tous les plats
            </button>
          </div>
        )}
      </section>

      {/* Testimonials Section */}
      <section className="mb-20">
        <h2 className="text-4xl font-bold text-white mb-12 text-center">Ce que nos clients disent</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'Jean K.', rating: 5, text: 'Meilleur rapport qualité-prix sur le campus!' },
            { name: 'Marie D.', rating: 5, text: 'Livraison super rapide et repas savoureux' },
            { name: 'Pierre Y.', rating: 5, text: 'J\'ai enfin trouvé une vraie cuisine camerounaise' },
          ].map((review, idx) => (
            <div key={idx} className="bg-[#1A1A1A] border border-[#34D399]/20 p-6 rounded-xl">
              <div className="flex gap-1 mb-4">
                {Array(review.rating)
                  .fill(0)
                  .map((_, i) => (
                    <Star key={i} size={18} className="fill-[#FF6B35] text-[#FF6B35]" />
                  ))}
              </div>
              <p className="text-[#D1D5DB] mb-4 italic">"{review.text}"</p>
              <p className="text-[#A0A0A0] font-bold">- {review.name}</p>
            </div>
          ))}
        </div>
      </section>
    </MainLayout>
  );
}
