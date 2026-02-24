import { useState, useEffect } from 'react';
import { Star, MessageSquare, ThumbsUp, Send } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import { reviewService } from '../services/reviewService';
import { formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';

interface Review {
  _id: string;
  customerName: string;
  rating: number;
  comment: string;
  helpful?: number;
  createdAt: string;
}

export default function Community() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'recent' | 'rating' | 'helpful'>('recent');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    rating: 5,
    comment: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const res = await reviewService.getApprovedReviews();
      setReviews(res?.reviews || res?.data || []);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const sorted = [...reviews].sort((a, b) => {
    if (sortBy === 'recent') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === 'rating') return b.rating - a.rating;
    return (b.helpful ?? 0) - (a.helpful ?? 0);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName.trim() || !formData.comment.trim()) {
      toast.error('Nom et avis requis');
      return;
    }
    if (formData.comment.length > 500) {
      toast.error('Avis max 500 caractères');
      return;
    }
    try {
      setSubmitting(true);
      await reviewService.submitReview({
        customerName: formData.customerName.trim(),
        rating: formData.rating,
        comment: formData.comment.trim(),
      });
      toast.success('Votre avis a été envoyé. Il sera publié après modération.');
      setFormData({ customerName: '', rating: 5, comment: '' });
      setShowForm(false);
      loadReviews();
    } catch {
      toast.error('Erreur lors de l\'envoi');
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '0';

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Communauté LunchUp</h1>
            <p className="text-[#A0A0A0]">
              Partagez votre expérience et vos suggestions. Note moyenne ★ {avgRating}/5
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF6B35] to-orange-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-[#FF6B35]/50 transition"
          >
            <MessageSquare size={20} />
            Donner mon avis
          </button>
        </div>

        {showForm && (
          <div className="bg-[#1A1A1A] border border-[#34D399]/20 p-6 rounded-xl mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Donner mon avis</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[#D1D5DB] mb-2">Nom / Pseudo *</label>
                <input
                  type="text"
                  required
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#34D399]/30 rounded-lg text-white focus:outline-none focus:border-[#FF6B35]"
                  placeholder="Votre nom ou pseudo"
                />
              </div>
              <div>
                <label className="block text-[#D1D5DB] mb-2">Évaluation *</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: i })}
                      className="p-1 focus:outline-none"
                    >
                      <Star
                        size={32}
                        className={i <= formData.rating ? 'fill-[#FF6B35] text-[#FF6B35]' : 'text-[#A0A0A0]'}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[#D1D5DB] mb-2">Votre avis * (500 caractères max)</label>
                <textarea
                  required
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value.slice(0, 500) })}
                  rows={4}
                  maxLength={500}
                  className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#34D399]/30 rounded-lg text-white focus:outline-none focus:border-[#FF6B35]"
                  placeholder="Partagez votre expérience..."
                />
                <p className="text-sm text-[#A0A0A0] mt-1">{formData.comment.length}/500</p>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-3 bg-[#34D399] text-[#0A0A0A] font-bold rounded-lg hover:bg-[#34D399]/90 transition disabled:opacity-50"
                >
                  <Send size={18} />
                  {submitting ? 'Envoi...' : 'Publier'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 border border-[#34D399]/30 text-[#D1D5DB] rounded-lg hover:bg-[#34D399]/10 transition"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="flex items-center gap-4 mb-6">
          <span className="text-[#A0A0A0]">Tri:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'recent' | 'rating' | 'helpful')}
            className="px-4 py-2 bg-[#1A1A1A] border border-[#34D399]/30 rounded-lg text-white focus:outline-none focus:border-[#FF6B35]"
          >
            <option value="recent">Plus récents</option>
            <option value="rating">Mieux notés</option>
            <option value="helpful">Plus utiles</option>
          </select>
        </div>

        {loading ? (
          <p className="text-[#A0A0A0] text-center py-12">Chargement des avis...</p>
        ) : sorted.length === 0 ? (
          <div className="bg-[#1A1A1A] border border-[#34D399]/20 rounded-xl p-12 text-center">
            <MessageSquare className="mx-auto text-[#A0A0A0] mb-4" size={48} />
            <p className="text-[#A0A0A0]">Aucun avis pour le moment. Soyez le premier à partager !</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sorted.map((r) => (
              <div
                key={r._id}
                className="bg-[#1A1A1A] border border-[#34D399]/20 p-6 rounded-xl"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#FF6B35]/20 flex items-center justify-center text-[#FF6B35] font-bold text-lg shrink-0">
                    {(r.customerName || '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="font-bold text-white">{r.customerName}</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            size={16}
                            className={i <= r.rating ? 'fill-[#FF6B35] text-[#FF6B35]' : 'text-[#A0A0A0]'}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-[#A0A0A0]">{formatDate(r.createdAt)}</span>
                    </div>
                    <p className="text-[#D1D5DB] whitespace-pre-wrap">{r.comment}</p>
                    <div className="flex items-center gap-2 mt-3 text-sm text-[#A0A0A0]">
                      <ThumbsUp size={16} />
                      <span>{r.helpful ?? 0} utiles</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
