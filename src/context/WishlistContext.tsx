import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types';
import { useAuth } from './AuthContext';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'sonner';

interface WishlistContextType {
  wishlist: string[];
  toggleWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setWishlist(userDoc.data().wishlist || []);
          }
        } catch (error) {
          console.error('Error fetching wishlist:', error);
        }
      } else {
        const savedWishlist = localStorage.getItem('wishlist');
        setWishlist(savedWishlist ? JSON.parse(savedWishlist) : []);
      }
    };

    fetchWishlist();
  }, [user]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }
  }, [wishlist, user]);

  const toggleWishlist = async (productId: string) => {
    const isCurrentlyIn = wishlist.includes(productId);
    
    if (user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        if (isCurrentlyIn) {
          await updateDoc(userRef, {
            wishlist: arrayRemove(productId)
          });
          setWishlist(prev => prev.filter(id => id !== productId));
          toast.success('Removed from wishlist');
        } else {
          await updateDoc(userRef, {
            wishlist: arrayUnion(productId)
          });
          setWishlist(prev => [...prev, productId]);
          toast.success('Added to wishlist');
        }
      } catch (error) {
        console.error('Error updating wishlist:', error);
        toast.error('Failed to update wishlist');
      }
    } else {
      if (isCurrentlyIn) {
        setWishlist(prev => prev.filter(id => id !== productId));
        toast.success('Removed from wishlist');
      } else {
        setWishlist(prev => [...prev, productId]);
        toast.success('Added to wishlist');
      }
    }
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
