import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import VendorLayout from '../../components/layout/VendorLayout';
import { menuService } from '../../services/menuService';

export default function MenuManagement() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', description: '', price: 0, category: '', available: true, image: null });
  const [editingId, setEditingId] = useState(null);

  const loadItems = async () => {
    try {
      setLoading(true);
      const res = await menuService.getCurrentMenu();
      setMenuItems(res.menuItems || []);
    } catch (err) {
      toast.error('Erreur chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const save = async () => {
    if (!form.name || form.price <= 0) return toast.error('Nom et prix requis');
    try {
      // Build payload; use FormData if image present
      let payload = form;
      if (form.image) {
        const fd = new FormData();
        fd.append('name', form.name);
        fd.append('description', form.description || '');
        fd.append('price', String(form.price));
        fd.append('category', form.category || '');
        fd.append('quantityAvailable', form.available ? '1' : '0');
        fd.append('image', form.image);
        payload = fd;
      } else {
        payload = {
          name: form.name,
          description: form.description,
          price: form.price,
          category: form.category,
          quantityAvailable: form.available ? 1 : 0,
        };
      }

      if (editingId) {
        await menuService.updateMenuItem(editingId, payload);
        toast.success('Mis à jour');
      } else {
        await menuService.createMenuItem(payload);
        toast.success('Ajouté');
      }
      setForm({ name: '', description: '', price: 0, category: '', available: true, image: null });
      setEditingId(null);
      loadItems();
    } catch {
      toast.error('Erreur');
    }
  };

  const edit = (item) => {
    setEditingId(item._id);
    setForm({ name: item.name, price: item.price, available: item.available });
  };

  const toggleAvail = async (item) => {
    try {
      await menuService.updateMenuItem(item._id, { available: !item.available });
      loadItems();
    } catch {
      toast.error('Erreur');
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Supprimer ?')) return;
    try {
      await menuService.deleteMenuItem(id);
      loadItems();
    } catch {
      toast.error('Erreur');
    }
  };

  return (
    <VendorLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Gestion du menu</h1>
          <button onClick={loadItems} className="flex items-center gap-2 px-3 py-2 bg-[#34D399]/20 rounded">
            <RefreshCw /> Rafraîchir
          </button>
        </div>

        <div className="bg-[#1A1A1A] p-6 rounded-xl">
          <h2 className="text-lg font-bold text-white mb-4">{editingId ? 'Modifier plat' : 'Nouveau plat'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              placeholder="Nom"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="p-2 bg-[#0A0A0A] border border-[#34D399]/20 rounded w-full"
            />
            <input
              placeholder="Catégorie"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="p-2 bg-[#0A0A0A] border border-[#34D399]/20 rounded w-full"
            />
            <input
              type="number"
              placeholder="Prix"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              className="p-2 bg-[#0A0A0A] border border-[#34D399]/20 rounded w-full"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <input
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="p-2 bg-[#0A0A0A] border border-[#34D399]/20 rounded w-full"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
              className="p-2 bg-[#0A0A0A] border border-[#34D399]/20 rounded w-full"
            />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.available}
                onChange={(e) => setForm({ ...form, available: e.target.checked })}
              /> Disponible
            </label>
          </div>
          <button onClick={save} className="mt-4 px-6 py-2 bg-[#FF6B35] rounded font-bold">
            {editingId ? 'Mettre à jour' : 'Ajouter'}
          </button>
        </div>

        <div>
          {loading ? (
            <p className="text-[#A0A0A0]">Chargement...</p>
          ) : (
            <div className="space-y-4">
              {menuItems.map((it) => (
                <div key={it._id} className="bg-[#1A1A1A] p-4 rounded flex justify-between items-center">
                  <div>
                    <h3 className="text-white font-bold">{it.name}</h3>
                    <p className="text-[#FF6B35]">{it.price} FCFA</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => edit(it)} className="text-blue-400"><Edit2 /></button>
                    <button onClick={() => toggleAvail(it)} className="text-yellow-400">
                      {it.available ? 'Désact' : 'Act'}
                    </button>
                    <button onClick={() => remove(it._id)} className="text-red-400"><Trash2 /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </VendorLayout>
  );
}