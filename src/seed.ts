import { collection, addDoc, getDocs, query, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';

const products = [
  {
    name: "Aurelius Chronograph Gold",
    description: "A masterpiece of horology, featuring a 18k gold case and a precision Swiss movement. The dial is crafted from genuine mother-of-pearl, making each piece unique.",
    price: 12500,
    category: "Watches",
    images: ["https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&q=80&w=800"],
    stock: 5,
    rating: 4.9,
    numReviews: 12,
    featured: true,
    createdAt: new Date().toISOString()
  },
  {
    name: "Midnight Suede Tote",
    description: "Handcrafted in Italy from the finest calfskin suede, this tote combines practical space with unparalleled elegance. Finished with gold-plated hardware.",
    price: 3200,
    category: "Bags",
    images: ["https://images.unsplash.com/photo-1584917033904-493bb3c3cc0a?auto=format&fit=crop&q=80&w=800"],
    stock: 10,
    rating: 4.8,
    numReviews: 8,
    featured: true,
    createdAt: new Date().toISOString()
  },
  {
    name: "Diamond Eternity Band",
    description: "A symbol of everlasting elegance. This band features 3 carats of VVS1 diamonds set in a minimalist platinum frame.",
    price: 8900,
    category: "Jewelry",
    images: ["https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800"],
    stock: 3,
    rating: 5.0,
    numReviews: 15,
    featured: true,
    createdAt: new Date().toISOString()
  },
  {
    name: "Silk Heritage Scarf",
    description: "100% mulberry silk, hand-rolled edges. The pattern is inspired by ancient Roman architecture, rendered in deep navy and gold.",
    price: 450,
    category: "Accessories",
    images: ["https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&q=80&w=800"],
    stock: 25,
    rating: 4.7,
    numReviews: 20,
    featured: true,
    createdAt: new Date().toISOString()
  },
  {
    name: "Onyx Cufflinks",
    description: "Solid sterling silver cufflinks with hand-cut black onyx inlays. A subtle yet powerful statement for the modern gentleman.",
    price: 850,
    category: "Accessories",
    images: ["https://images.unsplash.com/photo-1617114919297-3c8ddb01f599?auto=format&fit=crop&q=80&w=800"],
    stock: 15,
    rating: 4.6,
    numReviews: 5,
    featured: false,
    createdAt: new Date().toISOString()
  }
];

export const seedProducts = async () => {
  try {
    const q = query(collection(db, 'products'), limit(1));
    const snap = await getDocs(q);
    if (snap.empty) {
      console.log('Seeding products...');
      for (const product of products) {
        try {
          await addDoc(collection(db, 'products'), product);
        } catch (e: any) {
          if (e.code === 'permission-denied') {
            console.warn('Skipping seed: Permission denied (User is likely not an admin)');
            return;
          }
          handleFirestoreError(e, OperationType.WRITE, 'products');
        }
      }
      console.log('Seeding complete.');
    }
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      console.warn('Skipping seed check: Permission denied');
      return;
    }
    handleFirestoreError(error, OperationType.LIST, 'products');
  }
};
