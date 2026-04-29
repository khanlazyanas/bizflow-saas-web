import React, { useState, useEffect } from 'react';
import { Users, CreditCard, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight, Activity, Calendar, Download, Loader2, Minus, Sparkles } from 'lucide-react'; // 🔥 NAYA IMPORT: Sparkles
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom'; 

// --- PREMIUM DARK TOOLTIP ---
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 5, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        className="bg-[#18181b]/90 backdrop-blur-xl text-white text-xs rounded-xl py-3 px-4 shadow-3xl border border-white/10"
      >
        <p className="font-semibold text-zinc-400 mb-1.5">{label}</p>
        <p className="font-extrabold text-lg bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-500">
          ${payload[0].value.toLocaleString()}
        </p>
      </motion.div>
    );
  }
  return null;
};

// --- Background Moving Glows ---
const AnimatedBackground = () => (
  <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0.1, 0.25, 0.1], x: [0, 50, -50, 0], y: [0, -50, 50, 0], scale: [1, 1.1, 1, 1.1, 1] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="absolute top-[10%] left-[20%] w-[50rem] h-[50rem] bg-blue-600 rounded-full mix-blend-screen filter blur-[160px]" />
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0.1, 0.2, 0.1], x: [0, -50, 50, 0], y: [0, 50, -50, 0], scale: [1, 1.05, 1, 1.05, 1] }} transition={{ duration: 20, repeat: Infinity, ease: "linear", delay: 2 }} className="absolute bottom-[10%] right-[20%] w-[45rem] h-[45rem] bg-indigo-700 rounded-full mix-blend-screen filter blur-[160px]" />
  </div>
);

const Overview = () => {
  const navigate = useNavigate(); 
  const [timeRange, setTimeRange] = useState('7D');
  const [activeIndex, setActiveIndex] = useState(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  
  // 🔥 NAYA STATE: AI Insights ke liye
  const [aiInsight, setAiInsight] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(true);

  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeTenants: 0,
    unpaidInvoices: 0,
    mrr: 0,
    revenueTrend: 0,
    tenantTrend: 0,
    invoiceTrend: 0,
    mrrTrend: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetchDashboardStats();
  }, [timeRange]);

  // 🔥 NAYA EFFECT: AI Insight load karne ke liye (Sirf ek baar chalega)
  useEffect(() => {
    fetchAiInsights();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(`/api/dashboard/stats?range=${timeRange}`);
      
      setStats({
        totalRevenue: data.stats?.totalRevenue || 0,
        activeTenants: data.stats?.activeTenants || 0,
        unpaidInvoices: data.stats?.unpaidInvoices || 0,
        mrr: data.stats?.mrr || 0,
        revenueTrend: data.stats?.revenueTrend || 0,
        tenantTrend: data.stats?.tenantTrend || 0,
        invoiceTrend: data.stats?.invoiceTrend || 0,
        mrrTrend: data.stats?.mrrTrend || 0
      });
      setRecentActivity(data.recentActivity || []);
      setChartData(data.chartData || []); 
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  // 🔥 NAYA FUNCTION: API se AI Analytics mangwane ke liye
  const fetchAiInsights = async () => {
    try {
      setIsAiLoading(true);
      const { data } = await axios.get('/api/ai/insights');
      if (data.success) {
        setAiInsight(data.insight);
      }
    } catch (error) {
      console.error("AI Insight Error:", error);
      setAiInsight("Unable to generate AI insights right now. Keep tracking your revenues!");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      const toastId = toast.loading("Generating your report...");
      
      const response = await axios.get('/api/dashboard/export', { responseType: 'blob' });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'BizFlow_Revenue_Report.csv');
      document.body.appendChild(link);
      link.click();
      link.remove(); 

      toast.success("Report downloaded successfully! 📊", { id: toastId });
    } catch (error) {
      console.error("Export error:", error);
      toast.dismiss();
      toast.error("Failed to generate report");
    } finally {
      setIsExporting(false);
    }
  };

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } };

  const timeAgo = (date) => {
    if (!date) return "Just now";
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "m ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " min ago";
    return Math.floor(seconds) > 0 ? Math.floor(seconds) + " sec ago" : "Just now";
  };

  const StatCard = ({ title, value, icon: Icon, trend, reverseLogic = false }) => {
    const isZero = trend === 0;
    const isPositive = trend > 0;
    
    let badgeClass = '';
    let TrendIcon = Minus;

    if (isZero) {
      badgeClass = 'text-zinc-400 bg-zinc-500/10 shadow-none';
      TrendIcon = Minus;
    } else if ((isPositive && !reverseLogic) || (!isPositive && reverseLogic)) {
      badgeClass = 'text-emerald-400 bg-emerald-500/10 shadow-[0_0_10px_rgba(52,211,153,0.1)]';
      TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight;
    } else {
      badgeClass = 'text-red-400 bg-red-500/10 shadow-[0_0_10px_rgba(248,113,113,0.1)]';
      TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight;
    }
    
    return (
      <motion.div variants={itemVariants} className="group relative bg-[#09090b]/60 backdrop-blur-xl p-6 rounded-[1.5rem] border border-white/5 hover:border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] transition-all duration-500 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-white/5 rounded-xl border border-white/5 group-hover:bg-white group-hover:text-black group-hover:scale-110 transition-all duration-500">
              <Icon size={22} className="text-zinc-400 group-hover:text-black transition-colors" />
            </div>
            
            <span className={`flex items-center text-xs font-bold px-3 py-1.5 rounded-full ${badgeClass}`}>
              <TrendIcon size={14} className="mr-1.5"/> 
              {Math.abs(trend)}%
            </span>
          </div>
          <p className="text-sm font-semibold text-zinc-500 mb-1.5">{title}</p>
          <h3 className="text-4xl font-extrabold text-white tracking-tight">
            {isLoading ? <Loader2 className="animate-spin text-zinc-600 mt-2" size={24}/> : value}
          </h3>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="relative bg-black min-h-screen">
      <AnimatedBackground />
      <div className="relative z-10 selection:bg-white selection:text-black p-4 md:p-8">
        <motion.div initial="hidden" animate="show" variants={containerVariants} className="max-w-7xl mx-auto font-sans">
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
            <div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight mb-1.5">Overview</h2>
              <div className="text-sm text-zinc-500 font-medium flex items-center gap-2"><div className='w-2 h-2 rounded-full bg-emerald-400 animate-pulse'></div> Your workspace metrics at a glance.</div>
            </div>
            
            <button 
              onClick={handleExportData}
              disabled={isExporting}
              className="group flex items-center gap-2.5 bg-white hover:bg-zinc-200 text-black text-sm font-bold py-3 px-6 rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] active:scale-95 disabled:opacity-70">
              {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} className="group-hover:-translate-y-0.5 transition-transform" />}
              {isExporting ? 'Exporting...' : 'Export Data'}
            </button>
          </motion.div>

          {/* 🔥 NAYA FEATURE UI: AI Financial Advisor Widget */}
          <motion.div variants={itemVariants} className="mb-6 relative p-[1px] rounded-3xl bg-gradient-to-r from-indigo-500/50 via-purple-500/50 to-pink-500/50 shadow-[0_0_30px_rgba(99,102,241,0.15)] overflow-hidden">
            <div className="bg-[#09090b] rounded-3xl p-5 sm:p-6 flex items-start sm:items-center gap-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none"></div>
              
              <div className="p-3.5 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl border border-indigo-500/30 shrink-0 relative z-10">
                {isAiLoading ? <Loader2 size={26} className="animate-spin text-indigo-400" /> : <Sparkles size={26} className="text-indigo-400" />}
              </div>
              
              <div className="relative z-10 flex-1">
                <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  AI Financial Advisor
                  <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] uppercase tracking-wider font-extrabold rounded-md border border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                    Gemini Powered
                  </span>
                </h4>
                {isAiLoading ? (
                  <div className="space-y-2">
                    <div className="h-3.5 bg-white/5 rounded-md w-3/4 animate-pulse"></div>
                    <div className="h-3.5 bg-white/5 rounded-md w-1/2 animate-pulse"></div>
                  </div>
                ) : (
                  <p className="text-sm text-zinc-300 leading-relaxed font-medium">
                    {aiInsight}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
          {/* 🔥 AI WIDGET END */}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <StatCard title="Total Revenue" value={`$${stats.totalRevenue.toLocaleString()}`} icon={DollarSign} trend={stats.revenueTrend} />
            <StatCard title="Active Tenants" value={stats.activeTenants} icon={Users} trend={stats.tenantTrend} />
            <StatCard title="Unpaid Invoices" value={stats.unpaidInvoices} icon={CreditCard} trend={stats.invoiceTrend} reverseLogic={true} />
            <StatCard title="Est. MRR" value={`$${stats.mrr.toLocaleString()}`} icon={TrendingUp} trend={stats.mrrTrend} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <motion.div variants={itemVariants} className="bg-[#09090b]/60 backdrop-blur-xl p-7 rounded-[1.75rem] border border-white/5 shadow-2xl lg:col-span-2 flex flex-col relative overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/[0.015] rounded-full blur-3xl pointer-events-none"></div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 relative z-10">
                <div>
                  <h3 className="text-xl font-bold text-white">Revenue Analytics</h3>
                  <p className="text-xs text-zinc-500 font-medium mt-1">Metrics over time</p>
                </div>
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                  {['7D', '30D', '6M'].map((range) => (
                    <button 
                      key={range} onClick={() => setTimeRange(range)}
                      className={`relative px-5 py-2 text-xs font-bold rounded-lg transition-all ${timeRange === range ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                      {timeRange === range && <motion.div layoutId="activeDarkTab_ultra" className="absolute inset-0 bg-white/10 shadow-inner rounded-lg border border-white/10" />}
                      <span className="relative z-10 tracking-wide">{range}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="h-72 w-full flex-1 relative z-10 pr-2">
                {isLoading ? (
                  <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-zinc-600" size={24}/></div>
                ) : chartData.length === 0 ? (
                  <div className="flex justify-center items-center h-full text-sm text-zinc-500">No chart data for this period</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} onMouseMove={(s) => s.isTooltipActive ? setActiveIndex(s.activeTooltipIndex) : setActiveIndex(null)} onMouseLeave={() => setActiveIndex(null)}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12, fontWeight: 600 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12, fontWeight: 600 }} dx={-12} tickFormatter={(val) => `$${val > 999 ? (val/1000).toFixed(1) + 'k' : val}`} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.01)' }} />
                      <Bar dataKey="rev" radius={[8, 8, 0, 0]} maxBarSize={48}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell_ultra-${index}`} fill={activeIndex === index ? '#ffffff' : '#27272a'} className="transition-all duration-300 cursor-pointer" />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-[#09090b]/60 backdrop-blur-xl p-7 rounded-[1.75rem] border border-white/5 shadow-2xl flex flex-col relative overflow-hidden">
              <div className="flex justify-between items-center mb-8 relative z-10">
                <h3 className="text-xl font-bold text-white">Recent Activity</h3>
                <div className="p-2.5 bg-white/5 rounded-xl border border-white/5 shadow-inner"><Activity size={20} className="text-zinc-400" /></div>
              </div>
              
              <div className="space-y-7 flex-1 overflow-y-auto pr-3 relative z-10 ultra-scrollbar">
                {isLoading ? (
                  <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-zinc-600" size={24}/></div>
                ) : recentActivity.length === 0 ? (
                  <div className="text-center text-zinc-500 text-sm mt-10">No recent activity</div>
                ) : (
                  recentActivity.map((item, i) => (
                    <div key={item._id} className="flex items-start justify-between group cursor-pointer hover:bg-white/[0.03] p-3 -mx-3 rounded-2xl transition-all duration-300">
                      <div className="flex items-start gap-4">
                        <div className="relative mt-2">
                          <div className={`w-3 h-3 rounded-full ${item.status === 'Paid' ? 'bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.3)]' : 'bg-red-400 shadow-[0_0_15px_rgba(248,113,113,0.3)]'} ring-4 ring-[#09090b]/60`}></div>
                          {i !== recentActivity.length - 1 && <div className="absolute top-5 left-1/2 -translate-x-1/2 w-[2px] h-10 bg-white/5 group-hover:bg-white/10 transition-colors"></div>}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-zinc-400 group-hover:text-zinc-300 transition-colors">
                            {item.status === 'Paid' ? 'Payment received from ' : 'New invoice for '}
                            <span className="text-zinc-100 group-hover:text-white">{item.tenant?.businessName || 'Unknown Tenant'}</span>
                          </p>
                          <p className="text-xs text-zinc-500 font-medium mt-1 flex items-center gap-1.5"><Calendar size={11} className='text-zinc-600'/> {timeAgo(item.createdAt)}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-extrabold mt-1 tracking-tight ${item.status === 'Paid' ? 'text-emerald-400' : 'text-zinc-400'}`}>
                        {item.status === 'Paid' ? '+' : ''}${Number(item.amount).toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
              
              <button 
                onClick={() => navigate('/dashboard/invoices')}
                className="group relative z-10 w-full mt-6 py-3 text-sm font-bold text-zinc-300 hover:text-black hover:bg-white rounded-xl transition-all shadow-md active:scale-[0.98] border border-white/5 hover:border-white">
                View All Activity <span className="text-zinc-500 group-hover:text-black/50 ml-2 transition-colors">→</span>
              </button>

            </motion.div>

          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Overview;