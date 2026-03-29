import React, { useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, Save, Loader2, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

interface ContactSettings {
  email: string;
  location: string;
  phoneNumber: string;
  bkashNumber: string;
  nagadNumber: string;
}

const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<ContactSettings>({
    email: '',
    location: '',
    phoneNumber: '',
    bkashNumber: '',
    nagadNumber: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'contact');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSettings({
            email: data.email || '',
            location: data.location || '',
            phoneNumber: data.phoneNumber || '',
            bkashNumber: data.bkashNumber || '',
            nagadNumber: data.nagadNumber || ''
          });
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'settings/contact');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'contact'), settings);
      toast.success('Settings updated successfully');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/contact');
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-zinc-50"><div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-12"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">Store Settings</h1>
            <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">Manage your contact information and location</p>
          </div>
          <Link to="/admin" className="flex items-center space-x-2 text-zinc-400 hover:text-black transition-all font-bold uppercase tracking-widest text-xs">
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="minimal-card p-12 space-y-12 bg-white">
          <div className="grid grid-cols-1 gap-10">
            {/* Email */}
            <div className="space-y-4">
              <label className="flex items-center space-x-3 text-xs font-bold uppercase tracking-widest text-zinc-400">
                <Mail size={16} className="text-black" />
                <span>Support Email</span>
              </label>
              <input
                type="email"
                required
                className="minimal-input w-full"
                placeholder="hello@example.com"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              />
            </div>

            {/* Phone */}
            <div className="space-y-4">
              <label className="flex items-center space-x-3 text-xs font-bold uppercase tracking-widest text-zinc-400">
                <Phone size={16} className="text-black" />
                <span>Contact Number</span>
              </label>
              <input
                type="text"
                required
                className="minimal-input w-full"
                placeholder="+1 (555) 000-0000"
                value={settings.phoneNumber}
                onChange={(e) => setSettings({ ...settings, phoneNumber: e.target.value })}
              />
            </div>

            {/* bKash & Nagad */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <label className="flex items-center space-x-3 text-xs font-bold uppercase tracking-widest text-zinc-400">
                  <div className="w-4 h-4 bg-pink-500 rounded-full" />
                  <span>bKash Merchant Number</span>
                </label>
                <input
                  type="text"
                  className="minimal-input w-full"
                  placeholder="017XXXXXXXX"
                  value={settings.bkashNumber}
                  onChange={(e) => setSettings({ ...settings, bkashNumber: e.target.value })}
                />
              </div>
              <div className="space-y-4">
                <label className="flex items-center space-x-3 text-xs font-bold uppercase tracking-widest text-zinc-400">
                  <div className="w-4 h-4 bg-orange-500 rounded-full" />
                  <span>Nagad Merchant Number</span>
                </label>
                <input
                  type="text"
                  className="minimal-input w-full"
                  placeholder="017XXXXXXXX"
                  value={settings.nagadNumber}
                  onChange={(e) => setSettings({ ...settings, nagadNumber: e.target.value })}
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <label className="flex items-center space-x-3 text-xs font-bold uppercase tracking-widest text-zinc-400">
                <MapPin size={16} className="text-black" />
                <span>Store Location</span>
              </label>
              <textarea
                required
                className="minimal-input w-full h-40 resize-none"
                placeholder="12 Bond Street, London W1S 3SR"
                value={settings.location}
                onChange={(e) => setSettings({ ...settings, location: e.target.value })}
              ></textarea>
            </div>
          </div>

          <div className="pt-8">
            <button
              type="submit"
              disabled={saving}
              className="minimal-button w-full flex items-center justify-center space-x-3 py-5 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <Save size={24} />
              )}
              <span className="text-lg">{saving ? 'Saving Changes...' : 'Save Settings'}</span>
            </button>
          </div>
        </form>

        <div className="bg-zinc-50 rounded-3xl p-10 border border-zinc-100">
          <h3 className="text-lg font-bold mb-8 uppercase tracking-widest text-black">Preview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-sm">
            <div className="space-y-2">
              <p className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">Email</p>
              <p className="font-bold text-lg">{settings.email || 'Not set'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">Phone</p>
              <p className="font-bold text-lg">{settings.phoneNumber || 'Not set'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">Location</p>
              <p className="font-bold text-lg whitespace-pre-line">{settings.location || 'Not set'}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminSettings;
