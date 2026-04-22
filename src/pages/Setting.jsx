import React, { useState, useEffect, useContext, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Camera, User, Mail, Shield, Bell, CreditCard, AlertTriangle, Key, Lock, Eye, EyeOff, Laptop, Smartphone, LogOut, Zap, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';

// --- Background Moving Glows ---
const AnimatedBackground = () => (
  <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0.1, 0.2, 0.1], x: [0, 50, -50, 0], y: [0, -50, 50, 0], scale: [1, 1.1, 1, 1.1, 1] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="absolute top-[-10%] left-[-10%] w-[60rem] h-[60rem] bg-indigo-600/30 rounded-full mix-blend-screen filter blur-[180px]" />
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0.1, 0.15, 0.1], x: [0, -50, 50, 0], y: [0, 50, -50, 0], scale: [1, 1.05, 1, 1.05, 1] }} transition={{ duration: 20, repeat: Infinity, ease: "linear", delay: 2 }} className="absolute bottom-[-10%] right-[-10%] w-[50rem] h-[50rem] bg-blue-700/20 rounded-full mix-blend-screen filter blur-[180px]" />
  </div>
);

const Settings = () => {
  const { user, setUser } = useContext(AuthContext);
  
  // --- UI STATES ---
  const [activeTab, setActiveTab] = useState('profile'); 
  const fileInputRef = useRef(null); 
  
  // --- PROFILE STATES ---
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', email: '', avatar: '' });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // --- SECURITY STATES ---
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });

  // --- BILLING STATES (NEW) ---
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({ fullName: user.fullName || '', email: user.email || '', avatar: user.avatar || '' });
      setAvatarPreview(user.avatar || null);
    }
  }, [user]);

  const getInitials = (name) => {
    if (!name) return 'A';
    const nameParts = name.trim().split(' ');
    if (nameParts.length >= 2) return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    return nameParts[0][0].toUpperCase();
  };
  const userInitials = getInitials(formData.fullName || user?.fullName);

  // --- PROFILE LOGIC ---
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) return toast.error("Image must be smaller than 2MB");
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    setSelectedFile(null);
    setFormData({ ...formData, avatar: '' });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const dataToSubmit = new FormData();
      dataToSubmit.append('fullName', formData.fullName);
      dataToSubmit.append('email', formData.email);
      if (selectedFile) dataToSubmit.append('file', selectedFile);

      const { data } = await axios.put('/api/auth/update', dataToSubmit, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setUser(data.user); 
      setSelectedFile(null);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // --- SECURITY LOGIC ---
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) return toast.error("New passwords do not match!");
    if (passwordData.newPassword.length < 8) return toast.error("Password must be at least 8 characters long.");

    setIsChangingPassword(true);
    try {
      await axios.put('/api/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success("Password changed successfully! 🔒");
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const togglePasswordVisibility = (field) => setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));

  // ==========================================
  // 🔥 RAZORPAY PAYMENT LOGIC (NEW)
  // ==========================================
  const checkoutHandler = async () => {
    if (user?.isPro) return toast.error("You are already a Pro member!");
    
    setIsProcessingPayment(true);
    try {
      // 1. Backend se Razorpay Key laao
      const { data: { key } } = await axios.get("/api/payment/getkey");

      // 2. Order Create karo
      const { data: { order } } = await axios.post("/api/payment/checkout");

      // 3. Razorpay Options Setup
      const options = {
        key: key, 
        amount: order.amount,
        currency: "INR",
        name: "BizFlow",
        description: "Upgrade to BizFlow Pro",
        image: "https://cdn-icons-png.flaticon.com/512/6009/6009864.png", // Aap apna logo URL daal sakte ho
        order_id: order.id,
        handler: async function (response) {
          // 4. Payment Verify karo
          try {
            const verifyRes = await axios.post("/api/payment/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            
            if(verifyRes.data.success) {
              toast.success(verifyRes.data.message);
              setUser(verifyRes.data.user); // UI update ho jayega Pro me!
            }
          } catch (error) {
            toast.error("Payment verification failed.");
          }
        },
        prefill: {
          name: user?.fullName || "BizFlow User",
          email: user?.email || "",
          contact: "9999999999" // Dummy
        },
        notes: { address: "BizFlow Corporate Office" },
        theme: { color: "#4f46e5" } // Indigo color match karega UI se
      };

      // 5. Razorpay Window open karo
      const razor = new window.Razorpay(options);
      razor.open();
      
    } catch (error) {
      toast.error("Failed to initiate payment. Please try again.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // --- ANIMATIONS ---
  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } };
  const tabVariants = { hidden: { opacity: 0, x: 20 }, show: { opacity: 1, x: 0, transition: { duration: 0.3 } }, exit: { opacity: 0, x: -20, transition: { duration: 0.2 } } };

  const menuItems = [
    { id: 'profile', icon: User, label: 'General Profile' },
    { id: 'security', icon: Shield, label: 'Security & Passwords' },
    { id: 'billing', icon: CreditCard, label: 'Billing & Plans' }, // 🔥 Badge hata diya, ab ye clickable hai
    { id: 'notifications', icon: Bell, label: 'Notifications', badge: 'Soon' },
  ];

  return (
    <div className="relative bg-[#000000] min-h-screen font-sans">
      <AnimatedBackground />
      
      {/* NAYA: Razorpay ka Script add kiya taaki window khule */}
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>

      <div className="relative z-10 selection:bg-white selection:text-black p-4 md:p-8 max-w-[90rem] mx-auto">
        <motion.div initial="hidden" animate="show" variants={containerVariants}>
          
          <motion.div variants={itemVariants} className="mb-10">
            <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">Workspace Settings</h2>
            <p className="text-sm text-zinc-500 font-medium">Manage your personal details, security, and workspace preferences.</p>
          </motion.div>
          
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            
            {/* LEFT SIDEBAR */}
            <motion.div variants={itemVariants} className="w-full lg:w-64 shrink-0 space-y-1.5">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => item.badge ? toast('Feature coming soon!') : setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${
                    activeTab === item.id 
                    ? 'bg-white/10 text-white font-bold shadow-[0_0_15px_rgba(255,255,255,0.05)] border border-white/10' 
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02] font-medium border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={18} className={activeTab === item.id ? 'text-white' : 'text-zinc-500'} />
                    <span className="text-sm">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] uppercase tracking-wider font-extrabold bg-white/5 text-zinc-500 px-2 py-0.5 rounded-full border border-white/5">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </motion.div>

            {/* RIGHT CONTENT AREA */}
            <div className="flex-1 max-w-4xl">
              <AnimatePresence mode="wait">
                
                {/* ===================== PROFILE TAB ===================== */}
                {activeTab === 'profile' && (
                  <motion.div key="profile" variants={tabVariants} initial="hidden" animate="show" exit="exit" className="space-y-8">
                    {/* (Profile Content remains exactly the same as before) */}
                    <div className="bg-[#09090b]/80 backdrop-blur-2xl rounded-[2rem] border border-white/5 shadow-2xl overflow-hidden relative">
                      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                      <form onSubmit={handleUpdateProfile}>
                        <div className="p-8 sm:p-10 relative z-10">
                          <h3 className="text-xl font-bold text-white mb-8">Personal Information</h3>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 mb-12">
                            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
                              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full opacity-0 group-hover:opacity-50 blur transition-opacity duration-500"></div>
                              <div className="relative w-28 h-28 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-900 border border-white/10 flex items-center justify-center shadow-2xl overflow-hidden ring-4 ring-[#09090b]">
                                {avatarPreview ? (
                                  <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-white text-3xl font-black">{userInitials}</span>
                                )}
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm">
                                  <Camera className="text-white mb-1" size={24} />
                                </div>
                              </div>
                            </div>
                            <div className="space-y-3">
                              <div className="flex gap-3">
                                <input type="file" accept="image/*" onChange={handleImageChange} ref={fileInputRef} className="hidden" />
                                <button type="button" onClick={() => fileInputRef.current.click()} className="bg-white text-black hover:bg-zinc-200 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95">Upload New</button>
                                {avatarPreview && (
                                  <button type="button" onClick={handleRemoveAvatar} className="bg-white/5 hover:bg-red-500/10 text-zinc-300 hover:text-red-400 border border-white/5 hover:border-red-500/20 px-5 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95">Remove</button>
                                )}
                              </div>
                              <p className="text-xs text-zinc-500 font-medium">Recommended: Square JPG, PNG, or GIF. Max 2MB.</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2.5 relative">
                              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">Admin Full Name</label>
                              <div className="relative">
                                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-500" size={18} />
                                <input type="text" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} required className="w-full pl-11 pr-5 py-3.5 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all text-sm font-semibold text-white shadow-inner" />
                              </div>
                            </div>
                            <div className="space-y-2.5 relative">
                              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">Email Address</label>
                              <div className="relative">
                                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-500" size={18} />
                                <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required className="w-full pl-11 pr-5 py-3.5 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all text-sm font-semibold text-white shadow-inner" />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="p-6 sm:px-10 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
                          <p className="text-xs text-zinc-500 font-medium hidden sm:block">Changes will be applied across all workspaces.</p>
                          <button type="submit" disabled={isSavingProfile} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-zinc-200 text-black px-8 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)] disabled:opacity-70">
                            {isSavingProfile ? <Loader2 size={18} className="animate-spin" /> : "Save Changes"}
                          </button>
                        </div>
                      </form>
                    </div>
                  </motion.div>
                )}

                {/* ===================== SECURITY TAB ===================== */}
                {activeTab === 'security' && (
                  <motion.div key="security" variants={tabVariants} initial="hidden" animate="show" exit="exit" className="space-y-8">
                     {/* (Security Content remains exactly the same as before) */}
                     <div className="bg-[#09090b]/80 backdrop-blur-2xl rounded-[2rem] border border-white/5 shadow-2xl overflow-hidden relative">
                      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                      <form onSubmit={handlePasswordChange}>
                        <div className="p-8 sm:p-10 relative z-10">
                          <h3 className="text-xl font-bold text-white mb-2">Change Password</h3>
                          <p className="text-sm text-zinc-500 mb-8">Update your password to keep your account secure.</p>
                          <div className="space-y-6 max-w-xl">
                            <div className="space-y-2.5 relative">
                              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">Current Password</label>
                              <div className="relative group">
                                <Key className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors" size={18} />
                                <input type={showPasswords.current ? "text" : "password"} value={passwordData.currentPassword} onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})} required className="w-full pl-11 pr-12 py-3.5 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all text-sm font-semibold text-white shadow-inner" />
                                <button type="button" onClick={() => togglePasswordVisibility('current')} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-white transition-colors focus:outline-none">{showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                              <div className="space-y-2.5 relative">
                                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">New Password</label>
                                <div className="relative group">
                                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors" size={18} />
                                  <input type={showPasswords.new ? "text" : "password"} value={passwordData.newPassword} onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} required className="w-full pl-11 pr-12 py-3.5 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all text-sm font-semibold text-white shadow-inner" />
                                  <button type="button" onClick={() => togglePasswordVisibility('new')} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-white transition-colors focus:outline-none">{showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                                </div>
                              </div>
                              <div className="space-y-2.5 relative">
                                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">Confirm New</label>
                                <div className="relative group">
                                  <Shield className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors" size={18} />
                                  <input type={showPasswords.confirm ? "text" : "password"} value={passwordData.confirmPassword} onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})} required className="w-full pl-11 pr-12 py-3.5 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all text-sm font-semibold text-white shadow-inner" />
                                  <button type="button" onClick={() => togglePasswordVisibility('confirm')} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-white transition-colors focus:outline-none">{showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="p-6 sm:px-10 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
                          <p className="text-xs text-zinc-500 font-medium hidden sm:block">Minimum 8 characters required.</p>
                          <button type="submit" disabled={isChangingPassword} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-zinc-200 text-black px-8 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)] disabled:opacity-70">
                            {isChangingPassword ? <Loader2 size={18} className="animate-spin" /> : "Update Password"}
                          </button>
                        </div>
                      </form>
                    </div>
                  </motion.div>
                )}

                {/* ===================== BILLING TAB (NEW) ===================== */}
                {activeTab === 'billing' && (
                  <motion.div key="billing" variants={tabVariants} initial="hidden" animate="show" exit="exit" className="space-y-8">
                    
                    <div className="bg-[#09090b]/80 backdrop-blur-2xl rounded-[2rem] border border-white/5 shadow-2xl p-8 sm:p-10 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-10 opacity-10 blur-xl pointer-events-none">
                        <Zap size={150} className="text-indigo-500" />
                      </div>

                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-2xl font-bold text-white">BizFlow Plans</h3>
                          {user?.isPro && (
                            <span className="bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full text-xs font-bold border border-indigo-500/30 flex items-center gap-1.5">
                              <Zap size={12} /> Active Pro Member
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-zinc-500 mb-10 max-w-lg">Unlock unlimited tenants, priority support, and advanced analytics by upgrading to the Pro plan.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          
                          {/* Free Plan Card */}
                          <div className={`p-6 rounded-2xl border ${!user?.isPro ? 'border-indigo-500/50 bg-indigo-500/5 shadow-[0_0_30px_rgba(79,70,229,0.1)]' : 'border-white/10 bg-black/40'} transition-all`}>
                            <h4 className="text-xl font-bold text-white mb-2">Starter</h4>
                            <div className="flex items-end gap-1 mb-6">
                              <span className="text-3xl font-black text-white">₹0</span>
                              <span className="text-sm font-medium text-zinc-500 mb-1">/forever</span>
                            </div>
                            <ul className="space-y-3 mb-8">
                              <li className="flex items-center gap-2 text-sm text-zinc-300"><CheckCircle2 size={16} className="text-zinc-500" /> Up to 5 Tenants</li>
                              <li className="flex items-center gap-2 text-sm text-zinc-300"><CheckCircle2 size={16} className="text-zinc-500" /> Basic Invoicing</li>
                              <li className="flex items-center gap-2 text-sm text-zinc-300"><CheckCircle2 size={16} className="text-zinc-500" /> Standard Support</li>
                            </ul>
                            {!user?.isPro ? (
                              <button disabled className="w-full bg-white/10 text-white py-3 rounded-xl font-bold text-sm opacity-50 cursor-not-allowed">Current Plan</button>
                            ) : (
                              <button className="w-full bg-white/5 text-zinc-400 border border-white/10 py-3 rounded-xl font-bold text-sm hover:bg-white/10 transition-colors">Downgrade</button>
                            )}
                          </div>

                          {/* Pro Plan Card */}
                          <div className={`p-6 rounded-2xl border ${user?.isPro ? 'border-emerald-500/50 bg-emerald-500/5 shadow-[0_0_30px_rgba(16,185,129,0.1)]' : 'border-indigo-500 bg-gradient-to-b from-indigo-600/20 to-transparent relative overflow-hidden'}`}>
                            {!user?.isPro && <div className="absolute top-0 inset-x-0 h-1 bg-indigo-500"></div>}
                            <h4 className="text-xl font-bold text-white mb-2 flex items-center gap-2">Professional {user?.isPro && <CheckCircle2 size={18} className="text-emerald-400" />}</h4>
                            <div className="flex items-end gap-1 mb-6">
                              <span className="text-3xl font-black text-white">₹999</span>
                              <span className="text-sm font-medium text-zinc-500 mb-1">/lifetime</span>
                            </div>
                            <ul className="space-y-3 mb-8">
                              <li className="flex items-center gap-2 text-sm text-white font-medium"><CheckCircle2 size={16} className={user?.isPro ? "text-emerald-500" : "text-indigo-400"} /> Unlimited Tenants</li>
                              <li className="flex items-center gap-2 text-sm text-white font-medium"><CheckCircle2 size={16} className={user?.isPro ? "text-emerald-500" : "text-indigo-400"} /> Custom Invoice Branding</li>
                              <li className="flex items-center gap-2 text-sm text-white font-medium"><CheckCircle2 size={16} className={user?.isPro ? "text-emerald-500" : "text-indigo-400"} /> 24/7 Priority Support</li>
                            </ul>
                            
                            {user?.isPro ? (
                              <button disabled className="w-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 py-3 rounded-xl font-bold text-sm cursor-not-allowed">Active Plan</button>
                            ) : (
                              <button 
                                onClick={checkoutHandler} 
                                disabled={isProcessingPayment}
                                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] active:scale-95 flex items-center justify-center gap-2"
                              >
                                {isProcessingPayment ? <Loader2 size={18} className="animate-spin" /> : "Upgrade Now"}
                              </button>
                            )}
                          </div>

                        </div>
                      </div>
                    </div>

                  </motion.div>
                )}

              </AnimatePresence>
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;