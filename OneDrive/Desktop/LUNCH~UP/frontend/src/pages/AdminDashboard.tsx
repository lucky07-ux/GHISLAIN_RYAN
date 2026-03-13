import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  BarChart3,
  ShoppingBag,
  Users,
  MessageSquare,
  TrendingUp,
  DollarSign,
  Package,
  Star,
  RefreshCw,
  Gift,
  Store
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService } from '../services/adminService';
import { formatCurrency } from '../utils/formatters';

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  thisMonthRevenue: number;
  avgOrderValue: number;
  totalCustomers: number;
  pendingOrders: number;
  totalReviews: number;
  avgRating: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
    } else {
      loadDashboardData();
    }
  }, [token, navigate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const statsRes = await adminService.getDashboardStats().catch(() => null);
      if (statsRes) {
        setStats(statsRes);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard LunchUp</h1>
          <p className="text-[#A0A0A0] text-sm">Vue d'ensemble de votre activité</p>
        </div>
        <button
          onClick={loadDashboardData}
          className="flex items-center gap-2 px-4 py-2 bg-[#34D399]/20 border border-[#34D399]/30 rounded-lg hover:bg-[#34D399]/30 transition"
        >
          <RefreshCw size={18} />
          Actualiser
        </button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          onClick={() => navigate('/admin/orders')}
          className="bg-blue-600/20 border border-blue-500/30 p-6 rounded-xl hover:border-blue-500/50 transition cursor-pointer group"
        >
          <ShoppingBag className="text-blue-500 mb-3 group-hover:scale-110 transition" size={32} />
          <h3 className="font-bold text-lg mb-1">Commandes</h3>
          <p className="text-sm text-[#A0A0A0]">Gérer les commandes</p>
        </div>

        <div
          onClick={() => navigate('/admin/menu')}
          className="bg-green-600/20 border border-green-500/30 p-6 rounded-xl hover:border-green-500/50 transition cursor-pointer group"
        >
          <Package className="text-green-500 mb-3 group-hover:scale-110 transition" size={32} />
          <h3 className="font-bold text-lg mb-1">Menu</h3>
          <p className="text-sm text-[#A0A0A0]">Gérer le menu</p>
        </div>

        <div
          onClick={() => navigate('/admin/customers')}
          className="bg-orange-600/20 border border-orange-500/30 p-6 rounded-xl hover:border-orange-500/50 transition cursor-pointer group"
        >
          <Users className="text-orange-500 mb-3 group-hover:scale-110 transition" size={32} />
          <h3 className="font-bold text-lg mb-1">Clients</h3>
          <p className="text-sm text-[#A0A0A0]">Base clients</p>
        </div>

        <div
          onClick={() => navigate('/admin/reviews')}
          className="bg-purple-600/20 border border-purple-500/30 p-6 rounded-xl hover:border-purple-500/50 transition cursor-pointer group"
        >
          <MessageSquare className="text-purple-500 mb-3 group-hover:scale-110 transition" size={32} />
          <h3 className="font-bold text-lg mb-1">Avis</h3>
          <p className="text-sm text-[#A0A0A0]">Communauté</p>
        </div>

        <div
          onClick={() => navigate('/admin/vendors')}
          className="bg-indigo-600/20 border border-indigo-500/30 p-6 rounded-xl hover:border-indigo-500/50 transition cursor-pointer group"
        >
          <Store className="text-indigo-500 mb-3 group-hover:scale-110 transition" size={32} />
          <h3 className="font-bold text-lg mb-1">Vendeurs</h3>
          <p className="text-sm text-[#A0A0A0]">Gérer vendeurs</p>
        </div>

        <div
          onClick={() => navigate('/admin/loyalty')}
          className="bg-pink-600/20 border border-pink-500/30 p-6 rounded-xl hover:border-pink-500/50 transition cursor-pointer group"
        >
          <Gift className="text-pink-500 mb-3 group-hover:scale-110 transition" size={32} />
          <h3 className="font-bold text-lg mb-1">Fidélité</h3>
          <p className="text-sm text-[#A0A0A0]">Codes & Cashback</p>
        </div>
      </div>

      {/* Stats Overview */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-[#A0A0A0]">Chargement des statistiques...</p>
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#1A1A1A] border border-[#34D399]/20 p-6 rounded-xl">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-[#A0A0A0]">Total Revenus</h3>
              <DollarSign className="text-green-500" size={20} />
            </div>
            <p className="text-3xl font-bold text-white">{formatCurrency(stats.totalRevenue || 0)}</p>
            <p className="text-sm text-[#A0A0A0] mt-2">Revenus totaux</p>
          </div>

          <div className="bg-[#1A1A1A] border border-[#34D399]/20 p-6 rounded-xl">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-[#A0A0A0]">Ce mois</h3>
              <TrendingUp className="text-blue-500" size={20} />
            </div>
            <p className="text-3xl font-bold text-white">{formatCurrency(stats.thisMonthRevenue || 0)}</p>
            <p className="text-sm text-[#A0A0A0] mt-2">Revenus ce mois</p>
          </div>

          <div className="bg-[#1A1A1A] border border-[#34D399]/20 p-6 rounded-xl">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-[#A0A0A0]">Commandes</h3>
              <ShoppingBag className="text-orange-500" size={20} />
            </div>
            <p className="text-3xl font-bold text-white">{stats.totalOrders || 0}</p>
            <p className="text-sm text-[#A0A0A0] mt-2">
              {stats.pendingOrders || 0} en attente
            </p>
          </div>

          <div className="bg-[#1A1A1A] border border-[#34D399]/20 p-6 rounded-xl">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-[#A0A0A0]">Note Moyenne</h3>
              <Star className="text-yellow-500" size={20} />
            </div>
            <p className="text-3xl font-bold text-white">
              {stats.avgRating ? `${stats.avgRating.toFixed(1)}/5` : 'N/A'}
            </p>
            <p className="text-sm text-[#A0A0A0] mt-2">
              {stats.totalReviews || 0} avis
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-[#1A1A1A] border border-[#34D399]/20 p-8 rounded-xl text-center">
          <BarChart3 className="mx-auto text-[#A0A0A0] mb-4" size={48} />
          <p className="text-[#A0A0A0]">Impossible de charger les statistiques</p>
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-[#1A1A1A] border border-[#34D399]/20 p-6 rounded-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Commandes Récentes</h2>
            <button
              onClick={() => navigate('/admin/orders')}
              className="text-[#34D399] hover:text-[#34D399]/80 text-sm font-medium"
            >
              Voir tout →
            </button>
          </div>
          <div className="text-center text-[#A0A0A0] py-8">
            <ShoppingBag size={48} className="mx-auto mb-4 opacity-50" />
            <p>Aucune commande récente</p>
            <p className="text-sm mt-2">Les nouvelles commandes apparaîtront ici</p>
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="bg-[#1A1A1A] border border-[#34D399]/20 p-6 rounded-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Avis Récents</h2>
            <button
              onClick={() => navigate('/admin/reviews')}
              className="text-[#34D399] hover:text-[#34D399]/80 text-sm font-medium"
            >
              Voir tout →
            </button>
          </div>
          <div className="text-center text-[#A0A0A0] py-8">
            <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
            <p>Aucun avis récent</p>
            <p className="text-sm mt-2">Les nouveaux avis apparaîtront ici</p>
          </div>
        </div>
      </div>
    </div>
  );
}
