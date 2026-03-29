import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

interface ContactSettings {
  email: string;
  location: string;
  phoneNumber: string;
}

const Footer: React.FC = () => {
  const [settings, setSettings] = useState<ContactSettings>({
    email: 'concierge@aurelius.com',
    location: '721 Fifth Avenue, New York, NY',
    phoneNumber: '+1 (212) 555-0123'
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'contact'), (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data() as ContactSettings);
      }
    }, (error) => {
      console.error('Error listening to footer settings:', error);
    });

    return () => unsubscribe();
  }, []);

  return (
    <footer className="bg-white border-t border-zinc-100 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
          {/* Brand */}
          <div className="space-y-8">
            <Link to="/" className="text-2xl font-bold tracking-widest text-black">AURELIUS</Link>
            <p className="text-zinc-400 text-sm leading-relaxed font-medium">
              Experience the pinnacle of minimalist design and craftsmanship. Our curated collection brings together the world's most exquisite pieces for the modern individual.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-zinc-300 hover:text-black transition-all"><Instagram size={20} /></a>
              <a href="#" className="text-zinc-300 hover:text-black transition-all"><Facebook size={20} /></a>
              <a href="#" className="text-zinc-300 hover:text-black transition-all"><Twitter size={20} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-black font-bold text-xs mb-8 uppercase tracking-widest">Quick Links</h4>
            <ul className="space-y-4 text-sm text-zinc-400 font-bold uppercase tracking-widest">
              <li><Link to="/shop" className="hover:text-black transition-all">New Arrivals</Link></li>
              <li><Link to="/shop" className="hover:text-black transition-all">Best Sellers</Link></li>
              <li><Link to="/about" className="hover:text-black transition-all">About Us</Link></li>
              <li><Link to="/shop" className="hover:text-black transition-all">Watches</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-black font-bold text-xs mb-8 uppercase tracking-widest">Customer Care</h4>
            <ul className="space-y-4 text-sm text-zinc-400 font-bold uppercase tracking-widest">
              <li><Link to="#" className="hover:text-black transition-all">Shipping Policy</Link></li>
              <li><Link to="#" className="hover:text-black transition-all">Returns & Exchanges</Link></li>
              <li><Link to="#" className="hover:text-black transition-all">Privacy Policy</Link></li>
              <li><Link to="#" className="hover:text-black transition-all">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-black font-bold text-xs mb-8 uppercase tracking-widest">Contact Us</h4>
            <ul className="space-y-6 text-sm text-zinc-400 font-bold uppercase tracking-widest">
              <li className="flex items-start space-x-4">
                <MapPin size={18} className="text-black mt-1 flex-shrink-0" />
                <span className="whitespace-pre-line leading-relaxed">{settings.location}</span>
              </li>
              <li className="flex items-center space-x-4">
                <Phone size={18} className="text-black flex-shrink-0" />
                <span>{settings.phoneNumber}</span>
              </li>
              <li className="flex items-center space-x-4">
                <Mail size={18} className="text-black flex-shrink-0" />
                <span>{settings.email}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-zinc-50 pt-12 text-center text-zinc-300 text-[10px] font-bold uppercase tracking-widest">
          <p>&copy; {new Date().getFullYear()} Aurelius. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
