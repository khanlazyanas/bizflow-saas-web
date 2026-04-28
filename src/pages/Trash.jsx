import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Trash2, Loader2, AlertCircle, Receipt } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

// --- Background Moving Glows (Consistent Theme) ---
const AnimatedBackground = () => (
  <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0.05, 0.15, 0.05], x: [0, 50, -50, 0], y: [0, -50, 50, 0], scale: [1, 1.1, 1, 1.1, 1] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="absolute top-[10%] left-[20%] w-[50rem] h-[50rem] bg-red-600 rounded-full mix-blend-screen filter blur-[160px]" />
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0.05, 0.1, 0.05], x: [0, -50, 50, 0], y: [0, 50, -50, 0], scale: [1, 1.05, 1, 1.05, 1] }} transition={{ duration: 20, repeat: Infinity, ease: "linear", delay: 2 }} className="absolute bottom-[10%] right-[20%] w-[45rem] h-[45rem] bg-orange-700 rounded-full mix-blend-screen filter blur-[160px]" />
  </div>
);

const Trash = () => {
  const navigate = useNavigate();
  
  const [trashedInvoices, setTrashedInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionId, setActionId] = useState(null); // Button spin dikhane ke liye
  const [isEmptying, setIsEmptying] = useState(false);

  useEffect(() => {
    fetchTrashedInvoices();
  }, []);

  const fetchTrashedInvoices = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get('/api/invoices/trash');
      setTrashedInvoices(data.invoices || []);
    } catch (error) {
      console.error("Error fetching trash:", error);
      toast.error("Failed to load trash items.");
    } finally {
      setIsLoading(false);
    }
  };

  // ♻️ RESTORE INVOICE
  const handleRestore = async (id) => {
    setActionId(id);
    try {
      await axios.put(`/api/invoices/${id}/restore`);
      setTrashedInvoices(trashedInvoices.filter(inv => inv._id !== id));
      toast.success("Invoice restored successfully! ♻️");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to restore invoice.");
    } finally {
      setActionId(null);
    }
  };

  // ❌ PERMANENT DELETE
  const handlePermanentDelete = async (id) => {
    if (!window.confirm("Are you sure? This action cannot be undone and the invoice will be deleted FOREVER.")) return;
    
    setActionId(id);
    try {
      await axios.delete(`/api/invoices/${id}/permanent`);
      setTrashedInvoices(trashedInvoices.filter(inv => inv._id !== id));
      toast.success("Invoice permanently deleted. 🗑️");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete invoice permanently.");
    } finally {
      setActionId(null);
    }
  };

  // 🧹 EMPTY ENTIRE TRASH
  const handleEmptyTrash = async () => {
    if (trashedInvoices.length === 0) return;
    if (!window.confirm("Empty entire recycle bin? ALL invoices here will be permanently deleted.")) return;

    setIsEmptying(true);
    try {
      // Loop run karke sabko delete karenge
      await Promise.all(trashedInvoices.map(inv => axios.delete(`/api/invoices/${inv._id}/permanent`)));
      setTrashedInvoices([]);
      toast.success("Recycle bin emptied successfully!");
    } catch (error) {
      toast.error("Some items failed to delete. Please try again.");
      fetchTrashedInvoices(); // Refresh data just in case
    } finally {
      setIsEmptying(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown Date";
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } };

  return (
    <div className="relative bg-black min-h-screen font-sans">
      <AnimatedBackground />
      
      <div className="relative z-10 selection:bg-white selection:text-black p-4 md:p-8">
        <motion.div initial="hidden" animate="show" variants={containerVariants} className="max-w-4xl mx-auto">
          
          <motion.div variants={itemVariants} className="mb-6">
            <button 
              onClick={() => navigate('/dashboard/invoices')} // Aapka Invoices route update kar lena agar alag ho
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-semibold w-fit"
            >
              <ArrowLeft size={16} /> Back to Invoices
            </button>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight mb-1.5 flex items-center gap-3">
                <Trash2 className="text-red-500" size={28} /> Recycle Bin
              </h2>
              <p className="text-sm text-zinc-500 font-medium">Restore deleted invoices or permanently erase them.</p>
            </div>
            
            <button 
              onClick={handleEmptyTrash}
              disabled={trashedInvoices.length === 0 || isEmptying}
              className="group flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-5 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isEmptying ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} className="group-hover:scale-110 transition-transform" />} 
              Empty Trash
            </button>
          </motion.div>

          {/* Warning Banner */}
          <motion.div variants={itemVariants} className="mb-8 flex items-start sm:items-center gap-3 bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl text-amber-500 text-sm font-medium">
            <AlertCircle size={20} className="shrink-0 mt-0.5 sm:mt-0" />
            <p>Items in the recycle bin are automatically deleted permanently after 30 days.</p>
          </motion.div>

          <div className="space-y-4 min-h-[300px]">
            {isLoading ? (
               <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
                 <Loader2 className="animate-spin mb-4" size={32} />
                 <p className="text-sm font-medium">Loading trash...</p>
               </div>
            ) : trashedInvoices.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-64 text-zinc-500 bg-[#09090b]/40 border border-white/5 rounded-[1.5rem] border-dashed">
                 <div className="bg-white/5 p-4 rounded-full mb-4"><Trash2 size={32} className="opacity-50" /></div>
                 <p className="text-sm font-bold text-white mb-1">Recycle Bin is empty</p>
                 <p className="text-xs">No deleted invoices found.</p>
               </div>
            ) : (
              trashedInvoices.map((invoice) => (
                <motion.div key={invoice._id} variants={itemVariants} className="bg-[#09090b]/60 backdrop-blur-xl p-5 sm:p-6 rounded-[1.5rem] border border-red-500/10 shadow-2xl hover:border-red-500/30 transition-all group flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-5 w-full sm:w-auto">
                    <div className="w-12 h-12 shrink-0 rounded-xl bg-red-500/5 flex items-center justify-center border border-red-500/10 font-bold text-red-400">
                      <Receipt size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-bold text-zinc-300 group-hover:text-white transition-colors line-clamp-1 opacity-70 group-hover:opacity-100 line-through decoration-zinc-500">
                        {invoice.tenant?.businessName || 'Unknown Tenant'}
                      </p>
                      
                      <div className="flex items-center flex-wrap gap-2 text-xs text-zinc-500 mt-1">
                        <span className="font-mono">{invoice.invoiceNumber}</span>
                        <span className="text-zinc-700">•</span>
                        <span className="font-sans font-semibold text-red-400/70">
                          Deleted: {formatDate(invoice.deletedAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-between sm:justify-end border-t border-white/5 sm:border-none pt-4 sm:pt-0 mt-2 sm:mt-0">
                    <span className="font-mono text-xl font-extrabold text-zinc-500 tracking-tight">
                      ${Number(invoice.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                    
                    <div className="flex gap-2">
                      {/* Restore Button */}
                      <button 
                        onClick={() => handleRestore(invoice._id)}
                        disabled={actionId === invoice._id}
                        className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/10 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 text-xs font-bold"
                      >
                        {actionId === invoice._id ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />} 
                        Restore
                      </button>
                      
                      {/* Permanent Delete Button */}
                      <button 
                        onClick={() => handlePermanentDelete(invoice._id)}
                        disabled={actionId === invoice._id}
                        className="flex items-center gap-1.5 text-zinc-400 hover:text-white bg-zinc-800 hover:bg-red-500 border border-white/5 hover:border-red-500 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 text-xs font-bold"
                      >
                        {actionId === invoice._id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} 
                        Delete Forever
                      </button>
                    </div>

                  </div>
                </motion.div>
              ))
            )}
          </div>

        </motion.div>
      </div>
    </div>
  );
};

export default Trash;