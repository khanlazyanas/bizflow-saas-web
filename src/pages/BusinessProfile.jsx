import React, { useState, useEffect } from 'react';
import { Search, Plus, MoreHorizontal, X, Loader2, Users, Building2, Mail } from 'lucide-react'; // 🔥 NAYA IMPORT: Mail
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

// --- Background Moving Glows ---
const AnimatedBackground = () => (
  <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0.1, 0.25, 0.1], x: [0, 50, -50, 0], y: [0, -50, 50, 0], scale: [1, 1.1, 1, 1.1, 1] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="absolute top-[10%] left-[20%] w-[50rem] h-[50rem] bg-blue-600 rounded-full mix-blend-screen filter blur-[160px]" />
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0.1, 0.2, 0.1], x: [0, -50, 50, 0], y: [0, 50, -50, 0], scale: [1, 1.05, 1, 1.05, 1] }} transition={{ duration: 20, repeat: Infinity, ease: "linear", delay: 2 }} className="absolute bottom-[10%] right-[20%] w-[45rem] h-[45rem] bg-indigo-700 rounded-full mix-blend-screen filter blur-[160px]" />
  </div>
);

const BusinessProfile = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null); 
  const [searchTerm, setSearchTerm] = useState(''); 
  
  const [tenants, setTenants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // 🔥 NAYA STATE: 'email' field add kiya
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    email: '', 
    plan: 'Starter Plan'
  });

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      const { data } = await axios.get('/api/tenants');
      setTenants(data.tenants || []);
    } catch (error) {
      console.error("Error fetching tenants:", error);
      toast.error("Failed to load tenants");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTenant = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { data } = await axios.post('/api/tenants', formData);
      setTenants([data.tenant, ...tenants]); 
      toast.success(`${formData.businessName} added successfully!`);
      setIsAddModalOpen(false);
      // 🔥 State Reset update kiya
      setFormData({ businessName: '', ownerName: '', email: '', plan: 'Starter Plan' });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add tenant.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTenant = async (id) => {
    if (!window.confirm("Are you sure you want to delete this tenant? All their data might be affected.")) {
      setOpenMenuId(null);
      return;
    }
    setDeletingId(id);
    try {
      await axios.delete(`/api/tenants/${id}`);
      setTenants(tenants.filter((t) => (t._id || t.id) !== id));
      toast.success("Tenant deleted successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete tenant.");
    } finally {
      setDeletingId(null);
      setOpenMenuId(null);
    }
  };

  const filteredTenants = tenants.filter(tenant => 
    tenant.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.ownerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (name) => {
    if (!name) return 'B';
    const parts = name.trim().split(' ');
    return parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : parts[0][0].toUpperCase();
  };

  const renderPlanBadge = (plan) => {
    switch(plan) {
      case 'Enterprise': 
        return <span className="bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded text-[10px] font-bold border border-purple-500/20 tracking-wider">ENTERPRISE</span>;
      case 'Pro Plan': 
        return <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-500/20 tracking-wider">PRO</span>;
      default: 
        return <span className="bg-zinc-500/10 text-zinc-400 px-2 py-0.5 rounded text-[10px] font-bold border border-zinc-500/20 tracking-wider">STARTER</span>;
    }
  };

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } };

  return (
    <div className="relative bg-black min-h-screen">
      <AnimatedBackground />
      
      <div className="relative z-10 selection:bg-white selection:text-black p-4 md:p-8">
        <motion.div initial="hidden" animate="show" variants={containerVariants} className="max-w-7xl mx-auto font-sans">
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
            <div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight mb-1.5">Tenants Directory</h2>
              <p className="text-sm text-zinc-500 font-medium">Manage and view all registered businesses.</p>
            </div>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="group flex items-center gap-2 bg-white hover:bg-zinc-200 text-black px-5 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" /> Add Tenant
            </button>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-[#09090b]/60 backdrop-blur-xl rounded-[1.75rem] border border-white/5 shadow-2xl overflow-hidden relative">
            <div className="p-6 border-b border-white/5 flex items-center bg-white/[0.01]">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-500" size={18} />
                <input 
                  type="text" 
                  placeholder="Search tenants by business or owner..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-black/50 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all shadow-inner"
                />
              </div>
            </div>

            <div className="overflow-x-auto min-h-[300px]">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
                  <Loader2 className="animate-spin mb-4" size={32} />
                  <p className="text-sm font-medium">Loading tenants data...</p>
                </div>
              ) : filteredTenants.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
                  <div className="bg-white/5 p-4 rounded-full mb-4"><Building2 size={32} /></div>
                  <p className="text-sm font-bold text-white mb-1">
                    {searchTerm ? "No results found" : "No tenants found"}
                  </p>
                  <p className="text-xs">
                    {searchTerm ? "Try searching with a different name." : "Click 'Add Tenant' to register your first client."}
                  </p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-white/5 bg-black/20">
                      <th className="px-7 py-5 text-xs font-bold text-zinc-500 uppercase tracking-widest">Business Detail</th>
                      <th className="px-7 py-5 text-xs font-bold text-zinc-500 uppercase tracking-widest">Contact Info</th>
                      <th className="px-7 py-5 text-xs font-bold text-zinc-500 uppercase tracking-widest">Status</th>
                      <th className="px-7 py-5 text-xs font-bold text-zinc-500 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredTenants.map((tenant) => (
                      <tr key={tenant._id || tenant.id} className="hover:bg-white/[0.03] transition-colors group relative">
                        
                        <td className="px-7 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/5 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                              {getInitials(tenant.businessName)}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-zinc-100 group-hover:text-white transition-colors">{tenant.businessName}</p>
                              <div className="mt-1">{renderPlanBadge(tenant.plan)}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-7 py-4">
                          <div className="flex flex-col justify-center gap-1">
                            <div className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
                              <Users size={14} className="text-zinc-500" /> {tenant.ownerName}
                            </div>
                            {/* 🔥 NAYA UI: Yahan ab email dikhega table mein */}
                            {tenant.email && (
                              <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
                                <Mail size={12} className="text-zinc-600" /> {tenant.email}
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="px-7 py-4">
                          <span className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-bold border border-emerald-500/20 shadow-[0_0_10px_rgba(52,211,153,0.1)]">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_currentColor]"></span> Active
                          </span>
                        </td>

                        <td className="px-7 py-4 text-right relative">
                          <button 
                            onClick={() => setOpenMenuId(openMenuId === (tenant._id || tenant.id) ? null : (tenant._id || tenant.id))}
                            className="text-zinc-500 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-all focus:outline-none"
                          >
                            <MoreHorizontal size={18} />
                          </button>

                          <AnimatePresence>
                            {openMenuId === (tenant._id || tenant.id) && (
                              <>
                                <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)}></div>
                                
                                <motion.div 
                                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                  transition={{ duration: 0.15 }}
                                  className="absolute right-7 top-12 mt-1 w-36 bg-[#18181b] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
                                >
                                  <button 
                                    onClick={() => {
                                      toast("Edit feature coming soon!", { icon: "🛠️" });
                                      setOpenMenuId(null);
                                    }}
                                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                                  >
                                    Edit
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteTenant(tenant._id || tenant.id)}
                                    disabled={deletingId === (tenant._id || tenant.id)}
                                    className="w-full flex justify-between items-center px-4 py-2.5 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                                  >
                                    Delete
                                    {deletingId === (tenant._id || tenant.id) && <Loader2 size={14} className="animate-spin" />}
                                  </button>
                                </motion.div>
                              </>
                            )}
                          </AnimatePresence>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* --- ADD TENANT MODAL --- */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-sans">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              onClick={() => !isSubmitting && setIsAddModalOpen(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#09090b] border border-white/10 rounded-[2rem] p-8 shadow-2xl overflow-hidden"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-extrabold text-white tracking-tight">New Tenant</h3>
                  <p className="text-xs text-zinc-500 font-medium mt-1">Add a new business to your workspace.</p>
                </div>
                <button disabled={isSubmitting} onClick={() => setIsAddModalOpen(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors disabled:opacity-50">
                  <X size={20} className="text-zinc-400 hover:text-white" />
                </button>
              </div>

              <form className="space-y-5" onSubmit={handleAddTenant}>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Business Name</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.businessName}
                    onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                    className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-white/30 text-white text-sm" 
                    placeholder="e.g. Acme Corp" 
                    disabled={isSubmitting}
                  />
                </div>

                {/* 🔥 NAYA INPUT: EMAIL KE LIYE */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Client Email</label>
                  <input 
                    type="email" 
                    required 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-white/30 text-white text-sm" 
                    placeholder="client@company.com" 
                    disabled={isSubmitting}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Owner Name</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.ownerName}
                      onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
                      className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-white/30 text-white text-sm" 
                      placeholder="John Doe" 
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Select Plan</label>
                    <select 
                      value={formData.plan}
                      onChange={(e) => setFormData({...formData, plan: e.target.value})}
                      className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-white/30 text-white text-sm appearance-none cursor-pointer"
                      disabled={isSubmitting}
                    >
                      <option className="bg-[#09090b]">Starter Plan</option>
                      <option className="bg-[#09090b]">Pro Plan</option>
                      <option className="bg-[#09090b]">Enterprise</option>
                    </select>
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full flex justify-center items-center gap-2 py-3.5 bg-white hover:bg-zinc-200 text-black font-bold rounded-xl mt-4 transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] active:scale-[0.98] disabled:opacity-70"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'Register Tenant'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BusinessProfile;