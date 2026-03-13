import { useEffect, useState } from 'react';
import VendorLayout from '../../components/layout/VendorLayout';
import { vendorService } from '../../services/vendorService';
import toast from 'react-hot-toast';

export default function Customers() {
  const [customers, setCustomers] = useState([]);

  const load = async () => {
    try {
      const res = await vendorService.getCustomers();
      setCustomers(res.customers || []);
    } catch { toast.error('Erreur'); }
  };

  useEffect(() => { load(); }, []);

  return (
    <VendorLayout>
      <div>
        <h1 className="text-2xl font-bold mb-4">Customers</h1>
        <div className="space-y-2">
          {customers.map(c => (
            <div key={c._id || c._id} className="bg-[#1A1A1A] p-3 rounded flex justify-between">
              <div>
                <div className="font-bold">{c.name || '—'}</div>
                <div className="text-sm text-[#A0A0A0]">{c._id}</div>
              </div>
              <div className="text-sm text-[#A0A0A0]">Orders: {c.count}</div>
            </div>
          ))}
        </div>
      </div>
    </VendorLayout>
  );
}
