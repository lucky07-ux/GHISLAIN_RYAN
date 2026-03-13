import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Shield, AlertCircle, RefreshCw, Check, X, Clock, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService } from '../../services/adminService';

interface Vendor {
  _id: string;
  name: string;
  email: string;
  phone: string;
  packType: 'standard' | 'boost' | 'premium';
  isActive: boolean;
  subscriptionEndDate?: string;
  createdAt: string;
}

export default function AdminVendors() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showRenewForm, setShowRenewForm] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    packType: 'standard' as const,
  });
  const [renewData, setRenewData] = useState({
    durationDays: 30,
    packType: 'standard' as const,
  });

  const loadVendors = async () => {
    try {
      setLoading(true);
      const res = await adminService.getVendors();
      setVendors(res.vendors || []);
    } catch (err) {
      toast.error('Erreur chargement vendeurs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendors();
  }, []);

  const handleAdd = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error('Tous les champs sont requis');
      return;
    }

    try {
      if (editingId) {
        await adminService.updateVendor(editingId, formData);
        toast.success('Vendeur mis à jour');
      } else {
        await adminService.createVendor(formData);
        toast.success('Vendeur créé');
      }
      setFormData({ name: '', email: '', phone: '', packType: 'standard' });
      setEditingId(null);
      setShowForm(false);
      await loadVendors();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erreur');
    }
  };

  const handleEdit = (vendor: Vendor) => {
    setFormData({
      name: vendor.name,
      email: vendor.email,
      phone: vendor.phone,
      packType: vendor.packType,
    });
    setEditingId(vendor._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer ce vendeur ?')) return;

    try {
      await adminService.deleteVendor(id);
      toast.success('Vendeur supprimé');
      await loadVendors();
    } catch {
      toast.error('Erreur suppression');
    }
  };

  const handleToggleStatus = async (vendor: Vendor) => {
    try {
      await adminService.toggleVendorStatus(vendor._id);
      toast.success(`Vendeur ${vendor.isActive ? 'désactivé' : 'activé'}`);
      await loadVendors();
    } catch {
      toast.error('Erreur mise à jour statut');
    }
  };

  const handleRenewSubscription = async (vendorId: string, vendor: Vendor) => {
    try {
      await adminService.renewVendorSubscription(vendorId, renewData);
      toast.success('Abonnement renouvelé');
      setShowRenewForm(null);
      await loadVendors();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erreur renouvellement');
    }
  };

  const getDaysRemaining = (endDate?: string): number | null => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    const days = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const isSubscriptionActive = (endDate?: string): boolean => {
    if (!endDate) return true;
    return new Date(endDate) > new Date();
  };

  const packColors: Record<string, string> = {
    standard: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    boost: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    premium: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestion Vendeurs</h1>
          <p className="text-[#A0A0A0] text-sm">Administrez les vendeurs de la plateforme</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadVendors}
            className="flex items-center gap-2 px-4 py-2 bg-[#34D399]/20 border border-[#34D399]/30 rounded-lg hover:bg-[#34D399]/30 transition"
          >
            <RefreshCw size={18} />
            Actualiser
          </button>
          <button
            onClick={() => {
              setEditingId(null);
              setFormData({ name: '', email: '', phone: '', packType: 'standard' });
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#FF6B35]/20 border border-[#FF6B35]/30 rounded-lg hover:bg-[#FF6B35]/30 transition text-[#FF6B35]"
          >
            <Plus size={18} />
            Ajouter Vendeur
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-[#1A1A1A] border border-[#34D399]/20 p-6 rounded-xl">
          <h2 className="text-xl font-bold text-white mb-4">
            {editingId ? 'Modifier Vendeur' : 'Ajouter Vendeur'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Nom"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="px-4 py-2 bg-[#0A0A0A] border border-[#34D399]/30 rounded-lg text-white focus:outline-none focus:border-[#FF6B35]"
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="px-4 py-2 bg-[#0A0A0A] border border-[#34D399]/30 rounded-lg text-white focus:outline-none focus:border-[#FF6B35]"
            />
            <input
              type="tel"
              placeholder="Téléphone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="px-4 py-2 bg-[#0A0A0A] border border-[#34D399]/30 rounded-lg text-white focus:outline-none focus:border-[#FF6B35]"
            />
            <select
              value={formData.packType}
              onChange={(e) => setFormData({ ...formData, packType: e.target.value as any })}
              className="px-4 py-2 bg-[#0A0A0A] border border-[#34D399]/30 rounded-lg text-white focus:outline-none focus:border-[#FF6B35]"
            >
              <option value="standard">Standard</option>
              <option value="boost">Boost</option>
              <option value="premium">Premium</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleAdd}
              className="px-6 py-2 bg-[#34D399]/20 border border-[#34D399]/30 rounded-lg hover:bg-[#34D399]/30 transition text-[#34D399]"
            >
              {editingId ? 'Mettre à jour' : 'Créer'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-6 py-2 bg-transparent border border-[#A0A0A0]/30 rounded-lg hover:bg-[#A0A0A0]/10 transition text-[#A0A0A0]"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-[#A0A0A0]">Chargement...</p>
        </div>
      ) : vendors.length === 0 ? (
        <div className="bg-[#1A1A1A] border border-[#34D399]/20 p-8 rounded-xl text-center">
          <AlertCircle className="mx-auto text-[#A0A0A0] mb-4" size={48} />
          <p className="text-[#A0A0A0]">Aucun vendeur disponible</p>
        </div>
      ) : (
        <div className="bg-[#1A1A1A] border border-[#34D399]/20 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0A0A0A] border-b border-[#34D399]/20">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#A0A0A0]">Nom</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#A0A0A0]">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#A0A0A0]">Pack</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#A0A0A0]">Abonnement</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#A0A0A0]">Statut</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#A0A0A0]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#34D399]/10">
                {vendors.map((vendor) => {
                  const daysRemaining = getDaysRemaining(vendor.subscriptionEndDate);
                  const subActive = isSubscriptionActive(vendor.subscriptionEndDate);
                  return (
                    <tr key={vendor._id} className="hover:bg-[#0A0A0A]/50 transition">
                      <td className="px-6 py-4 text-white font-medium">{vendor.name}</td>
                      <td className="px-6 py-4 text-[#D1D5DB] text-sm">{vendor.email}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${packColors[vendor.packType]}`}>
                            {vendor.packType.toUpperCase()}
                          </span>
                          {vendor.packType === 'premium' && <span className="text-lg">👑</span>}
                          {vendor.packType === 'boost' && <Zap size={14} className="text-orange-400" />}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${
                            subActive
                              ? 'bg-green-500/20 text-green-400 border-green-500/30'
                              : 'bg-red-500/20 text-red-400 border-red-500/30'
                          }`}>
                            {subActive ? '✓ Actif' : '✗ Expiré'}
                          </span>
                          {daysRemaining && (
                            <span className="text-xs text-[#A0A0A0] flex items-center gap-1">
                              <Clock size={12} />
                              {daysRemaining}j
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleStatus(vendor)}
                          className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border transition ${
                            vendor.isActive
                              ? 'bg-green-500/20 text-green-400 border-green-500/30'
                              : 'bg-red-500/20 text-red-400 border-red-500/30'
                          }`}
                        >
                          {vendor.isActive ? (
                            <>
                              <Check size={14} />
                              Actif
                            </>
                          ) : (
                            <>
                              <X size={14} />
                              Inactif
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {(showRenewForm === vendor._id) ? (
                            <div className="absolute bg-[#1A1A1A] border border-[#34D399]/20 p-4 rounded-lg z-10 min-w-80 -ml-20">
                              <h3 className="text-white font-bold mb-3">Renouveler abonnement</h3>
                              <input
                                type="number"
                                placeholder="Jours"
                                value={renewData.durationDays}
                                onChange={(e) => setRenewData({ ...renewData, durationDays: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#34D399]/30 rounded-lg text-white mb-3 text-sm"
                              />
                              <select
                                value={renewData.packType}
                                onChange={(e) => setRenewData({ ...renewData, packType: e.target.value as any })}
                                className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#34D399]/30 rounded-lg text-white mb-3 text-sm"
                              >
                                <option value="standard">Standard</option>
                                <option value="boost">Boost</option>
                                <option value="premium">Premium</option>
                              </select>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleRenewSubscription(vendor._id, vendor)}
                                  className="flex-1 px-3 py-2 bg-[#34D399]/20 border border-[#34D399]/30 rounded-lg text-[#34D399] text-xs font-medium hover:bg-[#34D399]/30 transition"
                                >
                                  Renouveler
                                </button>
                                <button
                                  onClick={() => setShowRenewForm(null)}
                                  className="flex-1 px-3 py-2 bg-transparent border border-[#A0A0A0]/30 rounded-lg text-[#A0A0A0] text-xs font-medium hover:bg-[#A0A0A0]/10 transition"
                                >
                                  Annuler
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setRenewData({ durationDays: 30, packType: vendor.packType });
                                  setShowRenewForm(vendor._id);
                                }}
                                className="p-2 bg-blue-500/20 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition text-blue-400 text-xs"
                                title="Renouveler abonnement"
                              >
                                <Clock size={16} />
                              </button>
                              <button
                                onClick={() => handleEdit(vendor)}
                                className="p-2 bg-green-500/20 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition text-green-400"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(vendor._id)}
                                className="p-2 bg-red-500/20 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition text-red-400"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
