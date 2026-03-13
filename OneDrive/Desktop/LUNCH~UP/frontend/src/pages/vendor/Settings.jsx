import VendorLayout from '../../components/layout/VendorLayout';
import { useEffect, useState } from 'react';
import { vendorService } from '../../services/vendorService';
import toast from 'react-hot-toast';

export default function Settings() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '' });

  const load = async () => {
    try {
      const res = await fetch('/api/vendor/restaurant', { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` } });
      const data = await res.json();
      setProfile(data.vendor);
      setForm({ name: data.vendor?.name || '', phone: data.vendor?.phone || '', email: data.vendor?.email || '' });
    } catch { toast.error('Erreur'); }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    try {
      const res = await fetch('/api/vendor/restaurant', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify(form) });
      const data = await res.json();
      if (data.vendor) toast.success('Profil mis à jour');
    } catch { toast.error('Erreur'); }
  };

  return (
    <VendorLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Settings</h1>
        <div className="bg-[#1A1A1A] p-4 rounded">
          <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="p-2 block w-full mb-2" />
          <input placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="p-2 block w-full mb-2" />
          <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="p-2 block w-full mb-2" />
          <button onClick={save} className="px-4 py-2 bg-[#FF6B35] rounded">Save</button>
        </div>
      </div>
    </VendorLayout>
  );
}
