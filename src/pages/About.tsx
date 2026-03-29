import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Award, Globe, Heart, MapPin, Phone, Mail } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

interface ContactSettings {
  email: string;
  location: string;
  phoneNumber: string;
}

const About: React.FC = () => {
  const [settings, setSettings] = useState<ContactSettings>({
    email: 'hello@example.com',
    location: '721 Fifth Avenue, New York, NY',
    phoneNumber: '+1 (212) 555-0123'
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'contact'), (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data() as ContactSettings);
      }
    }, (error) => {
      console.error('Error listening to settings in About page:', error);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-32 pb-32 bg-white">
      {/* Hero Section */}
      <section className="relative h-[70vh] overflow-hidden bg-zinc-50">
        <div className="absolute inset-0">
          <img
            src="https://picsum.photos/seed/minimal-about/1920/1080"
            alt="About Us Hero"
            className="w-full h-full object-cover opacity-60 grayscale"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-white/10"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl space-y-8"
          >
            <p className="text-black font-bold uppercase tracking-[0.4em] text-xs">Our Heritage</p>
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-none">
              Defining <br />
              <span className="text-zinc-300 italic">Modernity</span>
            </h1>
            <p className="text-zinc-500 text-xl font-medium leading-relaxed max-w-2xl mx-auto">
              We believe in the beauty of simplicity. Our mission is to create timeless pieces that celebrate the intersection of heritage and innovation.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our Story */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-10"
          >
            <h2 className="text-5xl font-bold tracking-tight">A Legacy of Design</h2>
            <div className="space-y-6 text-zinc-500 text-lg font-medium leading-relaxed">
              <p>
                Founded on the principles of uncompromising quality and artisanal excellence, 
                we began as a small atelier dedicated to bespoke craftsmanship. Today, we have 
                expanded our vision to include a curated selection of fine goods and accessories.
              </p>
              <p>
                Every piece in our collection is a testament to our commitment to the art of 
                making. We source only the finest materials from around the globe, ensuring that each creation 
                is as enduring as it is beautiful.
              </p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-[4/5] overflow-hidden rounded-3xl">
              <img
                src="https://picsum.photos/seed/minimal-craft/800/1000"
                alt="Craftsmanship"
                className="w-full h-full object-cover grayscale"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-10 -left-10 bg-white shadow-2xl rounded-3xl p-12 hidden md:block border border-zinc-100">
              <p className="text-black text-6xl font-bold tracking-tighter mb-2">25+</p>
              <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">Years of Excellence</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-zinc-50 py-32 border-y border-zinc-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-24 space-y-4">
            <h2 className="text-5xl font-bold tracking-tight">Our Core Values</h2>
            <p className="text-zinc-400 font-bold uppercase tracking-widest text-sm">The pillars of our brand</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
            <div className="text-center space-y-8">
              <div className="w-20 h-20 bg-white shadow-sm rounded-3xl flex items-center justify-center mx-auto text-black border border-zinc-100">
                <Shield size={32} />
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold">Integrity</h3>
                <p className="text-zinc-500 text-sm font-medium leading-relaxed">
                  We maintain the highest standards of ethical sourcing and transparent business practices.
                </p>
              </div>
            </div>
            <div className="text-center space-y-8">
              <div className="w-20 h-20 bg-white shadow-sm rounded-3xl flex items-center justify-center mx-auto text-black border border-zinc-100">
                <Award size={32} />
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold">Excellence</h3>
                <p className="text-zinc-500 text-sm font-medium leading-relaxed">
                  Our pursuit of perfection is relentless, from the first sketch to the final polish.
                </p>
              </div>
            </div>
            <div className="text-center space-y-8">
              <div className="w-20 h-20 bg-white shadow-sm rounded-3xl flex items-center justify-center mx-auto text-black border border-zinc-100">
                <Globe size={32} />
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold">Innovation</h3>
                <p className="text-zinc-500 text-sm font-medium leading-relaxed">
                  We honor tradition while embracing modern technologies to push the boundaries of design.
                </p>
              </div>
            </div>
            <div className="text-center space-y-8">
              <div className="w-20 h-20 bg-white shadow-sm rounded-3xl flex items-center justify-center mx-auto text-black border border-zinc-100">
                <Heart size={32} />
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold">Passion</h3>
                <p className="text-zinc-500 text-sm font-medium leading-relaxed">
                  Our love for the craft drives us to create pieces that resonate with the soul.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
        <h2 className="text-5xl font-bold tracking-tight">Get in Touch</h2>
        <p className="text-zinc-500 max-w-2xl mx-auto text-xl font-medium leading-relaxed">
          Experience our world in person. Our dedicated specialists are ready to 
          guide you through our collection and provide personalized service.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-12">
          <div className="p-12 minimal-card space-y-6 flex flex-col items-center bg-white">
            <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center text-black">
              <MapPin size={28} />
            </div>
            <div className="space-y-2">
              <h4 className="text-zinc-400 font-bold uppercase tracking-widest text-xs">Location</h4>
              <p className="text-black font-bold text-lg whitespace-pre-line">{settings.location}</p>
            </div>
          </div>
          <div className="p-12 minimal-card space-y-6 flex flex-col items-center bg-white">
            <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center text-black">
              <Phone size={28} />
            </div>
            <div className="space-y-2">
              <h4 className="text-zinc-400 font-bold uppercase tracking-widest text-xs">Phone</h4>
              <p className="text-black font-bold text-lg">{settings.phoneNumber}</p>
            </div>
          </div>
          <div className="p-12 minimal-card space-y-6 flex flex-col items-center bg-white">
            <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center text-black">
              <Mail size={28} />
            </div>
            <div className="space-y-2">
              <h4 className="text-zinc-400 font-bold uppercase tracking-widest text-xs">Email</h4>
              <p className="text-black font-bold text-lg">{settings.email}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
