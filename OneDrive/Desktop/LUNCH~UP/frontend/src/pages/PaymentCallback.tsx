import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import MainLayout from '../components/layout/MainLayout';

const PaymentCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying');
  const navigate = useNavigate();

  useEffect(() => {
    const verifyPayment = async () => {
      const reference = searchParams.get('reference');
      const trxref = searchParams.get('trxref');

      try {
        // Trouver commande par référence
        const response = await axios.get(`/api/orders/payment/verify/${reference || trxref}`);

        if (response.data.status === 'complete') {
          setStatus('success');
          setTimeout(() => {
            navigate('/confirmation', { state: { orderNumber: response.data.orderNumber }});
          }, 2000);
        } else {
          setStatus('failed');
        }
      } catch (error) {
        setStatus('error');
      }
    };

    verifyPayment();
  }, []);

  return (
    <MainLayout>
      <div className="payment-callback min-h-screen flex items-center justify-center">
        {status === 'verifying' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#FF6B35]"></div>
            <p className="text-white text-xl mt-4">Vérification du paiement...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="success text-center">
            <h1 className="text-4xl font-bold text-green-500 mb-4">✅ Paiement réussi!</h1>
            <p className="text-white text-lg mb-4">Votre commande a été confirmée.</p>
            <p className="text-[#A0A0A0]">Redirection...</p>
          </div>
        )}

        {status === 'failed' && (
          <div className="error text-center">
            <h1 className="text-4xl font-bold text-red-500 mb-4">❌ Paiement échoué</h1>
            <p className="text-white text-lg mb-8">Le paiement n'a pas abouti.</p>
            <button
              onClick={() => navigate('/menu')}
              className="px-8 py-3 bg-[#FF6B35] text-white font-bold rounded-lg hover:bg-orange-600 transition"
            >
              Retour au menu
            </button>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default PaymentCallbackPage;
