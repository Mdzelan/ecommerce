import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types';
import { Trash2, ShoppingBag, Heart, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

const Wishlist: React.FC = () => {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      if (wishlist.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        const q = query(collection(db, 'products'), where('__name__', 'in', wishlist));
        const querySnapshot = await getDocs(q);
        const fetchedProducts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Product[];
        setProducts(fetchedProducts);
      } catch (error) {
        console.error('Error fetching wishlist products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistProducts();
  }, [wishlist]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-50">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-8"
        >
          <div className="w-32 h-32 bg-zinc-100 rounded-full flex items-center justify-center mx-auto">
            <Heart size={48} className="text-zinc-400" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Your Wishlist is Empty</h1>
          <p className="text-zinc-500 max-w-md mx-auto">Save your favorite pieces here to keep track of what you love.</p>
          <Link to="/shop" className="minimal-button inline-block px-12">Explore Collection</Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <h1 className="text-4xl font-bold tracking-tight mb-12">Your Wishlist</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {products.map((product) => (
          <motion.div
            key={product.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="minimal-card group bg-white p-8"
          >
            <div className="relative aspect-square overflow-hidden bg-zinc-50 rounded-2xl mb-8 flex items-center justify-center">
              <img 
                src={product.images[0]} 
                alt={product.name} 
                className="w-full h-full object-contain p-8 group-hover:scale-110 transition-transform duration-700" 
                referrerPolicy="no-referrer" 
              />
              <button
                onClick={() => toggleWishlist(product.id)}
                className="absolute top-6 right-6 p-3 bg-white rounded-full shadow-sm hover:text-red-500 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-2">{product.category}</p>
                  <Link to={`/product/${product.id}`} className="text-xl font-bold hover:text-zinc-600 transition-colors">{product.name}</Link>
                </div>
                <p className="text-xl font-bold">${product.price.toLocaleString()}</p>
              </div>

              <div className="pt-6 flex gap-4">
                <button
                  onClick={() => addToCart(product)}
                  className="minimal-button flex-grow flex items-center justify-center space-x-3 py-4"
                >
                  <ShoppingBag size={18} />
                  <span>Add to Cart</span>
                </button>
                <Link 
                  to={`/product/${product.id}`}
                  className="p-4 bg-zinc-100 rounded-2xl hover:bg-zinc-200 transition-colors"
                >
                  <ArrowRight size={20} />
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
