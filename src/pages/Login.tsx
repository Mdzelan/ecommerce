import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';
import { toast } from 'sonner';
import { Mail, Lock, LogIn, Chrome } from 'lucide-react';
import { motion } from 'motion/react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Welcome back');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast.success('Welcome');
      navigate('/');
    } catch (error: any) {
      toast.error('Google login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full space-y-12 minimal-card p-12 bg-white"
      >
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-bold tracking-tight">Welcome Back</h2>
          <p className="text-zinc-400 text-sm font-bold uppercase tracking-widest">Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-8">
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" size={18} />
                <input
                  type="email"
                  required
                  className="minimal-input w-full pl-12"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" size={18} />
                <input
                  type="password"
                  required
                  className="minimal-input w-full pl-12"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="minimal-button w-full flex items-center justify-center space-x-3 py-4 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <LogIn size={20} />
                <span className="text-lg">Sign In</span>
              </>
            )}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-100"></div>
          </div>
          <div className="relative flex justify-center text-xs font-bold uppercase tracking-widest">
            <span className="px-4 bg-white text-zinc-400">Or continue with</span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full bg-zinc-50 text-black py-4 rounded-2xl flex items-center justify-center space-x-3 hover:bg-zinc-100 transition-all font-bold text-sm uppercase tracking-widest"
        >
          <Chrome size={20} />
          <span>Google Account</span>
        </button>

        <p className="text-center text-sm text-zinc-400 font-bold uppercase tracking-widest">
          New here?{' '}
          <Link to="/register" className="text-black hover:underline transition-all">Create Account</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
