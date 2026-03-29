import React, { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Order } from '../types';
import { toast } from 'sonner';
import { Search, ChevronDown, ExternalLink } from 'lucide-react';

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'orders'));
      const querySnapshot = await getDocs(q);
      const fetchedOrders = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Order))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(fetchedOrders);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      toast.success('Order status updated');
      fetchOrders();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.shippingAddress.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="h-screen flex items-center justify-center bg-zinc-50"><div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Manage Orders</h1>
          <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs mt-2">Track and update customer orders</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
          <input
            type="text"
            placeholder="Search orders..."
            className="minimal-input w-full pl-12 py-4"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="minimal-card overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50 text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
                <th className="px-8 py-5">Order ID</th>
                <th className="px-8 py-5">Customer</th>
                <th className="px-8 py-5">Items</th>
                <th className="px-8 py-5">Payment</th>
                <th className="px-8 py-5">Total</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-zinc-50 transition-all">
                  <td className="px-8 py-5 text-sm font-bold text-zinc-300 font-mono">#{order.id.substring(0, 8)}</td>
                  <td className="px-8 py-5">
                    <div className="text-sm font-bold text-black">{order.shippingAddress.fullName}</div>
                    <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{order.shippingAddress.city}, {order.shippingAddress.country}</div>
                  </td>
                  <td className="px-8 py-5 text-sm font-bold text-zinc-400">
                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                  </td>
                  <td className="px-8 py-5">
                    <div className="text-sm font-bold text-black">{order.paymentMethod}</div>
                    {order.transactionId && (
                      <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">TXID: {order.transactionId}</div>
                    )}
                  </td>
                  <td className="px-8 py-5 text-sm font-bold text-black">${order.totalAmount.toLocaleString()}</td>
                  <td className="px-8 py-5">
                    <div className="relative inline-block">
                      <select
                        className={`text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-xl appearance-none cursor-pointer border-none outline-none transition-all ${
                          order.status === 'delivered' ? 'bg-green-50 text-green-600' :
                          order.status === 'shipped' ? 'bg-blue-50 text-blue-600' :
                          'bg-zinc-100 text-zinc-600'
                        }`}
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm font-bold text-zinc-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
