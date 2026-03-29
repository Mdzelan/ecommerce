import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Product, Order, UserProfile } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';
import { Package, ShoppingBag, Users, DollarSign, ArrowUpRight, LayoutDashboard, List, ClipboardList, Settings } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [ordersSnap, productsSnap, usersSnap] = await Promise.all([
          getDocs(collection(db, 'orders')),
          getDocs(collection(db, 'products')),
          getDocs(collection(db, 'users'))
        ]);

        const orders = ordersSnap.docs.map(d => d.data() as Order);
        const revenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

        setStats({
          totalRevenue: revenue,
          totalOrders: ordersSnap.size,
          totalProducts: productsSnap.size,
          totalUsers: usersSnap.size
        });

        const recentOrdersList = orders
          .map((o, index) => ({ id: ordersSnap.docs[index].id, ...o }))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);
        
        setRecentOrders(recentOrdersList);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'admin_stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const salesData = [
    { name: 'Jan', sales: 4000 },
    { name: 'Feb', sales: 3000 },
    { name: 'Mar', sales: 5000 },
    { name: 'Apr', sales: 4500 },
    { name: 'May', sales: 6000 },
    { name: 'Jun', sales: 5500 },
  ];

  const categoryData = [
    { name: 'Watches', value: 400 },
    { name: 'Bags', value: 300 },
    { name: 'Jewelry', value: 300 },
    { name: 'Accessories', value: 200 },
  ];

  const COLORS = ['#000000', '#71717a', '#a1a1aa', '#d4d4d8'];

  if (loading) return <div className="h-screen flex items-center justify-center bg-zinc-50"><div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs mt-2">Overview of your store</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/admin/products" className="minimal-button py-3 px-6 text-xs flex items-center space-x-2">
            <List size={16} />
            <span>Products</span>
          </Link>
          <Link to="/admin/orders" className="bg-white border border-zinc-100 py-3 px-6 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center space-x-2 hover:bg-zinc-50 transition-all">
            <ClipboardList size={16} />
            <span>Orders</span>
          </Link>
          <Link to="/admin/settings" className="bg-white border border-zinc-100 py-3 px-6 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center space-x-2 hover:bg-zinc-50 transition-all">
            <Settings size={16} />
            <span>Settings</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="minimal-card p-8 space-y-6 bg-white">
          <div className="flex justify-between items-start">
            <div className="p-4 bg-zinc-50 rounded-2xl text-black"><DollarSign size={24} /></div>
            <span className="text-xs font-bold text-green-600 flex items-center bg-green-50 px-2 py-1 rounded-lg">+12% <ArrowUpRight size={12} className="ml-1" /></span>
          </div>
          <div>
            <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Total Revenue</p>
            <h3 className="text-3xl font-bold tracking-tight mt-1">${stats.totalRevenue.toLocaleString()}</h3>
          </div>
        </div>
        <div className="minimal-card p-8 space-y-6 bg-white">
          <div className="flex justify-between items-start">
            <div className="p-4 bg-zinc-50 rounded-2xl text-black"><ShoppingBag size={24} /></div>
            <span className="text-xs font-bold text-green-600 flex items-center bg-green-50 px-2 py-1 rounded-lg">+5% <ArrowUpRight size={12} className="ml-1" /></span>
          </div>
          <div>
            <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Total Orders</p>
            <h3 className="text-3xl font-bold tracking-tight mt-1">{stats.totalOrders}</h3>
          </div>
        </div>
        <div className="minimal-card p-8 space-y-6 bg-white">
          <div className="flex justify-between items-start">
            <div className="p-4 bg-zinc-50 rounded-2xl text-black"><Package size={24} /></div>
          </div>
          <div>
            <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Total Products</p>
            <h3 className="text-3xl font-bold tracking-tight mt-1">{stats.totalProducts}</h3>
          </div>
        </div>
        <div className="minimal-card p-8 space-y-6 bg-white">
          <div className="flex justify-between items-start">
            <div className="p-4 bg-zinc-50 rounded-2xl text-black"><Users size={24} /></div>
          </div>
          <div>
            <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Total Users</p>
            <h3 className="text-3xl font-bold tracking-tight mt-1">{stats.totalUsers}</h3>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="minimal-card p-8 bg-white">
          <h3 className="text-lg font-bold mb-10 uppercase tracking-widest">Sales Overview</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
                <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #f4f4f5', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ color: '#000000', fontWeight: 'bold' }}
                />
                <Bar dataKey="sales" fill="#000000" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="minimal-card p-8 bg-white">
          <h3 className="text-lg font-bold mb-10 uppercase tracking-widest">Category Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #f4f4f5', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="minimal-card overflow-hidden bg-white">
        <div className="p-8 border-b border-zinc-50 flex justify-between items-center">
          <h3 className="text-lg font-bold uppercase tracking-widest">Recent Orders</h3>
          <Link to="/admin/orders" className="text-xs font-bold text-black hover:underline transition-all uppercase tracking-widest">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50 text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
                <th className="px-8 py-5">Order ID</th>
                <th className="px-8 py-5">Customer</th>
                <th className="px-8 py-5">Payment</th>
                <th className="px-8 py-5">Amount</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-zinc-50 transition-all">
                  <td className="px-8 py-5 text-sm font-mono text-zinc-400">#{order.id.substring(0, 8)}</td>
                  <td className="px-8 py-5 text-sm font-bold">{order.shippingAddress.fullName}</td>
                  <td className="px-8 py-5 text-sm font-bold text-zinc-400">{order.paymentMethod}</td>
                  <td className="px-8 py-5 text-sm font-bold">${order.totalAmount.toLocaleString()}</td>
                  <td className="px-8 py-5">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full ${
                      order.status === 'delivered' ? 'bg-green-50 text-green-600' :
                      order.status === 'shipped' ? 'bg-blue-50 text-blue-600' :
                      'bg-zinc-100 text-zinc-600'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-sm text-zinc-400 font-medium">{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
