import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { ChevronDown, Search, X } from 'lucide-react';
import { motion } from 'motion/react';

const Shop: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const categoryFilter = searchParams.get('category') || 'All';
  const sortFilter = searchParams.get('sort') || 'newest';

  const categories = ['All', 'Watches', 'Bags', 'Jewelry', 'Accessories'];

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let q = query(collection(db, 'products'));
        
        if (categoryFilter !== 'All') {
          q = query(q, where('category', '==', categoryFilter));
        }

        const querySnapshot = await getDocs(q);
        let results = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));

        // Client-side sorting and searching
        if (searchTerm) {
          results = results.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        if (sortFilter === 'price-low') {
          results.sort((a, b) => a.price - b.price);
        } else if (sortFilter === 'price-high') {
          results.sort((a, b) => b.price - a.price);
        } else if (sortFilter === 'rating') {
          results.sort((a, b) => b.rating - a.rating);
        }

        setProducts(results);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [categoryFilter, sortFilter, searchTerm]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-8 md:space-y-0">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">The Shop</h1>
          <p className="text-zinc-400 text-sm font-bold uppercase tracking-widest">Showing {products.length} products</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-grow md:flex-grow-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input
              type="text"
              placeholder="Search products..."
              className="minimal-input pl-12 w-full md:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black">
                <X size={16} />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              className="minimal-input appearance-none pr-12 cursor-pointer bg-white"
              value={categoryFilter}
              onChange={(e) => setSearchParams({ category: e.target.value, sort: sortFilter })}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400" size={16} />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              className="minimal-input appearance-none pr-12 cursor-pointer bg-white"
              value={sortFilter}
              onChange={(e) => setSearchParams({ category: categoryFilter, sort: e.target.value })}
            >
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400" size={16} />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-square bg-white rounded-[2rem] border border-zinc-100 animate-pulse"></div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-32 bg-white rounded-[3rem] border border-zinc-100">
          <Search size={64} className="mx-auto text-zinc-100 mb-6" />
          <p className="text-zinc-400 font-bold uppercase tracking-widest text-sm mb-8">No products found matching your criteria.</p>
          <button
            onClick={() => { setSearchTerm(''); setSearchParams({ category: 'All', sort: 'newest' }); }}
            className="minimal-button px-12"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default Shop;
