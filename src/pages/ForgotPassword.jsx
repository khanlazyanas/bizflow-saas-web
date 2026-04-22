import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const AnimatedBackground = () => (
  <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-black">
    <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0.1, 0.2, 0.1], x: [0, 50, -50, 0], y: [0, -50, 50, 0], scale: [1, 1.1, 1, 1.1, 1] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="absolute top-[-20%] left-[-10%] w-[50rem] h-[50rem] bg-indigo-600/30 rounded-full mix-blend-screen filter blur-[180px]" />
  </div>
);

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false); // Success state track karne ke liye

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email");

    setIsSubmitting(true);
    try {
      await axios.post('/api/auth/password/forgot', { email });
      setIsSent(true); // Email chala gaya toh UI change kardo
      toast.success("Recovery email sent!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send email. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 font-sans selection:bg-white selection:text-black">
      <AnimatedBackground />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[400px] relative z-10"
      >
        <div className="bg-[#09090b]/80 backdrop-blur-2xl p-8 sm:p-10 rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden">
          {/* Top Edge Glow */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

          <AnimatePresence mode="wait">
            {!isSent ? (
              <motion.form key="form" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} onSubmit={handleSubmit} className="space-y-6">
                <div className="text-center mb-8">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 mx-auto mb-5 shadow-inner">
                    <Mail className="text-zinc-300" size={24} />
                  </div>
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">Forgot Password</h2>
                  <p className="text-sm text-zinc-500 mt-2 font-medium">Enter your email and we'll send you a link to reset your password.</p>
                </div>

                <div className="space-y-2 relative">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors" size={18} />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="name@company.com"
                      className="w-full pl-11 pr-5 py-3.5 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all text-sm font-semibold text-white shadow-inner" 
                    />
                  </div>
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full flex items-center justify-center gap-2 bg-white hover:bg-zinc-200 text-black px-8 py-3.5 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)] disabled:opacity-70">
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : "Send Reset Link"}
                </button>
              </motion.form>
            ) : (
              // SUCCESS STATE UI (Mail chala gaya)
              <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                  <CheckCircle2 className="text-emerald-400" size={32} />
                </div>
                <h2 className="text-2xl font-extrabold text-white tracking-tight">Check your inbox</h2>
                <p className="text-sm text-zinc-500 mt-3 font-medium leading-relaxed">
                  We've sent a password reset link to <br/><span className="text-zinc-300 font-bold">{email}</span>
                </p>
                <button onClick={() => setIsSent(false)} className="mt-8 text-xs font-bold text-zinc-400 hover:text-white transition-colors">
                  Didn't receive the email? Try again
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="text-center mt-8">
          <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-white transition-colors group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;