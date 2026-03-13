import { useEffect, useState } from 'react';
import VendorLayout from '../../components/layout/VendorLayout';
import { vendorService } from '../../services/vendorService';
import toast from 'react-hot-toast';

export default function Promotions() {
  const [codes, setCodes] = useState([]);
  const [form, setForm] = useState({ code: '', type: 'fixed', value: 0 });

  const load = async () => {
    try {
      const res = await vendorService.getPromotions();
      setCodes(res.promoCodes || []);
    } catch (err) {
      toast.error('Erreur chargement');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    try {
      await vendorService.createPromotion(form);
      toast.success('Créé');
      setForm({ code: '', type: 'fixed', value: 0 });
      load();
    } catch (err) {
      toast.error('Erreur');
    }
  };

  const remove = async (id) => {
    if (!confirm('Supprimer ?')) return;
    try {
      await vendorService.deletePromotion(id);
      toast.success('Supprimé');
      load();
    } catch { toast.error('Erreur'); }
  };

  return (
    <VendorLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Promotions</h1>
        <div className="bg-[#1A1A1A] p-4 rounded">
          <input placeholder="CODE" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} className="p-2 mr-2" />
          <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="p-2 mr-2">
            <option value="fixed">Montant fixe</option>
            <option value="percentage">Pourcentage</option>
          </select>
          <input type="number" value={form.value} onChange={e => setForm({ ...form, value: Number(e.target.value) })} className="p-2 mr-2" />
          <button onClick={save} className="px-3 py-2 bg-[#FF6B35] rounded">Créer</button>
        </div>

        <div>
          {codes.map(c => (
            <div key={c._id} className="bg-[#1A1A1A] p-3 rounded flex justify-between items-center">
              <div>
                <div className="font-bold">{c.code}</div>
                <div className="text-sm text-[#A0A0A0]">{c.type} - {c.value}</div>
              </div>
              <div>
                <button onClick={() => remove(c._id)} className="px-3 py-1 bg-red-600 rounded">Suppr</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </VendorLayout>
  );
}
