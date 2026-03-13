import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import {
  Filter,
  MapPin,
  Search,
  Star,
  Timer,
  UtensilsCrossed,
} from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import { clientService } from '../services/clientService';

interface Vendor {
  id: string;
  business_name: string;
  owner_name: string;
  phone?: string;
  latitude: number | null;
  longitude: number | null;
}

type CuisineFilter =
  | 'all'
  | 'african'
  | 'fast_food'
  | 'bbq'
  | 'breakfast'
  | 'street_food'
  | 'drinks'
  | 'desserts';

const cuisineLabels: Record<CuisineFilter, string> = {
  all: 'Tout',
  african: 'African food',
  fast_food: 'Fast food',
  bbq: 'BBQ & grills',
  breakfast: 'Breakfast',
  street_food: 'Street food',
  drinks: 'Drinks',
  desserts: 'Desserts',
};

const defaultCenter: [number, number] = [3.848, 11.502]; // Yaoundé approximatif

const vendorIcon = new L.Icon({
  iconUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function haversineDistance(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;

  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);

  const aa =
    sinDLat * sinDLat +
    sinDLon * sinDLon * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
  return R * c;
}

export default function Home() {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cuisine, setCuisine] = useState<CuisineFilter>('all');
  const [sortBy, setSortBy] = useState<'popularity' | 'fastest' | 'rating'>(
    'popularity',
  );
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null,
  );

  useEffect(() => {
    const loadVendors = async () => {
      try {
        const res = await clientService.getVendors();
        setVendors(res.vendors || []);
      } finally {
        setLoading(false);
      }
    };
    loadVendors();
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
      },
      () => {
        // ignore errors – l’utilisateur peut toujours naviguer sans
      },
    );
  }, []);

  const filteredVendors = useMemo(() => {
    let list = vendors;

    if (search.trim()) {
      const term = search.toLowerCase();
      list = list.filter((v) =>
        v.business_name.toLowerCase().includes(term),
      );
    }

    if (cuisine !== 'all') {
      // Pour l'instant, on ne filtre pas réellement par type de cuisine,
      // mais on pourrait le faire quand le backend exposera cette info.
      list = list;
    }

    const withMeta = list.map((v) => {
      let distanceKm: number | null = null;
      if (
        userLocation &&
        typeof v.latitude === 'number' &&
        typeof v.longitude === 'number'
      ) {
        distanceKm = haversineDistance(
          { lat: userLocation[0], lng: userLocation[1] },
          { lat: v.latitude, lng: v.longitude },
        );
      }
      const prepMin = 20;
      const deliveryMin = 15;
      const rating = 4.7;
      const reviews = 120;
      return { ...v, distanceKm, prepMin, deliveryMin, rating, reviews };
    });

    withMeta.sort((a, b) => {
      if (sortBy === 'rating') {
        return b.rating - a.rating;
      }
      if (sortBy === 'fastest') {
        return a.prepMin + a.deliveryMin - (b.prepMin + b.deliveryMin);
      }
      return b.reviews - a.reviews;
    });

    return withMeta;
  }, [vendors, search, cuisine, sortBy, userLocation]);

  const mapCenter = userLocation || defaultCenter;

  return (
    <MainLayout>
      {/* Hero + Search */}
      <section className="mb-8">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Trouvez votre prochain repas
          </h1>
          <p className="text-[#A0A0A0]">
            Découvrez les meilleurs restaurants autour de vous. Commandez en quelques clics,
            suivez votre livraison en temps réel.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A0A0]">
                <Search size={18} />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Find food near you"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#1A1A1A] border border-[#34D399]/40 text-white placeholder-[#6B7280] focus:outline-none focus:border-[#34D399] transition"
              />
            </div>
            <button
              type="button"
              onClick={() =>
                navigate('/vendors')
              }
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-white font-semibold shadow-md hover:shadow-lg transition"
            >
              Explorer les vendeurs
            </button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-white">
            Catégories populaires
          </h2>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {(Object.keys(cuisineLabels) as CuisineFilter[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setCuisine(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm whitespace-nowrap transition ${
                cuisine === key
                  ? 'bg-[#22c55e] border-[#22c55e] text-black font-semibold'
                  : 'bg-[#111827] border-[#1f2937] text-[#D1D5DB] hover:border-[#374151]'
              }`}
            >
              <UtensilsCrossed size={16} />
              {cuisineLabels[key]}
            </button>
          ))}
        </div>
      </section>

      {/* Filters + Map/List */}
      <section className="mb-10">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: filters + list */}
          <div className="w-full lg:w-[45%] flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3 justify-between bg-[#020617] border border-[#1f2937] rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-[#9ca3af]">
                <Filter size={16} />
                <span>Filtres</span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(
                      e.target.value as 'popularity' | 'fastest' | 'rating',
                    )
                  }
                  className="bg-[#020617] border border-[#374151] text-[#e5e7eb] rounded-full px-3 py-1 focus:outline-none focus:border-[#22c55e]"
                >
                  <option value="popularity">Popularité</option>
                  <option value="fastest">Livraison la plus rapide</option>
                  <option value="rating">Mieux notés</option>
                </select>
              </div>
            </div>

            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {loading ? (
                <div className="text-[#9ca3af] text-sm">
                  Chargement des vendeurs...
                </div>
              ) : filteredVendors.length === 0 ? (
                <div className="text-[#9ca3af] text-sm">
                  Aucun vendeur trouvé.
                </div>
              ) : (
                filteredVendors.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => navigate(`/vendors/${v.id}/menu`)}
                    className="w-full text-left bg-[#020617] border border-[#1f2937] hover:border-[#22c55e] rounded-2xl p-4 flex gap-3 transition"
                  >
                    <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-[#22c55e]/20 to-[#0ea5e9]/20 flex items-center justify-center text-2xl text-white flex-shrink-0">
                      {v.business_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 flex flex-col gap-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-white truncate">
                          {v.business_name}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-[#fbbf24]">
                          <Star size={14} className="fill-[#fbbf24]" />
                          <span>4.7</span>
                          <span className="text-[#6b7280]">
                            (120)
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-[#9ca3af]">
                        African cuisine • Street food
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-[#9ca3af]">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#111827]">
                          <Timer size={12} />
                          20–30 min
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#111827]">
                          <MapPin size={12} />
                          {v.distanceKm
                            ? `${v.distanceKm.toFixed(1)} km`
                            : 'Proche'}
                        </span>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right: map */}
          <div className="w-full lg:flex-1 h-[380px] lg:h-[520px] rounded-2xl overflow-hidden border border-[#1f2937] bg-[#020617]">
            <MapContainer
              center={mapCenter}
              zoom={13}
              style={{ width: '100%', height: '100%' }}
              scrollWheelZoom
            >
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {filteredVendors
                .filter(
                  (v) =>
                    typeof v.latitude === 'number' &&
                    typeof v.longitude === 'number',
                )
                .map((v) => (
                  <Marker
                    key={v.id}
                    position={[v.latitude!, v.longitude!]}
                    icon={vendorIcon}
                  >
                    <Popup>
                      <div className="space-y-1">
                        <div className="font-semibold">
                          {v.business_name}
                        </div>
                        <div className="text-xs text-gray-600">
                          African cuisine • 4.7 ⭐
                        </div>
                        <button
                          type="button"
                          className="mt-1 text-xs text-green-600 font-semibold"
                          onClick={() =>
                            navigate(`/vendors/${v.id}/menu`)
                          }
                        >
                          Voir le menu →
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
            </MapContainer>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
