 import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, AlertCircle, RefreshCw, Check, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService } from '../../services/adminService';
import { formatCurrency } from '../../utils/formatters';

interface PromoCode {
  _id: string;
  code: string;
  description?: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderValue: number;
  maxDiscount?: number;
  usageLimit?: number;
  usageCount: number;
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminLoyalty() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [cashbackPercentage, setCashbackPercentage] = useState(2);
  const [loading, setLoading] = useState(true);
  const [showPromoForm, setShowPromoForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    type: 'percentage' as const,
    value: 0,
    minOrderValue: 0,
    maxDiscount: undefined as number | undefined,
    usageLimit: undefined as number | undefined,
    expiresAt: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const codesRes = await adminService.getPromoCodes();
      setPromoCodes(codesRes.promoCodes || []);

      const loyaltyRes = await adminService.getLoyaltySettings();
      setCashbackPercentage(loyaltyRes.loyalty?.cashbackPercentage || 2);
    } catch (err) {
      toast.error('Erreur chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddPromo = async () => {
    if (!formData.code || formData.value === undefined || formData.value <= 0) {
      toast.error('Code et valeur requis');
      return;
    }

    try {
      const data = {
        code: formData.code.toUpperCase(),
        description: formData.description,
        type: formData.type,
        value: formData.value,
        minOrderValue: formData.minOrderValue,
        maxDiscount: formData.maxDiscount,
        usageLimit: formData.usageLimit,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : undefined,
      };

      if (editingId) {
        await adminService.updatePromoCode(editingId, data);
        toast.success('Code promo mis à jour');
      } else {
        await adminService.createPromoCode(data);
        toast.success('Code promo créé');
      }

      setFormData({
        code: '',
        description: '',
        type: 'percentage',
        value: 0,
        minOrderValue: 0,
        maxDiscount: undefined,
        usageLimit: undefined,
        expiresAt: '',
      });
      setEditingId(null);
      setShowPromoForm(false);
      await loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erreur');
    }
  };

  const handleEditPromo = (promo: PromoCode) => {
    setFormData({
      code: promo.code,
      description: promo.description || '',
      type: promo.type,
      value: promo.value,
      minOrderValue: promo.minOrderValue,
      maxDiscount: promo.maxDiscount,
      usageLimit: promo.usageLimit,
      expiresAt: promo.expiresAt ? new Date(promo.expiresAt).toISOString().split('T')[0] : '',
    });
    setEditingId(promo._id);
    setShowPromoForm(true);
  };

  const handleDeletePromo = async (id: string) => {
    if (!window.confirm('Supprimer ce code promo ?')) return;

    try {
      await adminService.deletePromoCode(id);
      toast.success('Code promo supprimé');
      await loadData();
    } catch {
      toast.error('Erreur suppression');
    }
  };

  const handleUpdateCashback = async () => {
    if (cashbackPercentage < 0 || cashbackPercentage > 100) {
      toast.error('Pourcentage invalide');
      return;
    }

    try {
      await adminService.updateCashbackPercentage(cashbackPercentage);
      toast.success('Paramètres de fidélité mis à jour');
    } catch {
      toast.error('Erreur mise à jour');
    }
  };

  return (
    <div className="space-y-8">
      {/* CASHBACK SETTINGS */}
      <div className="bg-[#1A1A1A] border border-[#34D399]/20 p-6 rounded-xl">
        <h2 className="text-xl font-bold text-white mb-4">Configuration Cashback</h2>
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm text-[#A0A0A0] mb-2">Pourcentage de cashback</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="100"
                value={cashbackPercentage}
                onChange={(e) => setCashbackPercentage(Math.max(0, Math.min(100, parseFloat(e.target.value))))}
                className="w-24 px-4 py-2 bg-[#0A0A0A] border border-[#34D399]/30 rounded-lg text-white focus:outline-none focus:border-[#FF6B35]"
              />
              <span className="text-[#A0A0A0]">%</span>
            </div>
          </div>
          <button
            onClick={handleUpdateCashback}
            className="px-6 py-2 bg-[#34D399]/20 border border-[#34D399]/30 rounded-lg hover:bg-[#34D399]/30 transition text-[#34D399]"
          >
            Enregistrer
          </button>
        </div>
      </div>

      {/* PROMO CODES HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestion Codes Promo</h1>
          <p className="text-[#A0A0A0] text-sm">Créez et gérez les codes promotionnels</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 bg-[#34D399]/20 border border-[#34D399]/30 rounded-lg hover:bg-[#34D399]/30 transition"
          >
            <RefreshCw size={18} />
            Actualiser
          </button>
          <button
            onClick={() => {
              setEditingId(null);
              setFormData({
                code: '',
                description: '',
                type: 'percentage',
                value: 0,
                minOrderValue: 0,
                maxDiscount: undefined,
                usageLimit: undefined,
                expiresAt: '',
              });
              setShowPromoForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#FF6B35]/20 border border-[#FF6B35]/30 rounded-lg hover:bg-[#FF6B35]/30 transition text-[#FF6B35]"
          >
            <Plus size={18} />
            Ajouter Code
          </button>
        </div>
      </div>

      {/* PROMO FORM */}
      {showPromoForm && (
        <div className="bg-[#1A1A1A] border border-[#34D399]/20 p-6 rounded-xl">
          <h2 className="text-xl font-bold text-white mb-4">
            {editingId ? 'Modifier Code Promo' : 'Créer Code Promo'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Code (ex: SUMMER20)"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="px-4 py-2 bg-[#0A0A0A] border border-[#34D399]/30 rounded-lg text-white focus:outline-none focus:border-[#FF6B35]"
            />
            <input
              type="text"
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="px-4 py-2 bg-[#0A0A0A] border border-[#34D399]/30 rounded-lg text-white focus:outline-none focus:border-[#FF6B35]"
            />

            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'percentage' | 'fixed' })}
              className="px-4 py-2 bg-[#0A0A0A] border border-[#34D399]/30 rounded-lg text-white focus:outline-none focus:border-[#FF6B35]"
            >
              <option value="percentage">Pourcentage (%)</option>
              <option value="fixed">Montant fixe (FCFA)</option>
            </select>

            <input
              type="number"
              placeholder="Valeur"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
              className="px-4 py-2 bg-[#0A0A0A] border border-[#34D399]/30 rounded-lg text-white focus:outline-none focus:border-[#FF6B35]"
            />

            <input
              type="number"
              placeholder="Montant minimum de commande"
              value={formData.minOrderValue}
              onChange={(e) => setFormData({ ...formData, minOrderValue: parseFloat(e.target.value) })}
              className="px-4 py-2 bg-[#0A0A0A] border border-[#34D399]/30 rounded-lg text-white focus:outline-none focus:border-[#FF6B35]"
            />

            <input
              type="number"
              placeholder="Réduction maximale (optionnel)"
              value={formData.maxDiscount || ''}
              onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value ? parseFloat(e.target.value) : undefined })}
              className="px-4 py-2 bg-[#0A0A0A] border border-[#34D399]/30 rounded-lg text-white focus:outline-none focus:border-[#FF6B35]"
            />

            <input
              type="number"
              placeholder="Limite d'utilisation (optionnel)"
              value={formData.usageLimit || ''}
              onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value ? parseInt(e.target.value) : undefined })}
              className="px-4 py-2 bg-[#0A0A0A] border border-[#34D399]/30 rounded-lg text-white focus:outline-none focus:border-[#FF6B35]"
            />

            <input
              type="date"
              value={formData.expiresAt}
              onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
              className="px-4 py-2 bg-[#0A0A0A] border border-[#34D399]/30 rounded-lg text-white focus:outline-none focus:border-[#FF6B35]"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleAddPromo}
              className="px-6 py-2 bg-[#34D399]/20 border border-[#34D399]/30 rounded-lg hover:bg-[#34D399]/30 transition text-[#34D399]"
            >
              {editingId ? 'Mettre à jour' : 'Créer'}
            </button>
            <button
              onClick={() => setShowPromoForm(false)}
              className="px-6 py-2 bg-transparent border border-[#A0A0A0]/30 rounded-lg hover:bg-[#A0A0A0]/10 transition text-[#A0A0A0]"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* PROMO TABLE */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-[#A0A0A0]">Chargement...</p>
        </div>
      ) : promoCodes.length === 0 ? (
        <div className="bg-[#1A1A1A] border border-[#34D399]/20 p-8 rounded-xl text-center">
          <AlertCircle className="mx-auto text-[#A0A0A0] mb-4" size={48} />
          <p className="text-[#A0A0A0]">Aucun code promo disponible</p>
        </div>
      ) : (
        <div className="bg-[#1A1A1A] border border-[#34D399]/20 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0A0A0A] border-b border-[#34D399]/20">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#A0A0A0]">Code</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#A0A0A0]">Type</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#A0A0A0]">Valeur</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#A0A0A0]">Utilisations</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#A0A0A0]">Expiration</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#A0A0A0]">Statut</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#A0A0A0]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#34D399]/10">
                {promoCodes.map((promo) => (
                  <tr key={promo._id} className="hover:bg-[#0A0A0A]/50 transition">
                    <td className="px-6 py-4 text-white font-bold">{promo.code}</td>
                    <td className="px-6 py-4">
                      <span className="text-[#34D399]">
                        {promo.type === 'percentage' ? '%' : 'FCFA'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white">
                      {promo.type === 'percentage' ? `${promo.value}%` : formatCurrency(promo.value)}
                    </td>
                    <td className="px-6 py-4 text-[#D1D5DB]">
                      {promo.usageCount}/{promo.usageLimit || '∞'}
                    </td>
                    <td className="px-6 py-4 text-[#D1D5DB] text-sm">
                      {promo.expiresAt ? new Date(promo.expiresAt).toLocaleDateString() : 'Sans limite'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${
                        promo.isActive
                          ? 'bg-green-500/20 text-green-400 border-green-500/30'
                          : 'bg-red-500/20 text-red-400 border-red-500/30'
                      }`}>
                        {promo.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditPromo(promo)}
                          className="p-2 bg-blue-500/20 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition text-blue-400"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeletePromo(promo._id)}
                          className="p-2 bg-red-500/20 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition text-red-400"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
