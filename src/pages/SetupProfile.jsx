import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, FileText, ArrowRight, Loader2, ImagePlus } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const SetupProfile = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    gstNumber: ''
  });
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.businessName) return toast.error("Business Name is required");

    setIsLoading(true);
    try {
      // Data ko FormData mein pack karna padega kyunki hum image bhi bhej rahe hain
      const updateData = new FormData();
      updateData.append('businessName', formData.businessName);
      if (formData.gstNumber) updateData.append('gstNumber', formData.gstNumber);
      if (logoFile) updateData.append('avatar', logoFile);

      await axios.put('/api/auth/update-profile', updateData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success("Profile Setup Complete! 🚀");
      navigate('/dashboard'); // Setup hone ke baad dashboard par bhej do
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 text-white font-sans selection:bg-white selection:text-black relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 bg-[#09090b]/80 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Complete Setup</h1>
          <p className="text-zinc-400 text-sm">Let's personalize your Bizzflow workspace.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Logo Upload Section */}
          <div className="flex flex-col items-center justify-center mb-6">
            <label className="cursor-pointer group relative">
              <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center overflow-hidden bg-black/50 group-hover:border-indigo-500/50 transition-all">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <ImagePlus className="text-zinc-500 group-hover:text-indigo-400 transition-colors" size={28} />
                )}
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
            <span className="text-xs text-zinc-500 mt-3 font-medium">Upload Business Logo (Optional)</span>
          </div>

          {/* Business Name Field */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Business Name *</label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input 
                type="text" required value={formData.businessName} onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                className="w-full pl-11 pr-4 py-3.5 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all text-white font-medium"
                placeholder="e.g. Acme Corp"
              />
            </div>
          </div>

          {/* GST Number Field */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">GST Number (Optional)</label>
            <div className="relative">
              <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input 
                type="text" value={formData.gstNumber} onChange={(e) => setFormData({...formData, gstNumber: e.target.value.toUpperCase()})}
                className="w-full pl-11 pr-4 py-3.5 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all text-white font-medium uppercase"
                placeholder="22AAAAA0000A1Z5"
                maxLength="15"
              />
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="group w-full flex items-center justify-center gap-2 bg-white hover:bg-zinc-200 text-black font-bold py-3.5 px-4 rounded-xl transition-all mt-8 active:scale-[0.98]">
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : (
              <>Go to Dashboard <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SetupProfile;