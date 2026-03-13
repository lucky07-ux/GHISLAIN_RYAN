import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import MainLayout from '../components/layout/MainLayout';
import { clientService } from '../services/clientService';

export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await clientService.getVendors();
        setVendors(res.vendors || []);
      } catch (err) {
        console.error('Error loading vendors', err);
        toast.error('Impossible de charger les vendeurs');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto py-12">
        <h1 className="text-4xl font-bold text-white mb-8">Nos Restaurateurs</h1>

        {loading ? (
          <div className="text-center text-[#A0A0A0]">Chargement...</div>
        ) : vendors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendors.map((v) => (
              <div
                key={v.id}
                className="bg-[#1A1A1A] border border-[#34D399]/20 p-6 rounded-xl hover:border-[#34D399]/50 transition cursor-pointer"
                onClick={() => navigate(`/vendors/${v.id}/menu`)}
              >
                <h3 className="text-xl font-bold text-white mb-2">{v.business_name}</h3>
                <p className="text-[#A0A0A0]">{v.owner_name}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-[#A0A0A0]">Aucun vendeur disponible</div>
        )}
      </div>
    </MainLayout>
  );
}
