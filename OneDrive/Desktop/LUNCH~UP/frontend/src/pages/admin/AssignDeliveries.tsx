import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  Truck,
  CheckSquare,
  Square,
  User,
  MapPin,
  Phone,
  DollarSign,
  Download,
  RefreshCw,
  Package
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService } from '../../services/adminService';
import { formatCurrency } from '../../utils/formatters';

interface Order {
  _id: string;
  order_number: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
  };
  delivery_address: string;
  total: number;
  payment_method: string;
  status: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  createdAt: string;
}

interface DeliveryDriver {
  _id: string;
  name: string;
  phone: string;
  zones: string[];
  vehicleType: 'moto' | 'vélo' | 'voiture';
  isActive: boolean;
  stats: {
    totalDeliveries: number;
    todayDeliveries: number;
    successRate: number;
  };
}

export default function AssignDeliveries() {
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<DeliveryDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<string>('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
    } else {
      loadData();
    }
  }, [token, navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersRes, driversRes] = await Promise.all([
        adminService.getOrders({ status: 'processing' }),
        adminService.getDrivers()
      ]);

      // Filter orders that are ready for delivery (confirmed or processing)
      const readyOrders = ordersRes.filter((order: Order) =>
        ['confirmed', 'processing'].includes(order.status)
      );

      setOrders(readyOrders);
      setDrivers(driversRes.filter((driver: DeliveryDriver) => driver.isActive));
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderSelect = (orderId: string) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map(order => order._id));
    }
  };

  const handleAssign = async () => {
    if (!selectedDriver || selectedOrders.length === 0) {
      toast.error('Veuillez sélectionner un livreur et au moins une commande');
      return;
    }

    try {
      setAssigning(true);
      await adminService.assignDeliveries(selectedDriver, selectedOrders);
      toast.success(`${selectedOrders.length} commande(s) assignée(s) avec succès`);

      // Reset selections
      setSelectedOrders([]);
      setSelectedDriver('');

      // Reload data
      loadData();
    } catch (error) {
      console.error('Error assigning deliveries:', error);
      toast.error('Erreur lors de l\'assignation');
    } finally {
      setAssigning(false);
    }
  };

  const handleDownloadPDF = async (driverId: string) => {
    try {
      const response = await adminService.downloadDeliverySheet(driverId);
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `feuille-route-${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Feuille de route téléchargée');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Erreur lors du téléchargement');
    }
  };

  const getCompatibleDrivers = (order: Order) => {
    // This would ideally use geolocation, but for now we'll show all active drivers
    return drivers;
  };

  if (!token) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Assigner les Livraisons</h1>
          <p className="text-[#A0A0A0] text-sm">Attribuez les commandes aux livreurs</p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 bg-[#34D399]/20 border border-[#34D399]/30 rounded-lg hover:bg-[#34D399]/30 transition"
        >
          <RefreshCw size={18} />
          Actualiser
        </button>
      </div>

      {/* Assignment Section */}
      {selectedOrders.length > 0 && (
        <div className="bg-[#1A1A1A] border border-[#34D399]/20 p-6 rounded-xl">
          <h2 className="text-xl font-bold text-white mb-4">Assigner les Commandes</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                Sélectionner un livreur
              </label>
              <select
                value={selectedDriver}
                onChange={(e) => setSelectedDriver(e.target.value)}
                className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#34D399]/20 rounded-lg text-white focus:border-[#34D399] focus:outline-none"
              >
                <option value="">Choisir un livreur...</option>
                {drivers.map((driver) => (
                  <option key={driver._id} value={driver._id}>
                    {driver.name} - {driver.vehicleType} ({driver.zones.join(', ')})
                  </option>
                ))}
