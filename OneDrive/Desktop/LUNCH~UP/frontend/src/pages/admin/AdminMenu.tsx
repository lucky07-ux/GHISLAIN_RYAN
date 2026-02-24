import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2, RefreshCw, Package, CheckCircle, AlertTriangle, XCircle, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { menuService } from '../../services/menuService';
import { formatCurrency } from '../../utils/formatters';

interface MenuItemType {
  _id?: string;
  name: string;
  price: number;
  description?: string;
  dayOfWeek: string;
  quantityAvailable: number;
  imageUrl?: string;
}

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];

export default function AdminMenu() {
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<MenuItemType>({
    name: '',
    price: 0,
    description: '',
    dayOfWeek: 'Lundi',
    quantityAvailable: 10,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');

  const loadMenu = async () => {
    try {
      setLoading(true);
      const res = await menuService.getCurrentMenu();
      setMenuItems(res.menuItems || []);
    } catch {
      toast.error('Erreur chargement menu');
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenu();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  const handleAdd = async () => {
    if (!formData.name || formData.price <= 0) {
      toast.error('Nom et prix requis');
      return;
    }
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('price', formData.price.toString());
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('dayOfWeek', formData.dayOfWeek.toLowerCase());
      formDataToSend.append('quantityAvailable', formData.quantityAvailable.toString());
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }
      if (imageUrl) {
        formDataToSend.append('imageUrl', imageUrl);
      }

      await menuService.createMenuItem(formDataToSend);
      toast.success('Plat ajouté');
      setFormData({ name: '', price: 0, description: '', dayOfWeek: 'Lundi', quantityAvailable: 10 });
      setImageFile(null);
      setImagePreview('');
      setImageUrl('');
      loadMenu();
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : null;
      toast.error(msg || 'Erreur ajout');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer ce plat ?')) return;
    try {
      await menuService.deleteMenuItem(id);
      toast.success('Plat supprimé');
      loadMenu();
    } catch {
      toast.error('Erreur suppression');
    }
  };

  const totalPlats = menuItems.length;
  const disponibles = menuItems.filter((i) => i.quantityAvailable > 5).length;
  const stockFaible = menuItems.filter((i) => i.quantityAvailable > 0 && i.quantityAvailable <= 5).length;
  const rupture = menuItems.filter((i) => i.quantityAvailable === 0).length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestion du Menu Hebdomadaire</h1>
          <p className="text-[#A0A0A0]">Semaine en cours</p>
        </div>
        <button
          onClick={loadMenu}
          className="flex items-center gap-2 px-4 py-2 bg-[#34D399]/20 border border-[#34D399]/30 rounded-lg hover:bg-[#34D399]/30 transition"
        >
          <RefreshCw size={18} />
          Actualiser
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#1A1A1A] border border-[#34D399]/20 p-4 rounded-xl">
          <Package className="text-[#FF6B35] mb-2" size={24} />
          <p className="text-2xl font-bold text-white">{totalPlats}</p>
          <p className="text-sm text-[#A0A0A0]">Total plats</p>
        </div>
        <div className="bg-[#1A1A1A] border border-[#34D399]/20 p-4 rounded-xl">
          <CheckCircle className="text-green-500 mb-2" size={24} />
          <p className="text-2xl font-bold text-white">{disponibles}</p>
          <p className="text-sm text-[#A0A0A0]">Disponibles</p>
        </div>
        <div className="bg-[#1A1A1A] border border-[#34D399]/20 p-4 rounded-xl">
          <AlertTriangle className="text-yellow-500 mb-2" size={24} />
          <p className="text-2xl font-bold text-white">{stockFaible}</p>
          <p className="text-sm text-[#A0A0A0]">Stock faible</p>
        </div>
        <div className="bg-[#1A1A1A] border border-[#34D399]/20 p-4 rounded-xl">
          <XCircle className="text-red-500 mb-2" size={24} />
          <p className="text-2xl font-bold text-white">{rupture}</p>
          <p className="text-sm text-[#A0A0A0]">Rupture</p>
        </div>
      </div>

      <div className="bg-[#1A1A1A] border border-[#34D399]/20 p-6 rounded-xl mb-8">
        <h2 className="text-lg font-bold text-white mb-4">+ Ajouter un plat</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Nom du plat"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="px-4 py-2 bg-[#0A0A0A] border border-[#34D399]/30 rounded-lg text-white focus:outline-none focus:border-[#FF6B35]"
          />
          <input
            type="number"
            placeholder="Prix (FCFA)"
            value={formData.price || ''}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
            className="px-4 py-2 bg-[#0A0A0A] border border-[#34D399]/30 rounded-lg text-white focus:outline-none focus:border-[#FF6B35]"
          />
          <select
            value={formData.dayOfWeek}
            onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
            className="px-4 py-2 bg-[#0A0A0A] border border-[#34D399]/30 rounded-lg text-white focus:outline-none focus:border-[#FF6B35]"
          >
            {DAYS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Quantité disponible"
            value={formData.quantityAvailable}
            onChange={(e) => setFormData({ ...formData, quantityAvailable: parseInt(e.target.value) || 0 })}
            className="px-4 py-2 bg-[#0A0A0A] border border-[#34D399]/30 rounded-lg text-white focus:outline-none focus:border-[#FF6B35]"
          />
          <textarea
            placeholder="Description"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="px-4 py-2 bg-[#0A0A0A] border border-[#34D399]/30 rounded-lg text-white focus:outline-none focus:border-[#FF6B35] md:col-span-2"
            rows={2}
          />

          {/* Image Upload Section */}
          <div className="md:col-span-2">
            <label className="block text-[#D1D5DB] text-sm mb-2">Image du plat (optionnel)</label>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 px-4 py-2 bg-[#0A0A0A] border border-[#34D399]/30 rounded-lg cursor-pointer hover:border-[#FF6B35] transition">
                  <Upload size={18} className="text-[#34D399]" />
                  <span className="text-white">Choisir une image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                {imagePreview && (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-16 h-16 object-cover rounded-lg border border-[#34D399]/30"
                    />
                    <button
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4">
                <span className="text-white text-sm">Ou</span>
                <input
                  type="url"
                  placeholder="Coller l'URL de l'image"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="flex-1 px-4 py-2 bg-[#0A0A0A] border border-[#34D399]/30 rounded-lg text-white focus:outline-none focus:border-[#FF6B35]"
                />
              </div>
            </div>
            <p className="text-xs text-[#A0A0A0] mt-1">
              Formats acceptés: JPEG, PNG, WebP, GIF (max 5MB) ou URL d'image
            </p>
          </div>
        </div>
        <button
          onClick={handleAdd}
          className="mt-4 flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#FF6B35] to-orange-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-[#FF6B35]/50 transition"
        >
          <Plus size={18} />
          Ajouter au menu
        </button>
      </div>

      {loading ? (
        <p className="text-[#A0A0A0] text-center py-8">Chargement...</p>
      ) : (
        <div className="space-y-6">
          {DAYS.map((day) => {
            const items = menuItems.filter(
              (i) => (i.dayOfWeek || '').toLowerCase() === day.toLowerCase()
            );
            return (
              <div key={day} className="bg-[#1A1A1A] border border-[#34D399]/20 rounded-xl overflow-hidden">
                <div className="px-6 py-3 border-b border-[#34D399]/20 bg-[#0A0A0A]">
                  <h3 className="font-bold text-lg text-white">{day}</h3>
                </div>
                <div className="p-6">
                  {items.length === 0 ? (
                    <p className="text-[#A0A0A0]">Aucun plat pour {day}</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {items.map((item) => (
                        <div
                          key={item._id}
                          className="bg-[#0A0A0A] border border-[#34D399]/10 p-4 rounded-xl overflow-hidden"
                        >
                          {item.imageUrl && (
                            <div className="w-full h-32 mb-3 rounded-lg overflow-hidden">
                              <img
                                src={`http://localhost:5000${item.imageUrl}`}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  console.error('❌ Image load error:', `http://localhost:5000${item.imageUrl}`);
                                  e.currentTarget.style.display = 'none';
                                }}
                                onLoad={() => {
                                  console.log('✅ Image loaded:', `http://localhost:5000${item.imageUrl}`);
                                }}
                              />
                              {/* Debug info */}
                              <div className="text-xs text-gray-400 mt-1">
                                URL: {item.imageUrl}
                              </div>
                            </div>
                          )}
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-white truncate">{item.name}</h4>
                              <p className="text-sm text-[#A0A0A0] mt-1 line-clamp-2">{item.description}</p>
                              <div className="flex gap-3 mt-2 text-sm">
                                <span className="text-[#FF6B35] font-bold">{formatCurrency(item.price)}</span>
                                <span
                                  className={
                                    item.quantityAvailable === 0
                                      ? 'text-red-500'
                                      : item.quantityAvailable <= 5
                                      ? 'text-yellow-500'
                                      : 'text-[#34D399]'
                                  }
                                >
                                  Stock: {item.quantityAvailable}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2 ml-2">
                              <button
                                onClick={() => item._id && handleDelete(item._id)}
                                className="p-2 hover:bg-red-600/20 rounded-lg transition text-red-500"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
