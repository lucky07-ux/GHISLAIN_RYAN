import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { walletService } from '../services/walletService';
import { formatCurrency } from '../utils/formatters';

interface CashbackTransaction {
  date: string;
  amount: number;
  type: 'earned' | 'used';
  orderId?: string;
  description: string;
}

interface WalletData {
  cashbackHistory: CashbackTransaction[];
  totalEarned: number;
  totalUsed: number;
  currentBalance: number;
}

export default function CashbackHistory() {
  const navigate = useNavigate();
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      const res = await walletService.getCashbackHistory();
      setWalletData(res);
    } catch (err) {
      toast.error('Erreur chargement portefeuille');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWalletData();
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Wallet className="text-[#34D399]" size={32} />
            <div>
              <h1 className="text-3xl font-bold">Mon Portefeuille</h1>
              <p className="text-[#A0A0A0]">Historique cashback</p>
            </div>
          </div>
          <button
            onClick={loadWalletData}
            className="p-2 bg-[#34D399]/20 border border-[#34D399]/30 rounded-lg hover:bg-[#34D399]/30 transition"
          >
            <RefreshCw size={20} />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-[#A0A0A0]">Chargement...</p>
          </div>
        ) : walletData ? (
          <>
            {/* Solde Actuel */}
            <div className="bg-gradient-to-br from-[#34D399] to-[#1A1A1A] border border-[#34D399]/30 p-8 rounded-2xl mb-8">
              <p className="text-[#A0A0A0] text-sm mb-2">Solde actuel</p>
              <p className="text-4xl font-bold text-white">{formatCurrency(walletData.currentBalance)}</p>
              <p className="text-[#A0A0A0] text-sm mt-2">FCFA</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-[#1A1A1A] border border-green-500/30 p-6 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={20} className="text-green-500" />
                  <p className="text-[#A0A0A0] text-sm">Total gagné</p>
                </div>
                <p className="text-2xl font-bold text-green-400">{formatCurrency(walletData.totalEarned)}</p>
              </div>

              <div className="bg-[#1A1A1A] border border-orange-500/30 p-6 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown size={20} className="text-orange-500" />
                  <p className="text-[#A0A0A0] text-sm">Total utilisé</p>
                </div>
                <p className="text-2xl font-bold text-orange-400">{formatCurrency(walletData.totalUsed)}</p>
              </div>
            </div>

            {/* Historique */}
            <div className="bg-[#1A1A1A] border border-[#34D399]/20 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-[#34D399]/20">
                <h2 className="font-bold text-lg">Historique des transactions</h2>
              </div>

              {walletData.cashbackHistory.length === 0 ? (
                <div className="p-8 text-center">
                  <Wallet size={48} className="mx-auto text-[#A0A0A0] mb-4 opacity-50" />
                  <p className="text-[#A0A0A0]">Aucune transaction</p>
                </div>
              ) : (
                <div className="divide-y divide-[#34D399]/10">
                  {walletData.cashbackHistory.map((transaction, idx) => (
                    <div key={idx} className="p-6 hover:bg-[#0A0A0A]/50 transition flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${
                          transaction.type === 'earned'
                            ? 'bg-green-500/20'
                            : 'bg-orange-500/20'
                        }`}>
                          {transaction.type === 'earned' ? (
                            <TrendingUp size={20} className="text-green-500" />
                          ) : (
                            <TrendingDown size={20} className="text-orange-500" />
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium">{transaction.description}</p>
                          <p className="text-xs text-[#A0A0A0]">
                            {new Date(transaction.date).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                      <p className={`text-lg font-bold ${
                        transaction.type === 'earned'
                          ? 'text-green-400'
                          : 'text-orange-400'
                      }`}>
                        {transaction.type === 'earned' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="bg-[#1A1A1A] border border-[#34D399]/20 p-8 rounded-xl text-center">
            <p className="text-[#A0A0A0]">Impossible de charger le portefeuille</p>
          </div>
        )}
      </div>
    </div>
  );
}
