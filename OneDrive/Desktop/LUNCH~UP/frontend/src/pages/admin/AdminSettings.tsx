import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, RefreshCw } from 'lucide-react';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';

interface SettingsData {
  businessInfo?: {
    name: string;
    phone: string;
    email: string;
    address: string;
    hours: string;
  };
  pricing?: {
    deliveryFee: number;
    freeDeliveryThreshold?: number;
  };
  payment?: {
    orangeMoneyNumber: string;
    mtnMomoNumber: string;
  };
  notifications?: {
    emailEnabled: boolean;
    emailAddress?: string;
    smsEnabled: boolean;
  };
}

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<SettingsData>({
    businessInfo: {
      name: 'LunchUp',
      phone: '+237 6 91 71 02 89',
      email: 'contact@lunchup.cm',
      address: 'Douala, Cameroun',
      hours: 'Lundi-Vendredi 8H-15H',
    },
    pricing: { deliveryFee: 1000, freeDeliveryThreshold: 5000 },
    payment: { orangeMoneyNumber: '', mtnMomoNumber: '' },
    notifications: { emailEnabled: true, emailAddress: '', smsEnabled: false },
  });

  const load = async () => {
    try {
      setLoading(true);
      const res = await adminService.getSettings();
      const settings = res?.settings ?? res;
      if (settings && (settings.businessInfo || settings.pricing)) {
        setData((prev) => ({ ...prev, ...settings }));
      }
    } catch {
      // garder les valeurs par défaut
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      await adminService.updateSettings(data);
      toast.success('Paramètres enregistrés');
    } catch {
      toast.error('Erreur enregistrement');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-[#A0A0A0]">Chargement...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Paramètres</h1>
          <p className="text-[#A0A0A0]">Informations entreprise, tarification, paiement</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={load}
            className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] border border-[#34D399]/30 rounded-lg hover:bg-[#34D399]/10 transition"
          >
            <RefreshCw size={18} />
            Actualiser
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#FF6B35] to-orange-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-[#FF6B35]/50 transition disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>

      <div className="space-y-8">
        <div className="bg-[#1A1A1A] border border-[#34D399]/20 p-6 rounded-xl">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <SettingsIcon size={20} />
            Informations entreprise
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#A0A0A0] text-sm mb-1">Nom commercial</label>
              <input
                value={data.businessInfo?.name || ''}
                onChange={(e) =>
                  setData({
                    ...data,
                    businessInfo: { ...data.businessInfo!, name: e.target.value },
                  })
                }
                className="w-full px-4 py-2 bg-[#0A0A0A] border border-[#34D399]/30 rounded-lg text-white focus:outline-none focus:border-[#FF6B35]"
              />
            </div>
            <div>
              <label className="block text-[#A0A0A0] text-sm mb-1">Téléphone</label>
              <input
                value={data.businessInfo?.phone || ''}
                onChange={(e) =>
                  setData({
                    ...data,
                    businessInfo: { ...data.businessInfo!, phone: e.target.value },
                  })
                }
                className="w-full px-4 py-2 bg-[#0A0A0A] border border-[#34D399]/30 rounded-lg text-white focus:outline-none focus:border-[#FF6B35]"
              />
            </div>
            <div>
              <label className="block text-[#A0A0A0] text-sm mb-1">Email</label>
              <input
                type="email"
                value={data.businessInfo?.email || ''}
                onChange={(e) =>
                  setData({
                    ...data,
                    businessInfo: { ...data.businessInfo!, email: e.target.value },
                  })
                }
                className="w-full px-4 py-2 bg-[#0A0A0A] border border-[#34D399]/30 rounded-lg text-white focus:outline-none focus:border-[#FF6B35]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[#A0A0A0] text-sm mb-1">Adresse / Zone livraison</label>
              <input
                value={data.businessInfo?.address || ''}
                onChange={(e) =>
                  setData({
                    ...data,
                    businessInfo: { ...data.businessInfo!, address: e.target.value },
                  })
                }
                className="w-full px-4 py-2 bg-[#0A0A0A] border border-[#34D399]/30 rounded-lg text-white focus:outline-none focus:border-[#FF6B35]"
              />
            </div>
            <div>
              <label className="block text-[#A0A0A0] text-sm mb-1">Horaires</label>
              <input
                value={data.businessInfo?.hours || ''}
                onChange={(e) =>
                  setData({
                    ...data,
                    businessInfo: { ...data.businessInfo!, hours: e.target.value },
                  })
                }
                className="w-full px-4 py-2 bg-[#0A0A0A] border border-[#34D399]/30 rounded-lg text-white focus:outline-none focus:border-[#FF6B35]"
                placeholder="Lundi-Vendredi 8H-15H"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#1A1A1A] border border-[#34D399]/20 p-6 rounded-xl">
          <h2 className="text-lg font-bold text-white mb-4">Tarification</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#A0A0A0] text-sm mb-1">Frais de livraison (FCFA)</label>
              <input
                type="number"
                value={data.pricing?.deliveryFee ?? 1000}
                onChange={(e) =>
                  setData({
                    ...data,
                    pricing: { ...data.pricing!, deliveryFee: parseInt(e.target.value) || 0 },
                  })
                }
                className="w-full px-4 py-2 bg-[#0A0A0A] border border-[#34D399]/30 rounded-lg text-white focus:outline-none focus:border-[#FF6B35]"
              />
            </div>
            <div>
              <label className="block text-[#A0A0A0] text-sm mb-1">Seuil livraison gratuite (FCFA)</label>
              <input
                type="number"
                value={data.pricing?.freeDeliveryThreshold ?? ''}
                onChange={(e) =>
                  setData({
                    ...data,
                    pricing: { ...data.pricing!, freeDeliveryThreshold: parseInt(e.target.value) || undefined },
                  })
                }
                className="w-full px-4 py-2 bg-[#0A0A0A] border border-[#34D399]/30 rounded-lg text-white focus:outline-none focus:border-[#FF6B35]"
                placeholder="Optionnel"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#1A1A1A] border border-[#34D399]/20 p-6 rounded-xl">
          <h2 className="text-lg font-bold text-white mb-4">Paiement (numéros réception)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#A0A0A0] text-sm mb-1">Orange Money</label>
              <input
                value={data.payment?.orangeMoneyNumber || ''}
                onChange={(e) =>
                  setData({
                    ...data,
                    payment: { ...data.payment!, orangeMoneyNumber: e.target.value },
                  })
                }
                className="w-full px-4 py-2 bg-[#0A0A0A] border border-[#34D399]/30 rounded-lg text-white focus:outline-none focus:border-[#FF6B35]"
                placeholder="+237 6XX XX XX XX"
              />
            </div>
            <div>
              <label className="block text-[#A0A0A0] text-sm mb-1">MTN Mobile Money</label>
              <input
                value={data.payment?.mtnMomoNumber || ''}
                onChange={(e) =>
                  setData({
                    ...data,
                    payment: { ...data.payment!, mtnMomoNumber: e.target.value },
                  })
                }
                className="w-full px-4 py-2 bg-[#0A0A0A] border border-[#34D399]/30 rounded-lg text-white focus:outline-none focus:border-[#FF6B35]"
                placeholder="+237 6XX XX XX XX"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
