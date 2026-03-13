import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import MainLayout from '../../components/layout/MainLayout';

export default function VendorLogin() {
  const navigate = useNavigate();
  const { token, login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    if (token) {
      // if already logged in, redirect to appropriate dashboard
      navigate(token && localStorage.getItem('token') ? '/vendor/dashboard' : '/vendor/login', { replace: true });
    }
  }, [token, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login({
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        password: formData.password,
        role: 'vendor',
      });
      toast.success('Connexion réussie');
      setFormData({ phone: '', email: '', password: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  if (token) {
    return null;
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
        <div className="bg-[#1A1A1A] border border-[#34D399]/20 p-8 rounded-xl w-full max-w-md">
          <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-[#FF6B35] to-orange-500 bg-clip-text text-transparent">
            LunchUp Vendeur
          </h1>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-white text-sm font-bold mb-2">Téléphone ou email</label>
              <input
                type="text"
                placeholder="ex: +2376... ou mail@ex.com"
                value={formData.phone || formData.email}
                onChange={(e) => {
                  const val = e.target.value;
                  // simple heuristic: if contains @ treat as email
                  if (val.includes('@')) {
                    setFormData({ ...formData, email: val, phone: '' });
                  } else {
                    setFormData({ ...formData, phone: val, email: '' });
                  }
                }}
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#34D399]/30 rounded-lg text-white placeholder-[#666666] focus:outline-none focus:border-[#FF6B35] transition"
                required
              />
            </div>

            <div>
              <label className="block text-white text-sm font-bold mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#34D399]/30 rounded-lg text-white placeholder-[#666666] focus:outline-none focus:border-[#FF6B35] transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0A0A0] hover:text-white transition"
                >
                  {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-[#FF6B35] to-orange-500 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-[#FF6B35]/50 transition disabled:opacity-50"
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>
      </div>
    </MainLayout>
  );
}
