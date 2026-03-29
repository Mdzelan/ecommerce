import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, X, Heart, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-serif font-bold tracking-widest text-black">AURELIUS</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-sm uppercase tracking-widest hover:text-zinc-500 transition-colors">Home</Link>
            <Link to="/shop" className="text-sm uppercase tracking-widest hover:text-zinc-500 transition-colors">Shop</Link>
            <Link to="/about" className="text-sm uppercase tracking-widest hover:text-zinc-500 transition-colors">About Us</Link>
            {isAdmin && (
              <Link to="/admin" className="text-sm uppercase tracking-widest text-black font-bold hover:text-zinc-500 transition-colors">Admin</Link>
            )}
          </div>

          {/* Icons */}
          <div className="hidden md:flex items-center space-x-6">
            <button className="hover:text-zinc-500 transition-colors"><Search size={20} /></button>
            <Link to="/wishlist" className="relative hover:text-zinc-500 transition-colors">
              <Heart size={20} />
              {wishlist.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>
            <Link to="/cart" className="relative hover:text-zinc-500 transition-colors">
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/profile" className="hover:text-zinc-500 transition-colors"><User size={20} /></Link>
                <button onClick={handleLogout} className="hover:text-zinc-500 transition-colors"><LogOut size={20} /></button>
              </div>
            ) : (
              <Link to="/login" className="text-sm uppercase tracking-widest border border-black px-4 py-2 hover:bg-black hover:text-white transition-all">Login</Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <Link to="/wishlist" className="relative">
              <Heart size={20} />
              {wishlist.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>
            <Link to="/cart" className="relative">
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-black">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-zinc-100 py-4 px-4 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <Link to="/" className="block text-sm uppercase tracking-widest py-2" onClick={() => setIsMenuOpen(false)}>Home</Link>
          <Link to="/shop" className="block text-sm uppercase tracking-widest py-2" onClick={() => setIsMenuOpen(false)}>Shop</Link>
          <Link to="/about" className="block text-sm uppercase tracking-widest py-2" onClick={() => setIsMenuOpen(false)}>About Us</Link>
          {isAdmin && (
            <Link to="/admin" className="block text-sm uppercase tracking-widest py-2 text-black font-bold" onClick={() => setIsMenuOpen(false)}>Admin</Link>
          )}
          <div className="pt-4 border-t border-zinc-100 flex justify-between items-center">
            {user ? (
              <>
                <Link to="/profile" className="text-sm uppercase tracking-widest" onClick={() => setIsMenuOpen(false)}>Profile</Link>
                <button onClick={handleLogout} className="text-sm uppercase tracking-widest text-red-500">Logout</button>
              </>
            ) : (
              <Link to="/login" className="text-sm uppercase tracking-widest text-black font-bold" onClick={() => setIsMenuOpen(false)}>Login / Register</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
