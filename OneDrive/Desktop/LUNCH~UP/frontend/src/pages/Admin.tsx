import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import MainLayout from '../components/layout/MainLayout';
import AdminDashboard from './AdminDashboard';

export default function Admin() {
  const navigate = useNavigate();
  const { token, login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    if (token) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [token, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(formData.email, formData.password);

      toast.success('Connexion réussie');
      setFormData({ email: '', password: '' });

      // The useEffect will handle the redirect when token is set
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  if (token) {
    return <AdminDashboard />;
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
        <div className="bg-[#1A1A1A] border border-[#34D399]/20 p-8 rounded-xl w-full max-w-md">
          <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-[#FF6B35] to-orange-500 bg-clip-text text-transparent">
            LunchUp Admin
          </h1>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-white text-sm font-bold mb-2">Email</label>
              <input
                type="email"
                placeholder="lucky@lunchup.cm"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
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

            <div className="text-center text-sm text-[#A0A0A0]">
              Email de test: <span className="text-[#34D399] font-mono">lucky@lunchup.cm</span>
              <br />
              Mot de passe de test: <span className="text-[#34D399] font-mono">A8FBB859@lucky</span>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
}
