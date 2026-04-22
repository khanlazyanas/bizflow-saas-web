import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { Bell, Search, Command, Zap } from 'lucide-react'; // 🔥 Zap import kiya
import { AuthContext } from '../../context/AuthContext'; 

const Header = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate(); 

  const getInitials = (name) => {
    if (!name) return 'A'; 
    const nameParts = name.trim().split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return nameParts[0][0].toUpperCase();
  };

  const userName = user?.fullName || 'Admin';
  const userInitials = getInitials(userName);

  return (
    <header className="h-16 bg-[#09090b]/80 backdrop-blur-2xl border-b border-white/5 flex items-center justify-between px-8 sticky top-0 z-50 font-sans shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      
      <div className="flex items-center bg-black/40 border border-white/5 px-3 py-2.5 rounded-xl w-96 transition-all duration-300 focus-within:ring-1 focus-within:ring-white/20 focus-within:bg-black/60 focus-within:border-white/10 group shadow-inner">
        <Search size={16} className="text-zinc-500 group-focus-within:text-white mr-2.5 transition-colors" />
        <input 
          type="text" 
          placeholder="Search tenants, invoices..." 
          className="bg-transparent border-none outline-none text-sm w-full text-white placeholder-zinc-500 font-medium"
        />
        <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded-md border border-white/10 bg-white/5 text-[10px] font-bold text-zinc-400 shadow-sm">
          <Command size={10} /> K
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="text-zinc-400 hover:text-white transition-colors relative group">
          <Bell size={20} className="group-hover:rotate-12 transition-transform duration-300" />
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#09090b] shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
        </button>

        <div 
          onClick={() => navigate('/dashboard/settings')} 
          className="flex items-center gap-3 cursor-pointer pl-6 border-l border-white/10 hover:opacity-80 transition-opacity"
        >
          <div className="hidden md:block text-right">
            <p className="text-sm font-bold text-white leading-none mb-1">{userName}</p>
            {/* 🔥 PRO BADGE LOGIC HERE */}
            <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              {user?.isPro ? (
                <span className="text-indigo-400 flex items-center justify-end gap-1">
                  PRO MEMBER <Zap size={10} fill="currentColor" />
                </span>
              ) : (
                "Admin"
              )}
            </p>
          </div>
          
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-600 flex items-center justify-center shadow-lg ring-2 ring-white/5 overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-sm font-black">{userInitials}</span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;