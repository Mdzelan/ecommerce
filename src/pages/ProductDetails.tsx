import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Product, Review } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { Star, ShoppingBag, ArrowLeft, Heart, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Description');
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const { addToCart } = useCart();
  const { user, profile } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() } as Product);
          
          // Fetch reviews
          const reviewsQuery = query(collection(db, 'reviews'), where('productId', '==', id));
          const reviewsSnap = await getDocs(reviewsQuery);
          setReviews(reviewsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Review)));
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `products/${id}`);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) {
      toast.error('Please login to leave a review');
      return;
    }
    if (!id) return;

    try {
      const reviewData = {
        productId: id,
        userId: user.uid,
        userName: profile.displayName,
        rating: newReview.rating,
        comment: newReview.comment,
        createdAt: new Date().toISOString()
      };
      await addDoc(collection(db, 'reviews'), reviewData);
      setReviews(prev => [...prev, { id: 'temp', ...reviewData }]);
      setNewReview({ rating: 5, comment: '' });
      toast.success('Review submitted successfully');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'reviews');
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-zinc-50"><div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div></div>;
  if (!product) return <div className="h-screen flex items-center justify-center bg-zinc-50 text-black">Product not found.</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="flex justify-between items-center">
        <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-full shadow-sm hover:bg-zinc-100 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold tracking-tight">{product.name}</h1>
        <button 
          onClick={() => toggleWishlist(product.id)}
          className={`p-3 bg-white rounded-full shadow-sm transition-all duration-300 ${
            isInWishlist(product.id) ? 'text-red-500' : 'hover:bg-zinc-100'
          }`}
        >
          <Heart size={20} fill={isInWishlist(product.id) ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Product Image & Price */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative aspect-square bg-white rounded-[3rem] shadow-sm border border-zinc-100 p-12 flex items-center justify-center overflow-hidden"
      >
        <img
          src={product.images[0] || 'https://picsum.photos/seed/minimal/800/800'}
          alt={product.name}
          className="w-full h-full object-contain"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-8 right-8 bg-black text-white px-6 py-3 rounded-2xl font-bold text-lg shadow-lg">
          ${product.price.toLocaleString()}
        </div>
        
        {/* Image Pagination Dots */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-black w-4' : 'bg-zinc-300'}`}></div>
          ))}
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="space-y-8">
        <div className="flex justify-between border-b border-zinc-100">
          {['Description', 'Suggested Use', 'Benefits'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-bold transition-all relative ${
                activeTab === tab ? 'text-black' : 'text-zinc-400'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-black rounded-full" />
              )}
            </button>
          ))}
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-zinc-500 leading-relaxed"
        >
          {activeTab === 'Description' && (
            <p>{product.description || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'}</p>
          )}
          {activeTab === 'Suggested Use' && (
            <p>Apply a small amount to clean, dry skin twice daily. Massage gently until fully absorbed. For best results, use consistently as part of your daily skincare routine.</p>
          )}
          {activeTab === 'Benefits' && (
            <ul className="list-disc list-inside space-y-2">
              <li>Deeply hydrates and nourishes the skin</li>
              <li>Reduces the appearance of fine lines and wrinkles</li>
              <li>Improves skin elasticity and firmness</li>
              <li>Provides long-lasting moisture barrier</li>
            </ul>
          )}
        </motion.div>
      </div>

      {/* Order Button */}
      <div className="pt-8">
        <button
          onClick={() => { addToCart(product); toast.success('Added to cart'); }}
          className="w-full minimal-button py-6 text-lg"
        >
          Order
        </button>
      </div>

      {/* Reviews Section */}
      <section className="pt-12 border-t border-zinc-100 space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold tracking-tight">Client Reviews</h2>
          <div className="flex items-center space-x-2">
            <Star size={18} className="fill-black text-black" />
            <span className="font-bold">{product.rating.toFixed(1)}</span>
            <span className="text-zinc-400 text-sm">({product.numReviews})</span>
          </div>
        </div>

        {user && (
          <form onSubmit={handleAddReview} className="minimal-card p-8 space-y-6 bg-zinc-50 border-none">
            <h3 className="text-lg font-bold">Write a Review</h3>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setNewReview({ ...newReview, rating: star })}
                  className={star <= newReview.rating ? 'text-black' : 'text-zinc-200'}
                >
                  <Star size={24} className={star <= newReview.rating ? 'fill-black' : ''} />
                </button>
              ))}
            </div>
            <textarea
              className="minimal-input w-full h-32 resize-none bg-white"
              placeholder="Share your experience..."
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              required
            ></textarea>
            <button type="submit" className="minimal-button w-full">Submit Review</button>
          </form>
        )}

        <div className="space-y-6">
          {reviews.length > 0 ? (
            reviews.map((review, i) => (
              <div key={i} className="minimal-card p-8 bg-white">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <h4 className="font-bold">{review.userName}</h4>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} className={i < review.rating ? 'fill-black text-black' : 'text-zinc-200'} />
                      ))}
                    </div>
                  </div>
                  <span className="text-zinc-400 text-xs font-bold uppercase tracking-widest">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-zinc-500 leading-relaxed">{review.comment}</p>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-[2rem] border border-zinc-100">
              <MessageSquare size={48} className="mx-auto text-zinc-200 mb-4" />
              <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">No reviews yet.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ProductDetails;
