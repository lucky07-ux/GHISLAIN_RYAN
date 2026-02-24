import { useNavigate } from 'react-router-dom';
import { X, Minus, Plus, Trash2 } from 'lucide-react';
import type { CartState } from '../store/cartstore';
import { useCartStore } from '../store/cartstore';
import { formatCurrency } from '../utils/formatters';
import type { CartItem } from '../types/index';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const navigate = useNavigate();
  const items = useCartStore((state: CartState) => state.items);
  const removeItem = useCartStore((state: CartState) => state.removeItem);
  const updateQuantity = useCartStore((state: CartState) => state.updateQuantity);
  const getSubtotal = useCartStore((state: CartState) => state.getSubtotal);
  const getTotal = useCartStore((state: CartState) => state.getTotal);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-screen w-full max-w-md bg-[#1A1A1A] border-l border-[#34D399]/20 z-50 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-[#34D399]/20">
          <h2 className="text-2xl font-bold text-white">Mon Panier</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#34D399]/10 rounded-lg transition"
          >
            <X size={24} className="text-white" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#A0A0A0]">Votre panier est vide</p>
            </div>
          ) : (
            items.map((item: CartItem) => (
              <div
                key={item.menuItemId}
                className="bg-[#0A0A0A] p-4 rounded-lg border border-[#34D399]/10"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-white">{item.name}</h3>
                    <p className="text-[#FF6B35] font-bold">
                      {formatCurrency(item.price)}
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem(item.menuItemId)}
                    className="p-1 hover:bg-red-600/10 rounded transition"
                  >
                    <Trash2 size={18} className="text-red-500" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      updateQuantity(item.menuItemId, item.quantity - 1)
                    }
                    className="p-1 hover:bg-[#34D399]/10 rounded transition"
                  >
                    <Minus size={16} className="text-[#34D399]" />
                  </button>
                  <span className="flex-1 text-center text-white font-bold">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      updateQuantity(item.menuItemId, item.quantity + 1)
                    }
                    className="p-1 hover:bg-[#34D399]/10 rounded transition"
                  >
                    <Plus size={16} className="text-[#34D399]" />
                  </button>
                </div>

                <p className="text-sm text-[#A0A0A0] mt-2">
                  Sous-total: {formatCurrency(item.price * item.quantity)}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-[#34D399]/20 p-6 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-[#A0A0A0]">
                <span>Sous-total:</span>
                <span>{formatCurrency(getSubtotal())}</span>
              </div>
              <div className="flex justify-between text-[#A0A0A0]">
                <span>Livraison:</span>
                <span>{formatCurrency(1000)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-white border-t border-[#34D399]/20 pt-2">
                <span>Total:</span>
                <span>{formatCurrency(getTotal())}</span>
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
                navigate('/checkout');
              }}
              className="w-full py-3 bg-gradient-to-r from-[#FF6B35] to-orange-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-[#FF6B35]/50 transition"
            >
              Commander
            </button>
          </div>
        )}
      </div>
    </>
  );
}
