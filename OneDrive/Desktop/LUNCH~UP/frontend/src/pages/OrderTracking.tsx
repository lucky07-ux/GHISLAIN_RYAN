import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { orderService } from '../services/orderService';
import { formatCurrency } from '../utils/formatters';

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface TrackingOrder {
  orderNumber: string;
  status: OrderStatus;
  pricing: { total: number };
  customerInfo: { name: string; phone: string };
  deliveryInfo: { address: string };
  createdAt: string;
}

const STEPS: { key: OrderStatus | 'received' | 'out_for_delivery'; label: string }[] = [
  { key: 'received', label: 'Order received' },
  { key: 'processing', label: 'Preparing food' },
  { key: 'shipped', label: 'Ready for pickup' },
  { key: 'out_for_delivery', label: 'Out for delivery' },
  { key: 'delivered', label: 'Delivered' },
];

function mapStatusToStep(status: OrderStatus): number {
  switch (status) {
    case 'pending':
    case 'confirmed':
      return 0;
    case 'processing':
      return 1;
    case 'shipped':
      return 2;
    case 'delivered':
      return 4;
    case 'cancelled':
      return -1;
    default:
      return 0;
  }
}

export default function OrderTracking() {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<TrackingOrder | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderNumber) {
      setError('Numéro de commande manquant');
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        const res = await orderService.trackOrder(orderNumber);
        setOrder(res.order);
      } catch {
        setError('Commande introuvable');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [orderNumber]);

  const activeStep = useMemo(
    () => (order ? mapStatusToStep(order.status) : 0),
    [order],
  );

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto py-10">
        <h1 className="text-3xl font-bold text-white mb-6">
          Suivi de votre commande
        </h1>

        {loading && (
          <div className="text-[#A0A0A0]">Chargement du statut...</div>
        )}

        {!loading && error && (
          <div className="bg-red-900/30 border border-red-500/40 text-red-100 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {!loading && order && (
          <>
            {/* Order summary */}
            <div className="mb-6 bg-[#020617] border border-[#1f2937] rounded-2xl p-4 space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-[#9ca3af]">Order</p>
                  <p className="text-sm font-mono text-white">
                    {order.orderNumber}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#9ca3af]">Total</p>
                  <p className="text-lg font-semibold text-[#22c55e]">
                    {formatCurrency(order.pricing.total)}
                  </p>
                </div>
              </div>
              <p className="text-xs text-[#9ca3af]">
                {order.customerInfo.name} • {order.customerInfo.phone}
              </p>
              <p className="text-xs text-[#9ca3af]">
                Livraison: {order.deliveryInfo.address}
              </p>
            </div>

            {/* Progress steps */}
            <div className="mb-6 bg-[#020617] border border-[#1f2937] rounded-2xl p-5">
              <div className="flex justify-between mb-4">
                {STEPS.map((step, index) => {
                  const isDone = activeStep >= index && activeStep !== -1;
                  const isCurrent = activeStep === index;
                  return (
                    <div
                      key={step.key}
                      className="flex-1 flex flex-col items-center text-center"
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border ${
                          isDone
                            ? 'bg-[#22c55e] text-black border-[#22c55e]'
                            : isCurrent
                            ? 'bg-[#111827] text-[#22c55e] border-[#22c55e]'
                            : 'bg-[#020617] text-[#6b7280] border-[#1f2937]'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <p className="mt-2 text-[11px] text-[#e5e7eb]">
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>
              <div className="h-1 w-full bg-[#111827] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#22c55e] to-[#a3e635] transition-all"
                  style={{
                    width:
                      activeStep === -1
                        ? '0%'
                        : `${((activeStep + 1) / STEPS.length) * 100}%`,
                  }}
                />
              </div>
              <p className="mt-3 text-xs text-[#9ca3af]">
                Statut actuel:{' '}
                <span className="text-white font-medium capitalize">
                  {order.status}
                </span>
              </p>
            </div>

            <div className="flex justify-between gap-3">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-4 py-2 rounded-lg border border-[#374151] text-sm text-[#e5e7eb] hover:bg-[#111827] transition"
              >
                Retour à l’accueil
              </button>
              <button
                type="button"
                onClick={() => navigate('/my-orders')}
                className="px-4 py-2 rounded-lg bg-[#22c55e] text-black text-sm font-semibold hover:bg-[#16a34a] transition"
              >
                Voir mon historique
              </button>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}

