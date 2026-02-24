
import { Mail, Phone, MapPin, Instagram } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0A0A0A] border-t border-[#34D399]/20 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">LunchUp</h3>
            <p className="text-[#A0A0A0]">
              Service de livraison de lunch box au Cameroun. Cuisine camerounaise authentique
              livrée directement à vous.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Contact</h3>
            <div className="space-y-3">
              <a
                href="tel:+237691710289"
                className="flex items-center gap-2 text-[#A0A0A0] hover:text-[#FF6B35] transition"
              >
                <Phone size={18} />
                +237 6 91 71 02 89
              </a>
              <a
                href="mailto:contact@lunchup.cm"
                className="flex items-center gap-2 text-[#A0A0A0] hover:text-[#FF6B35] transition"
              >
                <Mail size={18} />
                contact@lunchup.cm
              </a>
              <p className="flex items-center gap-2 text-[#A0A0A0]">
                <MapPin size={18} />
                Yaoundé, Cameroun
              </p>
            </div>
          </div>

          {/* Hours & Social */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Horaires</h3>
            <p className="text-[#A0A0A0] mb-4">
              Lundi - Vendredi: 8H - 15H
              <br />
              Samedi - Dimanche: Fermé
            </p>
            <div className="flex gap-4">
              <a
                href="https://instagram.com/lunchup"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-[#FF6B35]/20 hover:bg-[#FF6B35]/30 rounded-lg flex items-center justify-center text-[#FF6B35] transition"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#34D399]/20 pt-8">
          <p className="text-center text-[#A0A0A0] text-sm">
            © {currentYear} LunchUp. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
