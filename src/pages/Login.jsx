import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Command, CheckCircle, Activity, Loader2, Mail, KeyRound, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

// --- Background Moving Glows ---
const AnimatedBackground = () => (
  <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#050505]">
    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0.1, 0.25, 0.1], x: [0, 50, -50, 0], y: [0, -50, 50, 0], scale: [1, 1.1, 1, 1.1, 1] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="absolute top-[10%] left-[20%] w-[50rem] h-[50rem] bg-blue-600 rounded-full mix-blend-screen filter blur-[160px]" />
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0.1, 0.2, 0.1], x: [0, -50, 50, 0], y: [0, 50, -50, 0], scale: [1, 1.05, 1, 1.05, 1] }} transition={{ duration: 20, repeat: Infinity, ease: "linear", delay: 2 }} className="absolute bottom-[10%] right-[20%] w-[45rem] h-[45rem] bg-indigo-700 rounded-full mix-blend-screen filter blur-[160px]" />
  </div>
);

const Login = () => {
  const navigate = useNavigate();
  
  // 🔥 FIX: Naye states Magic Login ke liye
  const [step, setStep] = useState(1); // Step 1: Email, Step 2: OTP
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // --- STEP 1: OTP BHEJO ---
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your work email.");

    setIsLoading(true);
    try {
      await axios.post('/api/auth/send-otp', { email });
      toast.success("Magic code sent to your email! ✨");
      setStep(2); // OTP screen par le jao
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send code. Are you registered?");
    } finally {
      setIsLoading(false);
    }
  };

  // --- STEP 2: OTP VERIFY KARO & LOGIN KARO ---
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return toast.error("Please enter a valid 6-digit code.");

    setIsLoading(true);
    try {
      await axios.post('/api/auth/verify-otp', { email, otp });
      toast.success("Login successful! 🚀");
      
      // Cookie set ho chuki hai, ab Dashboard par le jao aur page refresh kar do taaki Context update ho jaye
      navigate('/dashboard');
      window.location.reload(); 
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid or expired code.");
      setOtp(''); // Galat OTP par input clear kar do
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#050505] font-sans selection:bg-white selection:text-black text-white relative overflow-hidden">
      <AnimatedBackground />

      {/* LEFT SIDE: ULTRA-PREMIUM DARK FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 py-16 lg:py-8 relative z-10">
        <div className="w-full max-w-[420px] relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-white/[0.02] rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 bg-[#09090b]/60 backdrop-blur-2xl p-8 rounded-[2rem] border border-white/5 shadow-[0_8px_30px_rgba(0,0,0,0.5)] overflow-hidden">
            
            <AnimatePresence mode="wait">
              {/* === STEP 1: EMAIL SCREEN === */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                  <div className="mb-10 text-center">
                    <div className="flex justify-center mb-6">
                      <div className="bg-white text-black p-3 rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center justify-center">
                        <Command size={28} strokeWidth={2.5} />
                      </div>
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-white">Welcome back</h1>
                    <p className="text-zinc-400 font-medium text-sm">Enter your email to receive a secure login code.</p>
                  </div>

                  <form onSubmit={handleSendOtp} className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Work Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                        <input 
                          type="email" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading}
                          className="w-full pl-11 pr-4 py-3.5 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all text-white font-medium placeholder:text-zinc-600 shadow-inner"
                          placeholder="name@company.com"
                        />
                      </div>
                    </div>

                    <button type="submit" disabled={isLoading} className="group w-full flex items-center justify-center gap-2 bg-white hover:bg-zinc-200 text-black font-bold py-3.5 px-4 rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-[0.98] mt-8 disabled:opacity-70">
                      {isLoading ? <Loader2 className="animate-spin" size={18} /> : (
                        <>Send Magic Code <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                      )}
                    </button>
                  </form>
                </motion.div>
              )}

              {/* === STEP 2: OTP SCREEN === */}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                  <button onClick={() => setStep(1)} className="text-zinc-500 hover:text-white mb-6 flex items-center gap-1.5 text-sm font-semibold transition-colors">
                    <ArrowLeft size={16} /> Back
                  </button>
                  
                  <div className="mb-8 text-center">
                    <div className="flex justify-center mb-6">
                      <div className="bg-indigo-500/20 text-indigo-400 p-4 rounded-2xl border border-indigo-500/20 flex items-center justify-center shadow-[0_0_30px_rgba(79,70,229,0.2)]">
                        <KeyRound size={28} strokeWidth={2.5} />
                      </div>
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-white">Check your email</h1>
                    <p className="text-zinc-400 font-medium text-sm">We've sent a 6-digit secure code to <br/><span className="text-white">{email}</span></p>
                  </div>

                  <form onSubmit={handleVerifyOtp} className="space-y-5">
                    <div className="space-y-2">
                      <input 
                        type="text" required maxLength="6" value={otp} 
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // Sirf numbers allow karega
                        disabled={isLoading}
                        className="w-full text-center tracking-[1rem] text-3xl px-4 py-4 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all text-white font-mono font-extrabold placeholder:text-zinc-700 shadow-inner"
                        placeholder="••••••"
                      />
                    </div>

                    <button type="submit" disabled={isLoading || otp.length !== 6} className="group w-full flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] active:scale-[0.98] mt-8 disabled:opacity-50">
                      {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'Verify & Login'}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-8 text-center text-sm font-medium text-zinc-500">
              New to BizFlow? <Link to="/register" className="text-white hover:underline hover:text-zinc-300 transition-colors">Create an account</Link>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: DEEP SPACE DARK MODE WIDGET DISPLAY (UNCHANGED) */}
      <div className="hidden lg:flex w-full lg:w-1/2 items-center justify-center p-8 lg:p-12 py-16 relative z-10">
        <div className="relative z-10 w-full max-w-lg">
          <div className="bg-[#09090b]/60 backdrop-blur-2xl border border-white/10 p-6 md:p-8 rounded-[2rem] shadow-2xl mb-12 transform hover:-translate-y-2 transition-transform duration-500 group">
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)] shrink-0">
                  <Activity className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg tracking-wide">Live Revenue</h3>
                  <p className="text-zinc-400 text-sm font-medium">Updating in real-time</p>
                </div>
              </div>
              <div className="bg-white/5 px-3 py-1.5 rounded-full border border-white/5 shrink-0">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span> Online
                </span>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-zinc-400 text-sm mb-1 font-medium">Total Volume (30d)</p>
                <div className="flex items-end gap-3">
                  <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">$124,500.00</h2>
                  <span className="text-emerald-400 text-sm font-bold mb-1 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">+14.2%</span>
                </div>
              </div>
              <div className="h-12 w-full flex items-end gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                {[40, 70, 45, 90, 65, 100, 85].map((height, i) => (
                  <div key={i} className="w-full bg-gradient-to-t from-blue-600/20 to-blue-500 rounded-t-sm transition-all duration-500 hover:from-blue-400 hover:to-blue-300 cursor-pointer" style={{ height: `${height}%` }}></div>
                ))}
              </div>
            </div>
          </div>

          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-[1.1] tracking-tight">
            Manage your SaaS <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400">
              without the chaos.
            </span>
          </h2>
          <p className="text-base md:text-lg text-zinc-400 mb-10 leading-relaxed font-medium">
            BizFlow replaces your messy passwords with a secure, 1-click magic code system designed for modern B2B professionals.
          </p>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 text-zinc-400 text-sm font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle size={18} className="text-emerald-500" /> Passwordless Security
            </div>
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-zinc-500" /> AES-256 Encryption
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;