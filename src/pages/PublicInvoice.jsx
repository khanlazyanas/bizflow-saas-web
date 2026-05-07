import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2, CreditCard, Download, Loader2, Receipt, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const PublicInvoice = () => {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    fetchInvoice();
    // Razorpay ka script load karna zaroori hai
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, [id]);

  const fetchInvoice = async () => {
    try {
      const { data } = await axios.get(`/api/invoices/public/${id}`);
      setInvoice(data.invoice);
    } catch (error) {
      toast.error("Invalid or Expired Invoice Link");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setIsPaying(true);
    try {
      // 1. Backend se Razorpay Order create karwao
      const { data: orderData } = await axios.post(`/api/invoices/${id}/pay`);
      
      // 2. Razorpay ki API Key mangwao
      const { data: keyData } = await axios.get('/api/payments/getkey');

      const options = {
        key: keyData.key,
        amount: orderData.order.amount,
        currency: "INR",
        name: invoice.user.businessName, // Tumhara business name
        description: `Payment for Invoice ${invoice.invoiceNumber}`,
        image: invoice.user.avatar || "",
        order_id: orderData.order.id,
        handler: async function (response) {
          // 3. Payment verify karwao
          try {
            const verifyData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              invoice_id: id
            };

            const { data: vRes } = await axios.post('/api/invoices/verify-payment', verifyData);
            
            if (vRes.success) {
              toast.success("Payment Successful! 🎉");
              fetchInvoice(); // Data refresh karo
            }
          } catch (err) {
            toast.error("Payment Verification Failed!");
          }
        },
        prefill: {
          name: invoice.tenant.businessName,
          email: invoice.tenant.email,
        },
        theme: { color: "#4f46e5" },
      };

      const razor = new window.Razorpay(options);
      razor.open();
    } catch (error) {
      toast.error("Could not initiate payment. Please try again.");
    } finally {
      setIsPaying(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-white" /></div>;
  if (!invoice) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Invoice not found or link expired.</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8 font-sans">
      <div className="max-w-3xl mx-auto bg-[#09090b] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
        
        {/* Header Section */}
        <div className="bg-indigo-600 p-8 md:p-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tighter">INVOICE</h1>
            <p className="text-indigo-100 font-medium mt-1">{invoice.invoiceNumber}</p>
          </div>
          <div className="text-right">
            <h3 className="text-xl font-bold">{invoice.user.businessName}</h3>
            <p className="text-indigo-100 text-sm">{invoice.user.email}</p>
          </div>
        </div>

        <div className="p-8 md:p-12 space-y-10">
          {/* Status Badge */}
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Billed To</p>
              <h2 className="text-xl font-bold text-white">{invoice.tenant.businessName}</h2>
              <p className="text-zinc-400 text-sm">{invoice.tenant.email}</p>
            </div>
            <div className="text-right">
              {invoice.status === 'Paid' ? (
                <div className="bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-2xl border border-emerald-500/20 flex items-center gap-2 font-bold">
                  <CheckCircle2 size={18} /> Fully Paid
                </div>
              ) : (
                <div className="bg-red-500/10 text-red-400 px-4 py-2 rounded-2xl border border-red-500/20 font-bold">
                  Payment Pending
                </div>
              )}
            </div>
          </div>

          {/* Amount Box */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <p className="text-zinc-500 text-sm font-medium">Total Amount Due</p>
              <h2 className="text-5xl font-black mt-1 tracking-tight text-indigo-400">
                ${invoice.amount.toLocaleString()}
              </h2>
            </div>
            {invoice.status !== 'Paid' && (
              <button 
                onClick={handlePayment}
                disabled={isPaying}
                className="w-full md:w-auto bg-white hover:bg-zinc-200 text-black px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
              >
                {isPaying ? <Loader2 className="animate-spin" size={20} /> : <><CreditCard size={20} /> Pay Online Now</>}
              </button>
            )}
          </div>

          {/* Details Table */}
          <div className="space-y-4">
             <div className="flex justify-between text-sm font-bold text-zinc-500 uppercase tracking-widest border-b border-white/5 pb-4">
                <span>Description</span>
                <span>Amount</span>
             </div>
             <div className="flex justify-between text-lg font-medium py-2">
                <span className="text-zinc-300">SaaS Subscription & Workspace Services</span>
                <span className="text-white">${invoice.amount.toLocaleString()}</span>
             </div>
          </div>

          {/* Footer Info */}
          <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-zinc-500 text-sm">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-indigo-500" />
              Secure Payment via Razorpay
            </div>
            <p>© {new Date().getFullYear()} {invoice.user.businessName}. All rights reserved.</p>
          </div>
        </div>
      </div>
      
      <p className="text-center mt-8 text-zinc-600 text-xs">
        Powered by <span className="text-zinc-400 font-bold">Bizzflow</span> - Simple Invoicing for Pro Business.
      </p>
    </div>
  );
};

export default PublicInvoice;