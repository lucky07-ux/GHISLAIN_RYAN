import MainLayout from '../components/layout/MainLayout';
import { Heart, Target, Users } from 'lucide-react';

export default function About() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">
          À Propos de <span className="bg-gradient-to-r from-[#FF6B35] to-[#34D399] bg-clip-text text-transparent">LunchUp</span>
        </h1>

        {/* Histoire */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Heart className="text-[#FF6B35]" size={28} />
            Notre histoire
          </h2>
          <p className="text-[#D1D5DB] leading-relaxed mb-4">
            LunchUp est né de l'envie de proposer aux étudiants et professionnels de Yaoundé
            des repas camerounais authentiques, livrés rapidement sur le campus. Nous cuisinons
            chaque jour des plats faits maison avec des ingrédients frais.
          </p>
          <p className="text-[#D1D5DB] leading-relaxed">
            Notre équipe travaille du lundi au vendredi pour vous offrir le meilleur rapport
            qualité-prix et un service de livraison fiable.
          </p>
        </section>

        {/* Mission et valeurs */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Target className="text-[#34D399]" size={28} />
            Mission et valeurs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#1A1A1A] border border-[#34D399]/20 p-6 rounded-xl">
              <h3 className="font-bold text-white mb-2">Qualité</h3>
              <p className="text-[#A0A0A0] text-sm">
                Ingrédients frais, recettes traditionnelles, cuisine faite maison chaque jour.
              </p>
            </div>
            <div className="bg-[#1A1A1A] border border-[#34D399]/20 p-6 rounded-xl">
              <h3 className="font-bold text-white mb-2">Accessibilité</h3>
              <p className="text-[#A0A0A0] text-sm">
                Prix adaptés aux étudiants, livraison rapide sur le campus.
              </p>
            </div>
            <div className="bg-[#1A1A1A] border border-[#34D399]/20 p-6 rounded-xl">
              <h3 className="font-bold text-white mb-2">Proximité</h3>
              <p className="text-[#A0A0A0] text-sm">
                Une équipe locale au service des campus universitaires de Yaoundé.
              </p>
            </div>
            <div className="bg-[#1A1A1A] border border-[#34D399]/20 p-6 rounded-xl">
              <h3 className="font-bold text-white mb-2">Confiance</h3>
              <p className="text-[#A0A0A0] text-sm">
                Paiement sécurisé (Orange Money, MTN MOMO, Cash), commandes confirmées.
              </p>
            </div>
          </div>
        </section>

        {/* Équipe (optionnel) */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Users className="text-[#FF6B35]" size={28} />
            L'équipe
          </h2>
          <p className="text-[#D1D5DB]">
            Une petite équipe passionnée de cuisine camerounaise, au service de votre pause déjeuner.
          </p>
        </section>
      </div>
    </MainLayout>
  );
}
