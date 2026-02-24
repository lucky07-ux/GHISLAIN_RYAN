import { useState, useEffect } from 'react';
import { Star, MessageSquare, RefreshCw, Check, X, Pin } from 'lucide-react';
import { reviewService } from '../../services/reviewService';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

interface Review {
  _id: string;
  customerName: string;
  rating: number;
  comment: string;
  status: string;
  helpful: number;
  isPinned: boolean;
  createdAt: string;
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const res = await reviewService.getAllReviews();
      setReviews(res?.reviews || res?.data || []);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = filter
    ? reviews.filter((r) => r.status === filter)
    : reviews;
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : '0';

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Avis de la Communauté</h1>
          <p className="text-[#A0A0A0]">
            {reviews.length} avis · Note moyenne ★ {avgRating}/5
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 bg-[#1A1A1A] border border-[#34D399]/30 rounded-lg text-white focus:outline-none focus:border-[#FF6B35]"
          >
            <option value="">Tous</option>
            <option value="pending">En attente</option>
            <option value="approved">Publiés</option>
            <option value="rejected">Rejetés</option>
          </select>
          <button
            onClick={load}
            className="flex items-center gap-2 px-4 py-2 bg-[#34D399]/20 border border-[#34D399]/30 rounded-lg hover:bg-[#34D399]/30 transition"
          >
            <RefreshCw size={18} />
            Actualiser
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-[#A0A0A0] text-center py-12">Chargement...</p>
      ) : filtered.length === 0 ? (
        <div className="bg-[#1A1A1A] border border-[#34D399]/20 rounded-xl p-12 text-center">
          <MessageSquare className="mx-auto text-[#A0A0A0] mb-4" size={48} />
          <p className="text-[#A0A0A0]">Aucun avis</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((r) => (
            <div
              key={r._id}
              className="bg-[#1A1A1A] border border-[#34D399]/20 p-6 rounded-xl"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-10 h-10 rounded-full bg-[#FF6B35]/20 flex items-center justify-center text-[#FF6B35] font-bold">
                      {(r.customerName || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-white">{r.customerName}</p>
                      <div className="flex gap-1 mt-0.5">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            size={16}
                            className={i <= r.rating ? 'fill-[#FF6B35] text-[#FF6B35]' : 'text-[#A0A0A0]'}
                          />
                        ))}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        r.status === 'approved' ? 'bg-green-500/20 text-green-400' : r.status === 'rejected' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      {r.status === 'approved' ? 'Publié' : r.status === 'rejected' ? 'Rejeté' : 'En attente'}
                    </span>
                  </div>
                  <p className="text-[#D1D5DB] mt-2">{r.comment}</p>
                  <p className="text-sm text-[#A0A0A0] mt-2">
                    {formatDate(r.createdAt)} · {r.helpful ?? 0} utiles
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
