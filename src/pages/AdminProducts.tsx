import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Product } from '../types';
import { Plus, Edit2, Trash2, X, Upload } from 'lucide-react';
import { toast } from 'sonner';

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: 'Watches',
    stock: 0,
    images: [''],
    featured: false
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      setProducts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'products');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseFloat(value) : value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const productData = {
        ...formData,
        rating: editingProduct?.rating || 5,
        numReviews: editingProduct?.numReviews || 0,
        createdAt: editingProduct?.createdAt || new Date().toISOString()
      };

      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), productData);
        toast.success('Product updated');
      } else {
        await addDoc(collection(db, 'products'), productData);
        toast.success('Product added');
      }
      setIsModalOpen(false);
      setEditingProduct(null);
      setFormData({ name: '', description: '', price: 0, category: 'Watches', stock: 0, images: [''], featured: false });
      fetchProducts();
    } catch (error) {
      handleFirestoreError(error, editingProduct ? OperationType.UPDATE : OperationType.CREATE, 'products');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteDoc(doc(db, 'products', id));
        toast.success('Product deleted');
        fetchProducts();
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
      }
    }
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || 0,
      category: product.category || 'Watches',
      stock: product.stock || 0,
      images: product.images || [''],
      featured: product.featured || false
    });
    setIsModalOpen(true);
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-zinc-50"><div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Manage Products</h1>
          <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs mt-2">Add or edit your store items</p>
        </div>
        <button
          onClick={() => { setEditingProduct(null); setFormData({ name: '', description: '', price: 0, category: 'Watches', stock: 0, images: [''], featured: false }); setIsModalOpen(true); }}
          className="minimal-button flex items-center space-x-2 py-4 px-8"
        >
          <Plus size={20} />
          <span className="text-lg">Add Product</span>
        </button>
      </div>

      <div className="minimal-card overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50 text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
                <th className="px-8 py-5">Product</th>
                <th className="px-8 py-5">Category</th>
                <th className="px-8 py-5">Price</th>
                <th className="px-8 py-5">Stock</th>
                <th className="px-8 py-5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-zinc-50 transition-all">
                  <td className="px-8 py-5">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-zinc-50 rounded-xl overflow-hidden border border-zinc-100">
                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover grayscale" referrerPolicy="no-referrer" />
                      </div>
                      <span className="text-sm font-bold text-black">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm font-bold text-zinc-400">{product.category}</td>
                  <td className="px-8 py-5 text-sm font-bold text-black">${product.price.toLocaleString()}</td>
                  <td className="px-8 py-5 text-sm font-bold text-zinc-400">{product.stock}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center space-x-4">
                      <button onClick={() => openEditModal(product)} className="text-zinc-300 hover:text-black transition-all">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="text-zinc-300 hover:text-red-500 transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-12 space-y-10 relative border border-zinc-100">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-zinc-300 hover:text-black transition-all">
              <X size={28} />
            </button>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">Fill in the details below</p>
            </div>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-2 space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Product Name</label>
                <input type="text" name="name" required className="minimal-input w-full" value={formData.name} onChange={handleInputChange} />
              </div>
              <div className="md:col-span-2 space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Description</label>
                <textarea name="description" required className="minimal-input w-full h-32 resize-none" value={formData.description} onChange={handleInputChange}></textarea>
              </div>
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Price ($)</label>
                <input type="number" name="price" required className="minimal-input w-full" value={formData.price} onChange={handleInputChange} />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Stock</label>
                <input type="number" name="stock" required className="minimal-input w-full" value={formData.stock} onChange={handleInputChange} />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Category</label>
                <select name="category" className="minimal-input w-full" value={formData.category} onChange={handleInputChange}>
                  <option value="Watches">Watches</option>
                  <option value="Bags">Bags</option>
                  <option value="Jewelry">Jewelry</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </div>
              <div className="space-y-3 flex items-center pt-8">
                <input 
                  type="checkbox" 
                  id="featured" 
                  name="featured" 
                  className="w-5 h-5 accent-black rounded-lg" 
                  checked={formData.featured}
                  onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                />
                <label htmlFor="featured" className="ml-3 text-xs font-bold uppercase tracking-widest text-zinc-400">Featured Product</label>
              </div>
              <div className="md:col-span-2 space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Image URL</label>
                <div className="flex space-x-2">
                  <input 
                    type="text" 
                    className="minimal-input w-full" 
                    value={formData.images[0]} 
                    onChange={(e) => setFormData({...formData, images: [e.target.value]})} 
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
              </div>
              <div className="md:col-span-2 pt-8">
                <button type="submit" className="minimal-button w-full py-5 text-lg">
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
