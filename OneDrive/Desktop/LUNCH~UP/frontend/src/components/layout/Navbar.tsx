import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useCartStore } from '../../store/cartstore';
import CartSidebar from '../Cart';
import logo from '../../assets/logo/lunchup-logo.png';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cartItems = useCartStore((state) => state.items);
  const navigate = useNavigate();

  const cartCount = cartItems.length;

  return (
    <>
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    <nav className="bg-gradient-to-r from-[#0A0A0A] to-[#1A1A1A] border-b border-[#34D399]/20 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-40">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-0">
            <img src={logo} alt="LunchUp Logo" className="h-36 object-contain" />
            <span className="text-xl font-bold text-white hidden sm:inline">LunchUp</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-[#D1D5DB] hover:text-white transition">
              Accueil
            </Link>
            <Link to="/menu" className="text-[#D1D5DB] hover:text-white transition">
              Menu
            </Link>
            <Link to="/community" className="text-[#D1D5DB] hover:text-white transition">
              Communauté
            </Link>
            <a href="tel:+237691710289" className="text-[#D1D5DB] hover:text-white transition">
              Contact
            </a>
          </div>

          {/* Cart & Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 hover:bg-[#34D399]/10 rounded-lg transition"
            >
              <ShoppingCart size={24} className="text-[#FF6B35]" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-[#FF6B35] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => navigate('/admin/login')}
              className="hidden md:block px-4 py-2 text-sm font-medium text-[#A0A0A0] hover:text-white transition"
            >
              Admin
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-[#34D399]/10 rounded-lg transition"
            >
              {isMenuOpen ? (
                <X size={24} className="text-white" />
              ) : (
                <Menu size={24} className="text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 border-t border-[#34D399]/20 pt-4 space-y-3">
            <Link
              to="/"
              className="block text-[#D1D5DB] hover:text-white transition py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Accueil
            </Link>
            <Link
              to="/menu"
              className="block text-[#D1D5DB] hover:text-white transition py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Menu
            </Link>
            <Link
              to="/community"
              className="block text-[#D1D5DB] hover:text-white transition py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Communauté
            </Link>
            <a
              href="tel:+237691710289"
              className="block text-[#D1D5DB] hover:text-white transition py-2"
            >
              +237 6 91 71 02 89
            </a>
            <button
              onClick={() => {
                navigate('/admin/login');
                setIsMenuOpen(false);
              }}
              className="block w-full text-left text-[#D1D5DB] hover:text-white transition py-2"
            >
              Admin
            </button>
          </div>
        )}
      </div>
    </nav>
    </>
  );
}
