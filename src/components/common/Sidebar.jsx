import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, Settings, LogOut, Command } from 'lucide-react';
import { motion } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext'; // Context Import kiya

const Sidebar = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext); // Logout function nikala

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Tenants', path: '/dashboard/tenants', icon: Users },
    { name: 'Invoices', path: '/dashboard/invoices', icon: FileText },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings },
  ];

  // Asli Logout handle karne wala function
  const handleLogout = async () => {
    try {
      await logout(); // Backend ko bolega cookie hata do
      navigate('/login'); // Phir login page par bhej dega
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    // DARK MODE UPGRADE: Deep black/zinc with a very subtle right border
    <aside className="w-[260px] bg-[#09090b] flex flex-col h-screen border-r border-white/5 font-sans relative z-30 shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
      
      {/* Brand Logo Area */}
      <div className="h-20 flex items-center px-7 mt-2 relative">
        {/* Subtle glow behind logo */}
        <div className="absolute left-8 w-10 h-10 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
        
        <div className="relative bg-white text-black p-1.5 rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.2)] mr-3">
          <Command size={20} strokeWidth={2.5} />
        </div>
        <h2 className="text-xl font-extrabold text-white tracking-tight">BizFlow<span className="text-zinc-500">.</span></h2>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <p className="px-4 text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-4">Workspace</p>
        
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/dashboard'}
              className="relative block"
            >
              {({ isActive }) => (
                <div className={`relative flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-300 group ${
                  isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.02]'
                }`}>
                  
                  {/* MAGIC INDICATOR: Smooth sliding background for active tab */}
                  {isActive && (
                    <motion.div 
                      layoutId="sidebarActiveTab"
                      className="absolute inset-0 bg-white/10 border border-white/10 rounded-xl shadow-inner"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 24 }}
                    />
                  )}

                  {/* Icon & Text (z-10 to stay above the active background) */}
                  <span className="relative z-10">
                    <Icon size={18} className={`${isActive ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'} transition-colors`} />
                  </span>
                  <span className={`relative z-10 text-sm font-bold ${isActive ? 'tracking-wide' : ''}`}>
                    {item.name}
                  </span>
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User / Logout Area */}
      <div className="p-4 border-t border-white/5 bg-[#09090b]">
        {/* YAHAN ONCLICK LAGA DIYA HAI */}
        <button onClick={handleLogout} className="flex items-center gap-3.5 px-4 py-3 w-full rounded-xl text-zinc-500 hover:bg-red-500/10 hover:border-red-500/20 border border-transparent hover:text-red-400 transition-all duration-300 group shadow-sm hover:shadow-[0_0_15px_rgba(248,113,113,0.1)]">
          <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold">Log out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;