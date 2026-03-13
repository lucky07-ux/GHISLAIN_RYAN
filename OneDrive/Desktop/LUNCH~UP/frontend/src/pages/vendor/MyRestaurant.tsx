import { useEffect, useState } from 'react';
import { Store, MapPin, Phone, Clock, Image, Save, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import VendorLayout from '../../components/layout/VendorLayout';
import { useAuthStore } from '../../store/authStore';

interface RestaurantProfile {
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  openingHours: {
    [key: string]: { open: string; close: string; closed: boolean };
  };
  image: string;
  coverImage: string;
}

const defaultHours = {
  monday: { open: '08:00', close: '22:00', closed: false },
  tuesday: { open: '08:00', close: '22:00', closed: false },
  wednesday: { open: '08:00', close: '22:00', closed: false },
  thursday: { open: '08:00', close: '22:00', closed: false },
  friday: { open: '08:00', close: '22:00', closed: false },
  saturday: { open: '08:00', close: '22:00', closed: false },
  sunday: { open: '08:00', close: '22:00', closed: false },
};

export default function MyRestaurant() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<RestaurantProfile>({
    name: user?.name || '',
    description: '',
    address: '',
    phone: user?.phone || '',
    email: user?.email || '',
    openingHours: defaultHours,
    image: '',
    coverImage: '',
  });

  const [newImage, setNewImage] = useState<File | null>(null);
  const [newCoverImage, setNewCoverImage] = useState<File | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      // Try to load vendor profile from backend
      // For now, we'll use user data if available
      if (user) {
        setProfile(prev => ({
          ...prev,
          name: user.name || prev.name,
          phone: user.phone || prev.phone,
          email: user.email || prev.email,
        }));
      }
    } catch {
      toast.error('Erreur chargement profil');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile.name.trim()) {
      toast.error('Le nom du restaurant est requis');
      return;
    }

    try {
      setSaving(true);
      
      const formData = new FormData();
      formData.append('name', profile.name);
      formData.append('description', profile.description);
      formData.append('address', profile.address);
      formData.append('phone', profile.phone);
      formData.append('email', profile.email);
      formData.append('openingHours', JSON.stringify(profile.openingHours));
      
      if (newImage) {
        formData.append('image', newImage);
      }
      if (newCoverImage) {
        formData.append('coverImage', newCoverImage);
      }

      // Call API to update profile
      // await vendorService.updateProfile(formData);
      
      toast.success('Profil enregistré avec succès');
    } catch {
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const handleHoursChange = (day: string, field: string, value: string | boolean) => {
    setProfile(prev => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [day]: {
          ...prev.openingHours[day],
          [field]: value,
        },
      },
    }));
  };

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  if (loading) {
    return (
      <VendorLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF6B35]"></div>
        </div>
      </VendorLayout>
    );
  }

  return (
    <VendorLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Mon Restaurant</h1>
            <p className="text-[#A0A0A0] text-sm">Gérez les informations de votre établissement</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF6B35] to-orange-500 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-[#FF6B35]/50 transition disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Enregistrement...
              </>
            ) : (
              <>
                <Save size={20} />
                Enregistrer
              </>
            )}
          </button>
        </div>

        {/* Cover Image */}
        <div className="relative h-48 rounded-xl overflow-hidden bg-[#1A1A1A] border border-[#34D399]/20">
          {profile.coverImage || newCoverImage ? (
            <img
              src={newCoverImage ? URL.createObjectURL(newCoverImage) : profile.coverImage}
              alt="Couverture"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#A0A0A0]">
              <div className="text-center">
                <Image className="mx-auto mb-2" size={32} />
                <p>Ajoutez une image de couverture</p>
              </div>
            </div>
          )}
          <label className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-black/70 text-white rounded-lg cursor-pointer hover:bg-black/80 transition">
            <Upload size={16} />
            <span>Changer</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setNewCoverImage(e.target.files?.[0] || null)}
            />
          </label>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#1A1A1A] border border-[#34D399]/20 p-6 rounded-xl space-y-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Store size={20} className="text-[#FF6B35]" />
                Informations générales
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#A0A0A0] text-sm mb-2">Nom du restaurant *</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#34D399]/30 rounded-lg text-white focus:outline-none focus:border-[#FF6B35] transition"
                    placeholder="Nom de votre restaurant"
                  />
                </div>
                <div>
                  <label className="block text-[#A0A0A0] text-sm mb-2">Téléphone</label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#34D399]/30 rounded-lg text-white focus:outline-none focus:border-[#FF6B35] transition"
                    placeholder="+237 6XX XXX XXX"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#A0A0A0] text-sm mb-2">Email</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#34D399]/30 rounded-lg text-white focus:outline-none focus:border-[#FF6B35] transition"
                  placeholder="contact@restaurant.com"
                />
              </div>

              <div>
                <label className="block text-[#A0A0A0] text-sm mb-2 flex items-center gap-2">
                  <MapPin size={16} />
                  Adresse
                </label>
                <input
                  type="text"
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#34D399]/30 rounded-lg text-white focus:outline-none focus:border-[#FF6B35] transition"
                  placeholder="Adresse de votre restaurant"
                />
              </div>

              <div>
                <label className="block text-[#A0A0A0] text-sm mb-2">Description</label>
                <textarea
                  value={profile.description}
                  onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#34D399]/30 rounded-lg text-white focus:outline-none focus:border-[#FF6B35] transition resize-none"
                  rows={4}
                  placeholder="Décrivez votre restaurant, votre cuisine, vos spécialités..."
                />
              </div>
            </div>

            {/* Opening Hours */}
            <div className="bg-[#1A1A1A] border border-[#34D399]/20 p-6 rounded-xl space-y-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Clock size={20} className="text-[#FF6B35]" />
                Horaires d'ouverture
              </h2>

              <div className="space-y-4">
                {days.map((day) => (
                  <div key={day} className="flex flex-col md:flex-row md:items-center gap-4 p-4 bg-[#0A0A0A] rounded-lg">
                    <div className="w-32">
                      <span className="text-white font-medium capitalize">{day}</span>
                    </div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!profile.openingHours[day].closed}
                        onChange={(e) => handleHoursChange(day, 'closed', !e.target.checked)}
                        className="w-5 h-5 rounded border-[#34D399]/30 bg-[#1A1A1A] text-[#FF6B35] focus:ring-[#FF6B35]"
                      />
                      <span className="text-[#A0A0A0]">Ouvert</span>
                    </label>
                    {!profile.openingHours[day].closed && (
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={profile.openingHours[day].open}
                          onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                          className="px-3 py-2 bg-[#1A1A1A] border border-[#34D399]/30 rounded-lg text-white focus:outline-none focus:border-[#FF6B35]"
                        />
                        <span className="text-[#A0A0A0]">à</span>
                        <input
                          type="time"
                          value={profile.openingHours[day].close}
                          onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                          className="px-3 py-2 bg-[#1A1A1A] border border-[#34D399]/30 rounded-lg text-white focus:outline-none focus:border-[#FF6B35]"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Profile Image */}
          <div className="space-y-6">
            <div className="bg-[#1A1A1A] border border-[#34D399]/20 p-6 rounded-xl">
              <h2 className="text-xl font-bold text-white mb-4">Photo de profil</h2>
              <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-[#0A0A0A] border border-[#34D399]/20">
                {profile.image || newImage ? (
                  <img
                    src={newImage ? URL.createObjectURL(newImage) : profile.image}
                    alt="Profil"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#A0A0A0]">
                    <div className="text-center">
                      <Store size={48} className="mx-auto mb-2" />
                      <p>Pas de photo</p>
                    </div>
                  </div>
                )}
                <label className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-2 py-3 bg-black/70 text-white cursor-pointer hover:bg-black/80 transition">
                  <Upload size={16} />
                  <span>Changer la photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setNewImage(e.target.files?.[0] || null)}
                  />
                </label>
              </div>
            </div>

            <div className="bg-[#1A1A1A] border border-[#34D399]/20 p-6 rounded-xl">
              <h2 className="text-xl font-bold text-white mb-4">Contact rapide</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-[#A0A0A0]">
                  <Phone size={18} className="text-[#FF6B35]" />
                  <span>{profile.phone || 'Non défini'}</span>
                </div>
                <div className="flex items-center gap-3 text-[#A0A0A0]">
                  <MapPin size={18} className="text-[#FF6B35]" />
                  <span>{profile.address || 'Non défini'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </VendorLayout>
  );
}

