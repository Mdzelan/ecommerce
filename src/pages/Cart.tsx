import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';

const Cart: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-8"
        >
          <div className="w-32 h-32 bg-zinc-100 rounded-full flex items-center justify-center mx-auto">
            <ShoppingBag size={48} className="text-zinc-400" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Your Cart is Empty</h1>
          <p className="text-zinc-500 max-w-md mx-auto">Discover our curated selection of minimalist pieces and start building your personal collection today.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/shop" className="minimal-button inline-block px-12">Start Shopping</Link>
            <Link to="/shop" className="px-12 py-4 border border-zinc-200 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-zinc-50 transition-all">Continue Shopping</Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <h1 className="text-4xl font-bold tracking-tight mb-12">Your Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-8">
          {cart.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="minimal-card flex flex-col sm:flex-row gap-8 p-8 bg-white"
            >
              <div className="w-full sm:w-40 aspect-square overflow-hidden bg-zinc-50 rounded-2xl flex items-center justify-center">
                <img src={item.images[0]} alt={item.name} className="w-full h-full object-contain p-4" referrerPolicy="no-referrer" />
              </div>
              
              <div className="flex-grow flex flex-col justify-between py-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2">{item.category}</p>
                    <Link to={`/product/${item.id}`} className="text-xl font-bold hover:text-zinc-600 transition-colors">{item.name}</Link>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-zinc-300 hover:text-red-500 transition-colors bg-zinc-50 rounded-full"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="flex justify-between items-end mt-8">
                  <div className="flex items-center bg-zinc-50 rounded-2xl p-1">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-2 hover:bg-white rounded-xl transition-all"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-6 font-bold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-2 hover:bg-white rounded-xl transition-all"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <p className="text-2xl font-bold text-black">${(item.price * item.quantity).toLocaleString()}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="minimal-card p-10 bg-white sticky top-32">
            <h2 className="text-2xl font-bold mb-8 tracking-tight">Summary</h2>
            
            <div className="space-y-6 mb-10">
              <div className="flex justify-between text-zinc-500 font-medium">
                <span>Subtotal ({totalItems} items)</span>
                <span className="text-black">${totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-zinc-500 font-medium">
                <span>Shipping</span>
                <span className="text-black font-bold uppercase text-xs tracking-widest">Free</span>
              </div>
              <div className="flex justify-between text-zinc-500 font-medium">
                <span>Tax</span>
                <span className="text-black">Calculated at checkout</span>
              </div>
              <div className="pt-6 border-t border-zinc-100 flex justify-between text-2xl font-bold">
                <span>Total</span>
                <span>${totalPrice.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="minimal-button w-full flex items-center justify-center space-x-3 py-6"
            >
              <span className="text-lg">Checkout</span>
              <ArrowRight size={20} />
            </button>
            
            <div className="mt-10 pt-10 border-t border-zinc-100 space-y-6">
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest text-center">Secure Payment</p>
              <div className="flex justify-center space-x-6 opacity-40 grayscale">
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
