import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const isWishlisted = isInWishlist(product.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="minimal-card group relative flex flex-col h-full bg-white"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-zinc-50 p-8">
        <Link to={`/product/${product.id}`}>
          <img
            src={product.images[0] || 'https://picsum.photos/seed/minimal/600/600'}
            alt={product.name}
            className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        </Link>
        <button
          onClick={() => toggleWishlist(product.id)}
          className={`absolute top-4 right-4 p-3 bg-white rounded-full shadow-sm transition-all duration-300 ${
            isWishlisted ? 'text-red-500' : 'text-zinc-300 hover:text-black'
          }`}
        >
          <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">
        <Link to={`/product/${product.id}`} className="text-base font-bold mb-1 hover:text-zinc-600 transition-colors line-clamp-1">
          {product.name}
        </Link>
        <p className="text-zinc-400 text-xs mb-3 line-clamp-2 leading-relaxed">
          {product.description || 'Premium quality product for your daily needs.'}
        </p>
        
        <div className="mt-auto flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-lg font-bold tracking-tight text-black">
              ${product.price.toLocaleString()}
            </p>
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={10}
                  className={i < Math.floor(product.rating) ? 'fill-black text-black' : 'text-zinc-200'}
                />
              ))}
              <span className="text-zinc-400 text-[10px] ml-1">({product.numReviews})</span>
            </div>
          </div>
          
          <button
            onClick={() => addToCart(product)}
            className="bg-black text-white p-3 rounded-xl hover:bg-zinc-800 transition-all duration-300 shadow-sm"
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
