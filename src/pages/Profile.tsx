import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Order, Product } from '../types';
import { User, MapPin, Package, Heart, Save, Loader2, LogOut, ChevronRight, ShoppingBag, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

const Profile: React.FC = () => {
  const { user, profile, updateProfileData } = useAuth();
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'info' | 'address' | 'orders' | 'wishlist'>('info');
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    displayName: profile?.displayName || '',
    email: profile?.email || '',
    shippingAddress: {
      fullName: profile?.shippingAddress?.fullName || '',
      address: profile?.shippingAddress?.address || '',
      city: profile?.shippingAddress?.city || '',
      postalCode: profile?.shippingAddress?.postalCode || '',
      country: profile?.shippingAddress?.country || '',
    }
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || '',
        email: profile.email || '',
        shippingAddress: {
          fullName: profile.shippingAddress?.fullName || '',
          address: profile.shippingAddress?.address || '',
          city: profile.shippingAddress?.city || '',
          postalCode: profile.shippingAddress?.postalCode || '',
          country: profile.shippingAddress?.country || '',
        }
      });
    }
  }, [profile]);

  useEffect(() => {
    if (user && activeTab === 'orders') {
      fetchOrders();
    }
    if (user && activeTab === 'wishlist') {
      fetchWishlist();
    }
  }, [user, activeTab, wishlist]);

  const fetchOrders = async () => {
    if (!user) return;
    setLoadingOrders(true);
    try {
      const q = query(
        collection(db, 'orders'),
        where('userId', '==', user.uid)
      );
      const querySnapshot = await getDocs(q);
      const fetchedOrders = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Order))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(fetchedOrders);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'orders');
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchWishlist = async () => {
    if (wishlist.length === 0) {
      setWishlistProducts([]);
      return;
    }
    setLoadingWishlist(true);
    try {
      const q = query(collection(db, 'products'), where('__name__', 'in', wishlist));
      const querySnapshot = await getDocs(q);
      const products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setWishlistProducts(products);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoadingWishlist(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfileData({
        displayName: formData.displayName,
        shippingAddress: formData.shippingAddress
      });
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-8">Please Sign In</h1>
        <p className="text-zinc-500 mb-12">You need to be logged in to view your profile.</p>
        <Link to="/login" className="minimal-button px-12">Sign In</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
        <div className="space-y-2">
          <h1 className="text-5xl font-bold tracking-tight">Account</h1>
          <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">Manage your profile, orders, and wishlist</p>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center space-x-2 text-zinc-400 hover:text-red-500 transition-all font-bold uppercase tracking-widest text-xs"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-16">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1 space-y-2">
          {[
            { id: 'info', label: 'Personal Info', icon: User },
            { id: 'address', label: 'Shipping Address', icon: MapPin },
            { id: 'orders', label: 'Order History', icon: Package },
            { id: 'wishlist', label: 'My Wishlist', icon: Heart },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all font-bold text-sm uppercase tracking-widest ${
                activeTab === tab.id 
                  ? 'bg-black text-white shadow-xl' 
                  : 'bg-white text-zinc-400 hover:bg-zinc-50 hover:text-black'
              }`}
            >
              <div className="flex items-center space-x-4">
                <tab.icon size={18} />
                <span>{tab.label}</span>
              </div>
              <ChevronRight size={16} className={activeTab === tab.id ? 'opacity-100' : 'opacity-0'} />
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {activeTab === 'info' && (
              <motion.div
                key="info"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="minimal-card p-12 bg-white space-y-12"
              >
                <h2 className="text-3xl font-bold tracking-tight">Personal Information</h2>
                <form onSubmit={handleUpdateProfile} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Full Name</label>
                      <input 
                        type="text" 
                        className="minimal-input w-full" 
                        value={formData.displayName} 
                        onChange={(e) => setFormData({...formData, displayName: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Email Address</label>
                      <input 
                        type="email" 
                        disabled 
                        className="minimal-input w-full opacity-50 cursor-not-allowed" 
                        value={formData.email} 
                      />
                      <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Email cannot be changed here</p>
                    </div>
                  </div>
                  <div className="pt-8">
                    <button 
                      type="submit" 
                      disabled={isSaving}
                      className="minimal-button w-full flex items-center justify-center space-x-3 py-5 disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />}
                      <span className="text-lg">{isSaving ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {activeTab === 'address' && (
              <motion.div
                key="address"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="minimal-card p-12 bg-white space-y-12"
              >
                <h2 className="text-3xl font-bold tracking-tight">Shipping Address</h2>
                <form onSubmit={handleUpdateProfile} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="md:col-span-2 space-y-3">
                      <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Full Name</label>
                      <input 
                        type="text" 
                        className="minimal-input w-full" 
                        value={formData.shippingAddress.fullName} 
                        onChange={(e) => setFormData({...formData, shippingAddress: {...formData.shippingAddress, fullName: e.target.value}})} 
                      />
                    </div>
                    <div className="md:col-span-2 space-y-3">
                      <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Street Address</label>
                      <input 
                        type="text" 
                        className="minimal-input w-full" 
                        value={formData.shippingAddress.address} 
                        onChange={(e) => setFormData({...formData, shippingAddress: {...formData.shippingAddress, address: e.target.value}})} 
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">City</label>
                      <input 
                        type="text" 
                        className="minimal-input w-full" 
                        value={formData.shippingAddress.city} 
                        onChange={(e) => setFormData({...formData, shippingAddress: {...formData.shippingAddress, city: e.target.value}})} 
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Postal Code</label>
                      <input 
                        type="text" 
                        className="minimal-input w-full" 
                        value={formData.shippingAddress.postalCode} 
                        onChange={(e) => setFormData({...formData, shippingAddress: {...formData.shippingAddress, postalCode: e.target.value}})} 
                      />
                    </div>
                    <div className="md:col-span-2 space-y-3">
                      <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Country</label>
                      <input 
                        type="text" 
                        className="minimal-input w-full" 
                        value={formData.shippingAddress.country} 
                        onChange={(e) => setFormData({...formData, shippingAddress: {...formData.shippingAddress, country: e.target.value}})} 
                      />
                    </div>
                  </div>
                  <div className="pt-8">
                    <button 
                      type="submit" 
                      disabled={isSaving}
                      className="minimal-button w-full flex items-center justify-center space-x-3 py-5 disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />}
                      <span className="text-lg">{isSaving ? 'Saving...' : 'Save Address'}</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {activeTab === 'orders' && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <h2 className="text-3xl font-bold tracking-tight mb-8">Order History</h2>
                {loadingOrders ? (
                  <div className="flex justify-center py-20">
                    <Loader2 size={48} className="animate-spin text-zinc-200" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="minimal-card p-20 text-center bg-white">
                    <Package size={48} className="mx-auto text-zinc-100 mb-6" />
                    <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">You haven't placed any orders yet.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div key={order.id} className="minimal-card bg-white p-8 space-y-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-50 pb-6">
                          <div>
                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Order ID</p>
                            <p className="font-mono font-bold text-sm">#{order.id.substring(0, 8).toUpperCase()}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Date</p>
                            <p className="font-bold text-sm">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Status</p>
                            <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                              order.status === 'delivered' ? 'bg-green-50 text-green-600' :
                              order.status === 'shipped' ? 'bg-blue-50 text-blue-600' :
                              'bg-zinc-100 text-zinc-600'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                          <div>
                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Total</p>
                            <p className="font-bold text-lg">${order.totalAmount.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-4">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="w-16 h-16 bg-zinc-50 rounded-xl overflow-hidden border border-zinc-100 flex items-center justify-center p-2">
                              <img src={item.image} alt={item.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'wishlist' && (
              <motion.div
                key="wishlist"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-bold tracking-tight">My Wishlist</h2>
                  <Link to="/wishlist" className="text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-black transition-all">View All</Link>
                </div>
                {loadingWishlist ? (
                  <div className="flex justify-center py-20">
                    <Loader2 size={48} className="animate-spin text-zinc-200" />
                  </div>
                ) : wishlistProducts.length === 0 ? (
                  <div className="minimal-card p-20 text-center bg-white">
                    <Heart size={48} className="mx-auto text-zinc-100 mb-6" />
                    <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">Your wishlist is empty.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {wishlistProducts.map((product) => (
                      <div key={product.id} className="minimal-card bg-white p-6 flex items-center space-x-6">
                        <div className="w-24 h-24 bg-zinc-50 rounded-2xl flex items-center justify-center overflow-hidden p-4">
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                        </div>
                        <div className="flex-grow space-y-2">
                          <Link to={`/product/${product.id}`} className="font-bold text-sm hover:text-zinc-600 transition-colors line-clamp-1">{product.name}</Link>
                          <p className="text-lg font-bold">${product.price.toLocaleString()}</p>
                          <div className="flex items-center space-x-4 pt-2">
                            <button 
                              onClick={() => addToCart(product)}
                              className="text-[10px] font-bold uppercase tracking-widest text-black flex items-center space-x-2 hover:opacity-70"
                            >
                              <ShoppingBag size={14} />
                              <span>Add to Cart</span>
                            </button>
                            <button 
                              onClick={() => toggleWishlist(product.id)}
                              className="text-[10px] font-bold uppercase tracking-widest text-red-500 flex items-center space-x-2 hover:opacity-70"
                            >
                              <Trash2 size={14} />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Profile;
