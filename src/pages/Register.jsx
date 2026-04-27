import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Command, CheckCircle, ShieldCheck, Zap, Layers, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext'; 

const AnimatedBackground = () => (
  <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#050505]">
    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0.1, 0.25, 0.1], x: [0, 50, -50, 0], y: [0, -50, 50, 0], scale: [1, 1.1, 1, 1.1, 1] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="absolute top-[10%] left-[20%] w-[50rem] h-[50rem] bg-blue-600 rounded-full mix-blend-screen filter blur-[160px]" />
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0.1, 0.2, 0.1], x: [0, -50, 50, 0], y: [0, 50, -50, 0], scale: [1, 1.05, 1, 1.05, 1] }} transition={{ duration: 20, repeat: Infinity, ease: "linear", delay: 2 }} className="absolute bottom-[10%] right-[20%] w-[45rem] h-[45rem] bg-indigo-700 rounded-full mix-blend-screen filter blur-[160px]" />
  </div>
);

const Register = () => {
  const navigate = useNavigate();
  const { register } = useContext(AuthContext); 
  
  const [formData, setFormData] = useState({
    fullName: '',
    businessName: '',
    email: '',
    password: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 🔥 NAYA FEATURE: Google Login Function
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/api/auth/google"; 
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.fullName || !formData.businessName || !formData.email || !formData.password) {
      setError("Please fill in all details.");
      return;
    }

    setIsLoading(true);

    try {
      await register(formData.fullName, formData.businessName, formData.email, formData.password);
      setIsLoading(false);
      navigate('/dashboard');
    } catch (err) {
      setIsLoading(false);
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex bg-[#050505] font-sans selection:bg-white selection:text-black overflow-hidden relative text-white">
      <AnimatedBackground />

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-10 overflow-y-auto custom-scrollbar">
        <div className="w-full max-w-[440px] relative my-8">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-white/[0.02] rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 bg-[#09090b]/60 backdrop-blur-2xl p-8 sm:p-10 rounded-[2rem] border border-white/5 shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
            <div className="mb-8 text-center">
              <div className="flex justify-center mb-6">
                <div className="bg-white text-black p-3 rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center justify-center">
                  <Command size={28} strokeWidth={2.5} />
                </div>
              </div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Create your workspace</h1>
              <p className="text-zinc-400 font-medium text-sm">Get started with BizFlow in seconds.</p>
            </div>

            {error && <p className="text-red-400 text-xs font-bold mb-4 text-center bg-red-500/10 border border-red-500/20 py-2.5 rounded-xl shadow-[0_0_10px_rgba(248,113,113,0.1)]">{error}</p>}

            <form onSubmit={handleRegister} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Full Name</label>
                  <input 
                    type="text" name="fullName" required value={formData.fullName} onChange={handleChange} disabled={isLoading}
                    className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all duration-300 text-white font-medium placeholder:text-zinc-600 shadow-inner text-sm"
                    placeholder="Enter Your Name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Workspace</label>
                  <input 
                    type="text" name="businessName" required value={formData.businessName} onChange={handleChange} disabled={isLoading}
                    className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all duration-300 text-white font-medium placeholder:text-zinc-600 shadow-inner text-sm"
                    placeholder="Business Name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Work Email</label>
                <input 
                  type="email" name="email" required value={formData.email} onChange={handleChange} disabled={isLoading}
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all duration-300 text-white font-medium placeholder:text-zinc-600 shadow-inner text-sm"
                  placeholder="Your Email"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Password</label>
                <input 
                  type="password" name="password" required value={formData.password} onChange={handleChange} disabled={isLoading}
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all duration-300 text-white font-medium placeholder:text-zinc-600 shadow-inner text-sm"
                  placeholder="At least 8 characters"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-start text-sm text-zinc-400 cursor-pointer group">
                  <div className="relative flex items-center justify-center mt-0.5 mr-3">
                    <input type="checkbox" required className="peer w-5 h-5 appearance-none bg-black/50 border-2 border-white/20 rounded-md checked:bg-white checked:border-white transition-all cursor-pointer" />
                    <CheckCircle size={14} className="absolute text-black opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                  </div>
                  <span className="leading-relaxed">
                    I agree to the <a href="#" className="text-white font-bold hover:underline">Terms of Service</a> and <a href="#" className="text-white font-bold hover:underline">Privacy Policy</a>.
                  </span>
                </label>
              </div>

              <button type="submit" disabled={isLoading} className="group w-full flex items-center justify-center gap-2 bg-white hover:bg-zinc-200 text-black font-bold py-3.5 px-4 rounded-xl transition-all duration-300 active:scale-[0.98] mt-6 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] disabled:opacity-70">
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : (
                  <>Start 14-Day Free Trial <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                )}
              </button>
            </form>

            {/* 🔥 NAYA FEATURE: Divider aur Google Button */}
            <div className="mt-6 flex flex-col gap-5">
              <div className="flex items-center gap-3 text-zinc-500">
                <div className="h-[1px] w-full bg-white/10"></div>
                <span className="text-xs font-bold tracking-widest">OR</span>
                <div className="h-[1px] w-full bg-white/10"></div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="group w-full flex justify-center items-center gap-3 bg-[#18181b] border border-white/10 text-white px-4 py-3.5 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all font-semibold shadow-inner active:scale-[0.98]"
              >
                <img 
                  src="https://www.svgrepo.com/show/475656/google-color.svg" 
                  alt="Google" 
                  className="w-5 h-5 group-hover:scale-110 transition-transform" 
                />
                Sign up with Google
              </button>
            </div>

            <div className="mt-8 text-center text-sm font-medium text-zinc-500">
              Already have an account? <Link to="/login" className="text-white hover:underline hover:text-zinc-300 transition-colors">Log in</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex w-1/2 items-center justify-center p-12 relative z-10">
        <div className="relative z-10 w-full max-w-lg">
          <div className="bg-[#09090b]/60 backdrop-blur-2xl border border-white/10 p-8 rounded-[2rem] shadow-2xl mb-12 transform hover:-translate-y-2 transition-transform duration-500">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-[0_0_20px_rgba(52,211,153,0.3)] border border-white/10">
                <Layers className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-white font-bold text-xl tracking-tight">Workspace Ready</h3>
                <p className="text-zinc-400 text-sm font-medium">Initializing modules...</p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/5 shadow-inner">
                  <CheckCircle size={14} className="text-emerald-400" />
                </div>
                <div className="flex-1 h-2.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 1.5, delay: 0.5 }} className="h-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]"></motion.div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/5 shadow-inner">
                  <CheckCircle size={14} className="text-emerald-400" />
                </div>
                <div className="flex-1 h-2.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: "85%" }} transition={{ duration: 1.5, delay: 1 }} className="h-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]"></motion.div>
                </div>
              </div>
              <div className="flex items-center gap-4 opacity-60">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 border-dashed">
                  <div className="w-2 h-2 rounded-full bg-zinc-500 animate-pulse"></div>
                </div>
                <div className="flex-1 h-2.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: "30%" }} transition={{ duration: 2, delay: 1.5, repeat: Infinity, repeatType: "reverse" }} className="h-full bg-zinc-500/50"></motion.div>
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-5xl font-extrabold text-white mb-6 leading-[1.1] tracking-tight">
            Build your B2B empire. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-400">
              Without the friction.
            </span>
          </h2>
          <p className="text-lg text-zinc-400 mb-10 leading-relaxed font-medium">
            Set up your tenant management, automated billing, and analytics in less than 2 minutes. No credit card required.
          </p>
          
          <div className="flex items-center gap-6 text-zinc-400 text-sm font-medium">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-zinc-500" /> Enterprise Security
            </div>
            <div className="flex items-center gap-2">
              <Zap size={18} className="text-zinc-500" /> Instant Setup
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;