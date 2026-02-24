import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import MainLayout from '../components/layout/MainLayout';
import { useCartStore } from '../store/cartstore';
import { orderService } from '../services/orderService';
import { formatCurrency } from '../utils/formatters';
import toast from 'react-hot-toast';

// Validation schema
const orderSchema = z.object({
  customerName: z.string().min(3, 'Nom requis'),
  phone: z.string().regex(/^[\d\s+()-]{10,}$/, 'Numéro invalide'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  deliveryType: z.enum(['campus', 'office', 'residence', 'other']),
  address: z.string().min(10, 'Adresse requise'),
  paymentMethod: z.enum(['orange_money', 'mtn_momo', 'card', 'cash']),
  paymentPhone: z.string().optional(),
  specialInstructions: z.string().optional(),
});

type OrderFormData = z.infer<typeof orderSchema>;

export default function Checkout() {
  const navigate = useNavigate();
  const cartItems = useCartStore((state) => state.items);
  const cartSubtotal = useCartStore((state) => state.getSubtotal());
  const cartTotal = useCartStore((state) => state.getTotal());
  const clearCart = useCartStore((state) => state.clearCart);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('cash');

  const handleInitiatePayment = async (orderId: string) => {
    setIsSubmitting(true);
    try {
      const response = await orderService.initiatePayment(orderId);

      if (response.success) {
        // Rediriger vers page paiement NotchPay
        window.location.href = response.paymentUrl;
      }
    } catch (error: any) {
      toast.error('Erreur initialisation paiement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
  });

  const onSubmit = async (data: OrderFormData) => {
    if (cartItems.length === 0) {
      toast.error('Votre panier est vide');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderData = {
        customerInfo: {
          name: data.customerName,
          phone: data.phone,
          email: data.email || undefined,
        },
        deliveryInfo: {
          type: data.deliveryType,
          address: data.address,
          instructions: data.specialInstructions,
        },
        items: cartItems,
        payment: {
          method: data.paymentMethod,
          phoneNumber: data.paymentPhone,
        },
        specialInstructions: data.specialInstructions,
      };

      const orderResponse = await orderService.createOrder(orderData);

      // Si paiement en ligne choisi, rediriger vers NotchPay
      if (['orange_money', 'mtn_momo', 'card'].includes(data.paymentMethod)) {
        await handleInitiatePayment(orderResponse.order._id);
      } else {
        // Cash - commande terminée
        toast.success('Commande passée avec succès!');
        clearCart();
        navigate('/');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la commande');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0 && !isSubmitting) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold text-white mb-4">Panier Vide</h1>
          <p className="text-[#A0A0A0] mb-8">Ajoutez des articles au panier avant de commander</p>
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3 bg-[#FF6B35] text-white font-bold rounded-lg hover:bg-orange-600 transition"
          >
            Retour au menu
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Finaliser la Commande</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulaire */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Informations Personnelles */}
              <div className="bg-[#1A1A1A] border border-[#34D399]/20 p-6 rounded-xl">
                <h2 className="text-xl font-bold text-white mb-4">Informations Personnelles</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[#D1D5DB] mb-2">Nom Complet *</label>
                    <input
                      {...register('customerName')}
                      className="w-full px-4 py-2 bg-[#0A0A0A] border border-[#34D399]/30 rounded-lg text-white focus:outline-none focus:border-[#FF6B35]"
                      placeholder="Ex: Jean Kouam"
                    />
                    {errors.customerName && (
                      <p className="text-red-500 text-sm mt-1">{errors.customerName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[#D1D5DB] mb-2">Téléphone *</label>
                    <input
                      {...register('phone')}
                      className="w-full px-4 py-2 bg-[#0A0A0A] border border-[#34D399]/30 rounded-lg text-white focus:outline-none focus:border-[#FF6B35]"
                      placeholder="+237 6XX XX XX XX"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[#D1D5DB] mb-2">Email (optionnel)</label>
                    <input
                      {...register('email')}
                      type="email"
                      className="w-full px-4 py-2 bg-[#0A0A0A] border border-[#34D399]/30 rounded-lg text-white focus:outline-none focus:border-[#FF6B35]"
                      placeholder="votre@email.com"
                    />
                  </div>
                </div>
              </div>

              {/* Adresse de Livraison */}
              <div className="bg-[#1A1A1A] border border-[#34D399]/20 p-6 rounded-xl">
                <h2 className="text-xl font-bold text-white mb-4">Adresse de Livraison</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[#D1D5DB] mb-2">Type de Lieu *</label>
                    <select
                      {...register('deliveryType')}
                      className="w-full px-4 py-2 bg-[#0A0A0A] border border-[#34D399]/30 rounded-lg text-white focus:outline-none focus:border-[#FF6B35]"
                    >
                      <option value="campus">Campus Universitaire</option>
                      <option value="office">Bureau/Entreprise</option>
                      <option value="residence">Résidence</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#D1D5DB] mb-2">Adresse *</label>
                    <input
                      {...register('address')}
                      className="w-full px-4 py-2 bg-[#0A0A0A] border border-[#34D399]/30 rounded-lg text-white focus:outline-none focus:border-[#FF6B35]"
                      placeholder="Ex: Université de Yaoundé 1, Faculté des Sciences"
                    />
                    {errors.address && (
                      <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[#D1D5DB] mb-2">Instructions Spéciales</label>
                    <textarea
                      {...register('specialInstructions')}
                      className="w-full px-4 py-2 bg-[#0A0A0A] border border-[#34D399]/30 rounded-lg text-white focus:outline-none focus:border-[#FF6B35]"
                      placeholder="Point de repère, instructions pour le livreur..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Méthode de Paiement */}
              <div className="bg-[#1A1A1A] border border-[#34D399]/20 p-6 rounded-xl">
                <h2 className="text-xl font-bold text-white mb-4">Méthode de Paiement</h2>

                <div className="space-y-3">
                  {['cash', 'orange_money', 'mtn_momo', 'card'].map((method) => (
                    <label key={method} className="flex items-center p-4 border border-[#34D399]/30 rounded-lg cursor-pointer hover:bg-[#34D399]/10 transition">
                      <input
                        type="radio"
                        {...register('paymentMethod')}
                        value={method}
                        checked={selectedPayment === method}
                        onChange={(e) => setSelectedPayment(e.target.value)}
                        className="mr-3"
                      />
                      <span className="text-white font-bold capitalize">
                        {method === 'cash' && '💵 Payer à la livraison'}
                        {method === 'orange_money' && '📱 Orange Money'}
                        {method === 'mtn_momo' && '📱 MTN Mobile Money'}
                        {method === 'card' && '💳 Carte Visa/Mastercard'}
                      </span>
                    </label>
                  ))}

                  {selectedPayment !== 'cash' && selectedPayment !== 'card' && (
                    <div className="mt-4">
                      <label className="block text-[#D1D5DB] mb-2">Numéro de Paiement</label>
                      <input
                        {...register('paymentPhone')}
                        className="w-full px-4 py-2 bg-[#0A0A0A] border border-[#34D399]/30 rounded-lg text-white focus:outline-none focus:border-[#FF6B35]"
                        placeholder="+237 6XX XX XX XX"
                      />
                    </div>
                  )}

                  {selectedPayment === 'card' && (
                    <div className="mt-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                      <p className="text-blue-300 text-sm">
                        💳 Le paiement par carte sera traité via NotchPay de manière sécurisée.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-8 py-3 bg-gradient-to-r from-[#FF6B35] to-orange-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-[#FF6B35]/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Traitement...' : 'Valider la Commande'}
              </button>
            </form>
          </div>

          {/* Résumé Commande */}
          <div className="bg-[#1A1A1A] border border-[#34D399]/20 p-6 rounded-xl h-fit">
            <h2 className="text-xl font-bold text-white mb-4">Résumé</h2>

            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <div key={item.menuItemId} className="flex justify-between text-[#D1D5DB]">
                  <span>
                    {item.name} x{item.quantity}
                  </span>
                  <span>{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-[#34D399]/20 pt-4 space-y-2">
              <div className="flex justify-between text-[#D1D5DB]">
                <span>Sous-total:</span>
                <span>{formatCurrency(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between text-[#D1D5DB]">
                <span>Livraison:</span>
                <span>{formatCurrency(1000)}</span>
              </div>
              <div className="flex justify-between text-2xl font-bold text-[#FF6B35] pt-2 border-t border-[#34D399]/20">
                <span>Total:</span>
                <span>{formatCurrency(cartTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
