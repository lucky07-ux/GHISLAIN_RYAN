 import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { RefreshCw, ShoppingBag, DollarSign, TrendingUp, Star, Flame, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService } from '../../services/adminService';
import { vendorService } from '../../services/vendorService';
import VendorLayout from '../../components/layout/VendorLayout';
import { formatCurrency } from '../../utils/formatters';

interface Stats {
  revenueToday: number;
  revenueThisMonth: number;
  ordersToday: number;
  totalCustomers?: number;
}

interface PopularItem {
  _id: string;
  name: string;
  orderCount: number;
  revenue: number;
}

interface Review {
  _id: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function VendorDashboard() {
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const [popularItems, setPopularItems] = useState<PopularItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      const res = await adminService.getDashboardStats();
      setStats({
        revenueToday: res.stats.revenueToday || 0,
        revenueThisMonth: res.stats.revenueThisMonth || 0,
        ordersToday: res.stats.ordersToday || 0,
        totalCustomers: res.stats.totalCustomers || 0,
      });
    } catch {
      toast.error('Erreur chargement stats');
      setStats(null);
    }
  };

  const loadPopularItems = async () => {
    try {
      // Get menu items to show popular ones
      await vendorService.getPromotions();
      // For now, we'll just show the menu items as popular
      // In a real app, this would come from an analytics endpoint
      setPopularItems([]);
    } catch {
      // Silent fail for popular items
    }
  };

  const loadReviews = async () => {
    try {
      // For now, we'll show empty reviews
      // In a real app, this would come from a reviews endpoint
      setReviews([]);
    } catch {
      // Silent fail for reviews
    }
  };

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([loadStats(), loadPopularItems(), loadReviews()]);
    setLoading(false);
  };

  useEffect(() => {
    if (!token) {
      navigate('/vendor/login');
    } else {
      loadStats();
      loadPopularItems();
      loadReviews();
    }
  }, [token, navigate]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            className={star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'}
          />
        ))}
      </div>
    );
  };

  if (!token) return null;

  return (
    <VendorLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard Vendeur</h1>
            <p className="text-[#A0A0A0] text-sm">Vue d'ensemble de votre activité</p>
          </div>
          <button
            onClick={loadAll}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-[#34D399]/20 border border-[#34D399]/30 rounded-lg hover:bg-[#34D399]/30 transition disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Actualiser
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-[#A0A0A0]">Chargement des statistiques...</p>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-[#1A1A1A] border border-[#34D399]/20 p-6 rounded-xl">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-[#A0A0A0]">Commandes aujourd'hui</h3>
                  <ShoppingBag className="text-orange-500" size={20} />
                </div>
                <p className="text-3xl font-bold text-white">{stats?.ordersToday || 0}</p>
              </div>

              <div className="bg-[#1A1A1A] border border-[#34D399]/20 p-6 rounded-xl">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-[#A0A0A0]">Revenus aujourd'hui</h3>
                  <DollarSign className="text-green-500" size={20} />
                </div>
                <p className="text-3xl font-bold text-white">{formatCurrency(stats?.revenueToday || 0)}</p>
              </div>

              <div className="bg-[#1A1A1A] border border-[#34D399]/20 p-6 rounded-xl">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-[#A0A0A0]">Revenus ce mois</h3>
                  <TrendingUp className="text-blue-500" size={20} />
                </div>
                <p className="text-3xl font-bold text-white">{formatCurrency(stats?.revenueThisMonth || 0)}</p>
              </div>

              <div className="bg-[#1A1A1A] border border-[#34D399]/20 p-6 rounded-xl">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-[#A0A0A0]">Clients totals</h3>
                  <Users className="text-purple-500" size={20} />
                </div>
                <p className="text-3xl font-bold text-white">{stats?.totalCustomers || 0}</p>
              </div>
            </div>

            {/* Popular Items and Reviews */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Popular Menu Items */}
              <div className="bg-[#1A1A1A] border border-[#34D399]/20 p-6 rounded-xl">
                <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                  <Flame className="text-orange-500" size={20} />
                  Plats populaires
                </h2>
                {popularItems.length > 0 ? (
                  <div className="space-y-4">
                    {popularItems.slice(0, 5).map((item, index) => (
                      <div key={item._id} className="flex items-center justify-between p-3 bg-[#0A0A0A] rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold text-[#FF6B35]">{index + 1}</span>
                          <div>
                            <p className="text-white font-medium">{item.name}</p>
                            <p className="text-[#A0A0A0] text-sm">{item.orderCount} commandes</p>
                          </div>
                        </div>
                        <p className="text-green-500 font-bold">{formatCurrency(item.revenue)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-[#A0A0A0]">
                    <Flame size={32} className="mx-auto mb-2 opacity-50" />
                    <p>Aucune donnée de popularité disponible</p>
                    <p className="text-sm">Les plats populaires apparaîtront ici</p>
                  </div>
                )}
              </div>

              {/* Customer Reviews */}
              <div className="bg-[#1A1A1A] border border-[#34D399]/20 p-6 rounded-xl">
                <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                  <Star className="text-yellow-500" size={20} />
                  Avis clients
                </h2>
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.slice(0, 5).map((review) => (
                      <div key={review._id} className="p-4 bg-[#0A0A0A] rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium">{review.customerName}</span>
                          {renderStars(review.rating)}
                        </div>
                        <p className="text-[#A0A0A0] text-sm">{review.comment}</p>
                        <p className="text-[#666666] text-xs mt-2">
                          {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-[#A0A0A0]">
                    <Star size={32} className="mx-auto mb-2 opacity-50" />
                    <p>Aucun avis disponible</p>
                    <p className="text-sm">Les avis clients apparaîtront ici</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </VendorLayout>
  );
}
