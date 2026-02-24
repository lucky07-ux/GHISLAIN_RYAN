import { useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { Phone, MapPin, Instagram, Clock, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      // TODO: envoyer vers API contact si disponible
      await new Promise((r) => setTimeout(r, 800));
      toast.success('Message envoyé ! Nous vous répondrons rapidement.');
      setFormData({ name: '', email: '', message: '' });
    } catch {
      toast.error('Erreur lors de l\'envoi. Réessayez ou contactez-nous par téléphone.');
    } finally {
      setSending(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Contact</h1>
        <p className="text-[#A0A0A0] text-lg mb-12">
          Une question ou une suggestion ? Écrivez-nous ou appelez-nous.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Informations */}
          <div className="space-y-8">
            <div className="bg-[#1A1A1A] border border-[#34D399]/20 p-6 rounded-xl">
              <Phone className="text-[#FF6B35] mb-3" size={24} />
              <h3 className="font-bold text-white mb-2">Téléphone</h3>
              <a href="tel:+237691710289" className="text-[#A0A0A0] hover:text-[#FF6B35] transition">
                +237 6 91 71 02 89
              </a>
            </div>
            <div className="bg-[#1A1A1A] border border-[#34D399]/20 p-6 rounded-xl">
              <Instagram className="text-[#FF6B35] mb-3" size={24} />
              <h3 className="font-bold text-white mb-2">Instagram</h3>
              <a
                href="https://instagram.com/LunchUpCMR"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#A0A0A0] hover:text-[#FF6B35] transition"
              >
                @LunchUpCMR
              </a>
            </div>
            <div className="bg-[#1A1A1A] border border-[#34D399]/20 p-6 rounded-xl">
              <Clock className="text-[#34D399] mb-3" size={24} />
              <h3 className="font-bold text-white mb-2">Horaires</h3>
              <p className="text-[#A0A0A0]">Lundi - Vendredi : 8H - 15H</p>
            </div>
            <div className="bg-[#1A1A1A] border border-[#34D399]/20 p-6 rounded-xl">
              <MapPin className="text-[#34D399] mb-3" size={24} />
              <h3 className="font-bold text-white mb-2">Zone de livraison</h3>
              <p className="text-[#A0A0A0]">Campus universitaires Yaoundé</p>
            </div>
          </div>

          {/* Formulaire */}
          <div className="lg:col-span-2">
            <div className="bg-[#1A1A1A] border border-[#34D399]/20 p-8 rounded-xl">
              <h2 className="text-xl font-bold text-white mb-6">Envoyer un message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[#D1D5DB] mb-2">Nom</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#34D399]/30 rounded-lg text-white focus:outline-none focus:border-[#FF6B35]"
                    placeholder="Votre nom"
                  />
                </div>
                <div>
                  <label className="block text-[#D1D5DB] mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#34D399]/30 rounded-lg text-white focus:outline-none focus:border-[#FF6B35]"
                    placeholder="votre.email@exemple.com"
                  />
                </div>
                <div>
                  <label className="block text-[#D1D5DB] mb-2">Message</label>
                  <textarea
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={5}
                    className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#34D399]/30 rounded-lg text-white focus:outline-none focus:border-[#FF6B35]"
                    placeholder="Votre message..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={sending}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF6B35] to-orange-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-[#FF6B35]/50 transition disabled:opacity-50"
                >
                  <Send size={18} />
                  {sending ? 'Envoi...' : 'Envoyer'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
