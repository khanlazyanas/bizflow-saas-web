import React, { useState, useEffect, useContext } from 'react';
import { Plus, Download, Receipt, X, Loader2, FileX, Search, Trash2, CheckCircle, Copy, XCircle, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AnimatedBackground = () => (
  <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0.1, 0.25, 0.1], x: [0, 50, -50, 0], y: [0, -50, 50, 0], scale: [1, 1.1, 1, 1.1, 1] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="absolute top-[10%] left-[20%] w-[50rem] h-[50rem] bg-blue-600 rounded-full mix-blend-screen filter blur-[160px]" />
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0.1, 0.2, 0.1], x: [0, -50, 50, 0], y: [0, 50, -50, 0], scale: [1, 1.05, 1, 1.05, 1] }} transition={{ duration: 20, repeat: Infinity, ease: "linear", delay: 2 }} className="absolute bottom-[10%] right-[20%] w-[45rem] h-[45rem] bg-indigo-700 rounded-full mix-blend-screen filter blur-[160px]" />
  </div>
);

const Invoices = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState(''); 
  
  const [deletingId, setDeletingId] = useState(null);
  const [payingId, setPayingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const [invoices, setInvoices] = useState([]);
  const [tenants, setTenants] = useState([]);

  const [formData, setFormData] = useState({
    tenantId: '',
    amount: '',
    dueDate: ''
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const [invoiceRes, tenantRes] = await Promise.all([
        axios.get('/api/invoices'),
        axios.get('/api/tenants')
      ]);
      
      setInvoices(invoiceRes.data.invoices || []);
      setTenants(tenantRes.data.tenants || []);
      
      if (tenantRes.data.tenants && tenantRes.data.tenants.length > 0) {
        setFormData(prev => ({ ...prev, tenantId: tenantRes.data.tenants[0]._id }));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load invoices.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    if (!formData.tenantId) return toast.error("Please select a tenant first.");
    if (Number(formData.amount) <= 0) return toast.error("Amount must be greater than zero."); 

    setIsSubmitting(true);
    try {
      const { data } = await axios.post('/api/invoices', {
        tenantId: formData.tenantId,
        amount: Number(formData.amount),
        dueDate: formData.dueDate
      });

      setInvoices([data.invoice, ...invoices]);
      toast.success("Invoice generated successfully!");
      
      setIsInvoiceModalOpen(false);
      setFormData({ ...formData, amount: '', dueDate: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create invoice.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🔥 UPDATE: Hard delete ki jagah Soft Delete (Trash)
  const handleDeleteInvoice = async (id) => {
    if (!window.confirm("Move this invoice to Recycle Bin? It will be permanently deleted after 30 days.")) return;
    
    setDeletingId(id);
    try {
      await axios.delete(`/api/invoices/${id}`);
      setInvoices(invoices.filter(inv => inv._id !== id));
      toast.success("Invoice moved to Trash! 🗑️");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete invoice.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (invoice) => {
    setPayingId(invoice._id);
    const newStatus = invoice.status === 'Paid' ? 'Unpaid' : 'Paid';
    try {
      await axios.put(`/api/invoices/${invoice._id}`, { status: newStatus });
      setInvoices(invoices.map(inv => inv._id === invoice._id ? { ...inv, status: newStatus } : inv));
      toast.success(`Invoice marked as ${newStatus}!`, { icon: newStatus === 'Paid' ? '💸' : '🔄' });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status.");
    } finally {
      setPayingId(null);
    }
  };

  const handleCopyInvoiceNumber = (text) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied: ${text}`, { icon: '📋', style: { borderRadius: '10px', background: '#18181b', color: '#fff' } });
  };

  const generatePDF = (invoice) => {
    if (!user?.isPro) {
      toast.error("PDF Download is a Pro feature! 🔒 Upgrade to unlock.", {
        style: { borderRadius: '10px', background: '#312e81', color: '#fff' }
      });
      return navigate('/dashboard/settings'); 
    }

    setDownloadingId(invoice._id);
    try {
      const doc = new jsPDF();
      const businessName = invoice.tenant?.businessName || invoice.tenant?.name || 'Client';

      doc.setFontSize(28);
      doc.setTextColor(79, 70, 229); 
      doc.text("INVOICE", 14, 25);

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text("BizFlow Workspace", 14, 35);
      doc.text("Lucknow, Uttar Pradesh, India", 14, 41);

      doc.setFontSize(10);
      doc.setTextColor(50);
      doc.text(`Invoice No: ${invoice.invoiceNumber}`, 130, 35);
      doc.text(`Date Issued: ${formatDate(invoice.createdAt || new Date())}`, 130, 41);
      doc.text(`Due Date: ${formatDate(invoice.dueDate)}`, 130, 47);
      doc.text(`Status: ${invoice.status}`, 130, 53);

      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text("Billed To:", 14, 60);
      doc.setFontSize(11);
      doc.setTextColor(80);
      doc.text(businessName, 14, 66);

      autoTable(doc, {
        startY: 75,
        head: [['Description', 'Amount']],
        body: [
          ['SaaS Subscription / Workspace Services', `$${Number(invoice.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`]
        ],
        foot: [['Total Due', `$${Number(invoice.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`]],
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229], textColor: 255 }, 
        footStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: 'bold' }
      });

      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(9);
      doc.setTextColor(150);
      doc.text("Thank you for your business!", 105, pageHeight - 15, null, null, "center");

      doc.save(`${invoice.invoiceNumber}.pdf`);
      toast.success("PDF Downloaded successfully!");
    } catch (error) {
      console.error("PDF generation error: ", error);
      toast.error("Failed to generate PDF.");
    } finally {
      setDownloadingId(null);
    }
  };

  const filteredInvoices = invoices.filter(invoice => 
    (invoice.invoiceNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (invoice.tenant?.businessName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
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
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
            <div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight mb-1.5">Invoices & Billing</h2>
              <p className="text-sm text-zinc-500 font-medium">Track payments and generate new invoices.</p>
            </div>
            
            <div className="flex gap-3">
              {/* 🔥 NEW: Trash Button */}
              <button 
                onClick={() => navigate('/dashboard/trash')}
                className="group flex items-center gap-2 bg-zinc-900 border border-white/10 hover:bg-zinc-800 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95"
              >
                <Trash2 size={18} className="text-zinc-400 group-hover:text-red-400 transition-colors" /> Recycle Bin
              </button>

              <button 
                onClick={() => setIsInvoiceModalOpen(true)}
                className="group flex items-center gap-2 bg-white hover:bg-zinc-200 text-black px-5 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              >
                <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" /> Create Invoice
              </button>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-6 relative w-full">
             <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-500" size={18} />
             <input 
               type="text" 
               placeholder="Search by Invoice Number or Tenant Name..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-11 pr-4 py-3.5 bg-[#09090b]/80 backdrop-blur-xl border border-white/10 rounded-2xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 transition-all shadow-2xl"
             />
          </motion.div>

          <div className="space-y-4 min-h-[300px]">
            {isLoading ? (
               <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
                 <Loader2 className="animate-spin mb-4" size={32} />
                 <p className="text-sm font-medium">Loading invoices...</p>
               </div>
            ) : filteredInvoices.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-64 text-zinc-500 bg-[#09090b]/40 border border-white/5 rounded-[1.5rem]">
                 <div className="bg-white/5 p-4 rounded-full mb-4"><FileX size={32} /></div>
                 <p className="text-sm font-bold text-white mb-1">No invoices found</p>
                 <p className="text-xs">{searchTerm ? 'Try a different search term.' : 'Generate your first bill to start tracking revenue.'}</p>
               </div>
            ) : (
              filteredInvoices.map((invoice) => (
                <motion.div key={invoice._id} variants={itemVariants} className="bg-[#09090b]/60 backdrop-blur-xl p-5 sm:p-6 rounded-[1.5rem] border border-white/5 shadow-2xl hover:border-white/10 transition-all group flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-5 w-full sm:w-auto">
                    <div className="w-12 h-12 shrink-0 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 font-bold text-zinc-300 group-hover:bg-white/10 transition-colors">
                      <Receipt size={20} className="text-zinc-400 group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-bold text-zinc-100 group-hover:text-white transition-colors line-clamp-1">
                        {invoice.tenant?.businessName || invoice.tenant?.name || 'Unknown Tenant'}
                      </p>
                      
                      <div className="flex items-center flex-wrap gap-2 text-xs text-zinc-500 mt-1">
                        <button 
                          onClick={() => handleCopyInvoiceNumber(invoice.invoiceNumber)}
                          className="font-mono flex items-center gap-1 hover:text-white transition-colors group/copy"
                        >
                          {invoice.invoiceNumber}
                          <Copy size={12} className="opacity-0 group-hover/copy:opacity-100 transition-opacity" />
                        </button>
                        <span className="text-zinc-700">•</span>
                        <span className={`font-sans font-semibold ${invoice.status === 'Paid' ? 'text-zinc-500' : 'text-zinc-400'}`}>
                          Due: {formatDate(invoice.dueDate)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-between sm:justify-end border-t border-white/5 sm:border-none pt-4 sm:pt-0 mt-2 sm:mt-0">
                    <span className="font-mono text-xl font-extrabold text-white tracking-tight">
                      ${Number(invoice.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    
                    {invoice.status === 'Paid' ? (
                      <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-bold border border-emerald-500/20 shadow-[0_0_10px_rgba(52,211,153,0.1)]">Paid</span>
                    ) : (
                      <span className="bg-red-500/10 text-red-400 px-3 py-1.5 rounded-lg text-xs font-bold border border-red-500/20 shadow-[0_0_10px_rgba(248,113,113,0.1)]">Unpaid</span>
                    )}
                    
                    <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      
                      <button 
                        onClick={() => handleToggleStatus(invoice)}
                        disabled={payingId === invoice._id}
                        className={`p-2 rounded-lg transition-all disabled:opacity-50 ${
                          invoice.status === 'Paid' 
                            ? 'text-emerald-400 hover:text-zinc-400 hover:bg-zinc-500/10' 
                            : 'text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10'
                        }`}
                        title={invoice.status === 'Paid' ? "Mark as Unpaid" : "Mark as Paid"}
                      >
                        {payingId === invoice._id ? <Loader2 size={18} className="animate-spin" /> : (invoice.status === 'Paid' ? <XCircle size={18} /> : <CheckCircle size={18} />)}
                      </button>

                      <button 
                        onClick={() => generatePDF(invoice)}
                        disabled={downloadingId === invoice._id}
                        className={`p-2 rounded-lg transition-all disabled:opacity-50 ${user?.isPro ? 'text-zinc-400 hover:text-white hover:bg-white/10' : 'text-indigo-400/50 hover:bg-indigo-500/10 hover:text-indigo-400 relative'}`}
                        title={user?.isPro ? "Download PDF" : "Pro Feature: Upgrade to Download"}
                      >
                        {!user?.isPro && <Lock size={10} className="absolute top-1 right-1" />}
                        {downloadingId === invoice._id ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                      </button>
                      
                      <button 
                        onClick={() => handleDeleteInvoice(invoice._id)}
                        disabled={deletingId === invoice._id}
                        className="text-zinc-400 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-all disabled:opacity-50"
                        title="Delete Invoice"
                      >
                        {deletingId === invoice._id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                      </button>
                    </div>

                  </div>
                </motion.div>
              ))
            )}
          </div>

        </motion.div>
      </div>

      {/* --- CREATE INVOICE MODAL --- */}
      <AnimatePresence>
        {isInvoiceModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/60 backdrop-blur-md" 
              onClick={() => !isSubmitting && setIsInvoiceModalOpen(false)} 
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="relative w-full max-w-md bg-[#09090b] border border-white/10 rounded-[2rem] p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-extrabold text-white tracking-tight">Draft Invoice</h3>
                  <p className="text-xs text-zinc-500 font-medium mt-1">Generate a new bill for a tenant.</p>
                </div>
                <button onClick={() => setIsInvoiceModalOpen(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors disabled:opacity-50" disabled={isSubmitting}>
                  <X size={20} className="text-zinc-400 hover:text-white" />
                </button>
              </div>

              <form className="space-y-5" onSubmit={handleCreateInvoice}>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Select Tenant</label>
                  {tenants.length === 0 ? (
                     <div className="w-full px-4 py-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 text-sm">
                       Please add a Tenant from the directory first to generate an invoice.
                     </div>
                  ) : (
                    <select 
                      required
                      value={formData.tenantId}
                      onChange={(e) => setFormData({...formData, tenantId: e.target.value})}
                      className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-white/30 text-white text-sm appearance-none cursor-pointer"
                      disabled={isSubmitting}
                    >
                      {tenants.map(t => (
                        <option key={t._id} value={t._id} className="bg-[#09090b]">{t.businessName}</option>
                      ))}
                    </select>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Amount ($)</label>
                    <input 
                      type="number" 
                      required 
                      min="0.01"
                      step="0.01" 
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-white/30 text-white text-sm font-mono" 
                      placeholder="0.00" 
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Due Date</label>
                    <input 
                      type="date" 
                      required 
                      value={formData.dueDate}
                      onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                      className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-white/30 text-white text-sm" 
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={isSubmitting || tenants.length === 0}
                  className="w-full flex justify-center items-center gap-2 py-3.5 bg-white hover:bg-zinc-200 text-black font-bold rounded-xl mt-4 transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] active:scale-[0.98] disabled:opacity-70"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'Generate & Send'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Invoices;