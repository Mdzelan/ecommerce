import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { toast } from 'sonner';
import { CreditCard, Truck, ShieldCheck, CheckCircle2, ArrowLeft, Smartphone } from 'lucide-react';
import { motion } from 'motion/react';

const Checkout: React.FC = () => {
  const { cart, totalPrice, clearCart } = useCart();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'creditCard' | 'bkash' | 'nagad'>('creditCard');
  const [merchantSettings, setMerchantSettings] = useState({ bkashNumber: '', nagadNumber: '' });

  const [formData, setFormData] = useState({
    fullName: profile?.shippingAddress?.fullName || profile?.displayName || '',
    email: user?.email || '',
    address: profile?.shippingAddress?.address || '',
    city: profile?.shippingAddress?.city || '',
    postalCode: profile?.shippingAddress?.postalCode || '',
    country: profile?.shippingAddress?.country || '',
    cardNumber: '',
    expiry: '',
    cvv: '',
    transactionId: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || profile.shippingAddress?.fullName || profile.displayName || '',
        address: prev.address || profile.shippingAddress?.address || '',
        city: prev.city || profile.shippingAddress?.city || '',
        postalCode: prev.postalCode || profile.shippingAddress?.postalCode || '',
        country: prev.country || profile.shippingAddress?.country || '',
      }));
    }
  }, [profile]);

  useEffect(() => {
    const fetchMerchantSettings = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'settings', 'contact'));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setMerchantSettings({
            bkashNumber: data.bkashNumber || '',
            nagadNumber: data.nagadNumber || ''
          });
        }
      } catch (error) {
        console.error('Error fetching merchant settings:', error);
      }
    };
    fetchMerchantSettings();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if ((paymentMethod === 'bkash' || paymentMethod === 'nagad') && !formData.transactionId) {
      toast.error('Please provide the transaction ID');
      return;
    }

    setIsProcessing(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      const orderData = {
        userId: user.uid,
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.images[0]
        })),
        totalAmount: totalPrice,
        status: 'pending',
        shippingAddress: {
          fullName: formData.fullName,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country
        },
        paymentMethod: paymentMethod === 'creditCard' ? 'Credit Card' : paymentMethod === 'bkash' ? 'bKash' : 'Nagad',
        transactionId: paymentMethod !== 'creditCard' ? formData.transactionId : null,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'orders'), orderData);
      setIsSuccess(true);
      clearCart();
      toast.success('Order placed successfully');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'orders');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-8"
        >
          <div className="w-32 h-32 bg-zinc-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={64} className="text-black" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Order Confirmed</h1>
          <p className="text-zinc-500 max-w-md mx-auto">Thank you for your purchase. Your order has been received and is being prepared with the utmost care.</p>
          <div className="pt-8">
            <button onClick={() => navigate('/')} className="minimal-button px-12">Return to Home</button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="flex items-center space-x-4 mb-12">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-4xl font-bold tracking-tight">Checkout</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* Shipping & Payment */}
        <div className="lg:col-span-2 space-y-16">
          {/* Shipping */}
          <section className="space-y-10">
            <div className="flex items-center space-x-4 border-b border-zinc-100 pb-6">
              <div className="p-3 bg-zinc-100 rounded-2xl">
                <Truck size={24} className="text-black" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Shipping Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Full Name</label>
                <input type="text" name="fullName" required className="minimal-input w-full" value={formData.fullName} onChange={handleInputChange} />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Email Address</label>
                <input type="email" name="email" required className="minimal-input w-full" value={formData.email} onChange={handleInputChange} />
              </div>
              <div className="md:col-span-2 space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Shipping Address</label>
                <input type="text" name="address" required className="minimal-input w-full" value={formData.address} onChange={handleInputChange} />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">City</label>
                <input type="text" name="city" required className="minimal-input w-full" value={formData.city} onChange={handleInputChange} />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Postal Code</label>
                <input type="text" name="postalCode" required className="minimal-input w-full" value={formData.postalCode} onChange={handleInputChange} />
              </div>
              <div className="md:col-span-2 space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Country</label>
                <input type="text" name="country" required className="minimal-input w-full" value={formData.country} onChange={handleInputChange} />
              </div>
            </div>
          </section>

          {/* Payment */}
          <section className="space-y-10">
            <div className="flex items-center space-x-4 border-b border-zinc-100 pb-6">
              <div className="p-3 bg-zinc-100 rounded-2xl">
                <CreditCard size={24} className="text-black" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Payment Method</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setPaymentMethod('creditCard')}
                className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center space-y-3 ${
                  paymentMethod === 'creditCard' ? 'border-black bg-zinc-50' : 'border-zinc-100 hover:border-zinc-200'
                }`}
              >
                <CreditCard size={24} />
                <span className="text-xs font-bold uppercase tracking-widest">Card</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('bkash')}
                className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center space-y-3 ${
                  paymentMethod === 'bkash' ? 'border-pink-500 bg-pink-50' : 'border-zinc-100 hover:border-zinc-200'
                }`}
              >
                <Smartphone size={24} className="text-pink-500" />
                <span className="text-xs font-bold uppercase tracking-widest">bKash</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('nagad')}
                className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center space-y-3 ${
                  paymentMethod === 'nagad' ? 'border-orange-500 bg-orange-50' : 'border-zinc-100 hover:border-zinc-200'
                }`}
              >
                <Smartphone size={24} className="text-orange-500" />
                <span className="text-xs font-bold uppercase tracking-widest">Nagad</span>
              </button>
            </div>

            {paymentMethod === 'creditCard' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-300">
                <div className="md:col-span-2 space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Card Number</label>
                  <input type="text" name="cardNumber" required={paymentMethod === 'creditCard'} placeholder="0000 0000 0000 0000" className="minimal-input w-full" value={formData.cardNumber} onChange={handleInputChange} />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Expiry Date</label>
                  <input type="text" name="expiry" required={paymentMethod === 'creditCard'} placeholder="MM/YY" className="minimal-input w-full" value={formData.expiry} onChange={handleInputChange} />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">CVV</label>
                  <input type="text" name="cvv" required={paymentMethod === 'creditCard'} placeholder="000" className="minimal-input w-full" value={formData.cvv} onChange={handleInputChange} />
                </div>
              </div>
            ) : (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="p-8 bg-zinc-50 rounded-3xl border border-zinc-100 space-y-4">
                  <p className="text-sm font-medium text-zinc-600">
                    Please send <span className="text-black font-bold">${totalPrice.toLocaleString()}</span> to the following {paymentMethod === 'bkash' ? 'bKash' : 'Nagad'} merchant number:
                  </p>
                  <p className="text-3xl font-bold tracking-tighter text-black">
                    {paymentMethod === 'bkash' ? merchantSettings.bkashNumber || 'Not set' : merchantSettings.nagadNumber || 'Not set'}
                  </p>
                  <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">
                    Use "Payment" option in your {paymentMethod === 'bkash' ? 'bKash' : 'Nagad'} app.
                  </p>
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Transaction ID</label>
                  <input 
                    type="text" 
                    name="transactionId" 
                    required 
                    placeholder="Enter your transaction ID" 
                    className="minimal-input w-full" 
                    value={formData.transactionId} 
                    onChange={handleInputChange} 
                  />
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="minimal-card p-10 bg-white sticky top-32">
            <h2 className="text-2xl font-bold mb-8 tracking-tight">Order Summary</h2>
            
            <div className="space-y-6 mb-8 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-zinc-50 rounded-xl flex items-center justify-center overflow-hidden">
                      <img src={item.images[0]} alt={item.name} className="w-full h-full object-contain p-2" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <p className="text-sm font-bold line-clamp-1">{item.name}</p>
                      <p className="text-xs text-zinc-400 font-bold">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold">${(item.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>

            <div className="space-y-4 mb-10 pt-8 border-t border-zinc-100">
              <div className="flex justify-between text-zinc-500 font-medium">
                <span>Subtotal</span>
                <span className="text-black font-bold">${totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-zinc-500 font-medium">
                <span>Shipping</span>
                <span className="text-black font-bold uppercase text-[10px] tracking-widest">Free</span>
              </div>
              <div className="flex justify-between text-2xl font-bold pt-6 border-t border-zinc-100">
                <span>Total</span>
                <span>${totalPrice.toLocaleString()}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="minimal-button w-full flex items-center justify-center space-x-3 py-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <ShieldCheck size={20} />
                  <span className="text-lg">Complete Order</span>
                </>
              )}
            </button>
            
            <p className="mt-8 text-[10px] text-zinc-400 font-bold uppercase tracking-widest text-center">
              Your data is encrypted and secure.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
