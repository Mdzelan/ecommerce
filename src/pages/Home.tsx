import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { motion } from 'motion/react';
import { ArrowRight, Search, SlidersHorizontal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const q = query(collection(db, 'products'), limit(8));
        const querySnapshot = await getDocs(q);
        const products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setFeaturedProducts(products);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'products');
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="space-y-12 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
      {/* Header Section */}
      <section className="relative overflow-hidden rounded-[3rem] bg-black text-white p-12 md:p-20">
        <div className="absolute top-8 right-8 flex space-x-4">
          <button className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
            <Search size={20} />
          </button>
          <button className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
            <SlidersHorizontal size={20} />
          </button>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl space-y-4"
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            Hi {user?.displayName?.split(' ')[0] || 'Guest'},
          </h1>
          <p className="text-zinc-400 text-xl md:text-2xl font-medium">
            We are ready to offer something special
          </p>
        </motion.div>

        <div className="mt-12 flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
          {['All', 'Watches', 'Bags', 'Jewelry', 'Accessories'].map((cat) => (
            <button
              key={cat}
              className={`px-8 py-3 rounded-2xl text-sm font-bold transition-all ${
                cat === 'All' ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Product Grid */}
      <section>
        <div className="flex justify-between items-end mb-10">
          <h2 className="text-3xl font-bold tracking-tight">New Arrivals</h2>
          <Link to="/shop" className="text-sm font-bold text-zinc-500 hover:text-black transition-colors flex items-center space-x-2">
            <span>View All</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square bg-white rounded-[2rem] animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Banner Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="minimal-card bg-zinc-100 p-12 flex flex-col justify-center space-y-6">
          <h3 className="text-4xl font-bold tracking-tight">Premium Collection</h3>
          <p className="text-zinc-500 text-lg">Experience the art of minimalist design with our latest pieces.</p>
          <div>
            <Link to="/shop" className="minimal-button inline-block">
              Shop Now
            </Link>
          </div>
        </div>
        <div className="rounded-[2rem] overflow-hidden h-[400px]">
          <img
            src="https://picsum.photos/seed/minimal-banner/800/600"
            alt="Banner"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      </section>
    </div>
  );
};

export default Home;
