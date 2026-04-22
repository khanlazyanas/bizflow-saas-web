import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../common/Sidebar';
import Header from '../common/Header';
import { motion } from 'framer-motion';
import { Menu } from 'lucide-react'; // Premium icon import kiya hai

// --- GLOBAL BACKGROUND: Yeh sirf ek baar load hoga aur hamesha ghoomta rahega ---
const AnimatedBackground = () => (
  <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-black">
    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0.1, 0.25, 0.1], x: [0, 50, -50, 0], y: [0, -50, 50, 0], scale: [1, 1.1, 1, 1.1, 1] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="absolute top-[10%] left-[20%] w-[50rem] h-[50rem] bg-blue-600 rounded-full mix-blend-screen filter blur-[160px]" />
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0.1, 0.2, 0.1], x: [0, -50, 50, 0], y: [0, 50, -50, 0], scale: [1, 1.05, 1, 1.05, 1] }} transition={{ duration: 20, repeat: Infinity, ease: "linear", delay: 2 }} className="absolute bottom-[10%] right-[20%] w-[45rem] h-[45rem] bg-indigo-700 rounded-full mix-blend-screen filter blur-[160px]" />
  </div>
);

const AdminLayout = () => {
  // Sidebar ki state manage karne ke liye
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    // DARK MODE UPGRADE: bg-black and selection colors updated
    <div className="flex h-screen bg-black overflow-hidden font-sans selection:bg-white selection:text-black text-white relative">
      
      {/* 1. Global Animated Background (Sabse peeche) */}
      <AnimatedBackground />

      {/* 2. Mobile Background Overlay (Premium Frosted Glass effect) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-all duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 3. Responsive Sidebar Wrapper */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* On mobile, close sidebar if someone clicks a link inside it */}
        <div onClick={() => { if(window.innerWidth < 768) setIsSidebarOpen(false) }}>
          <Sidebar />
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen relative min-w-0 z-10">
        
        {/* 4. Header Section with Premium Mobile Toggle Button */}
        {/* Is div ka apna background hata diya taaki Header ka glass effect dikhe */}
        <div className="relative w-full z-50 flex items-center">
          
          {/* Hamburger Menu (Sirf Mobile Pe Dikhega) - Premium Button */}
          <button 
            className="md:hidden absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/5 border border-white/10 rounded-lg text-white z-50 hover:bg-white/10 transition-colors shadow-lg"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
          
          {/* Header Component */}
          {/* Mobile pe button ke liye jagah banane ke liye pl-16 diya hai */}
          <div className="flex-1 w-full md:pl-0 pl-14">
            <Header />
          </div>
        </div>

        {/* Dynamic Pages Area */}
        <div className="flex-1 overflow-y-auto relative z-10 custom-scrollbar">
          {/* Aapke purane padding container ko hata diya kyunki pages ke andar already padding hai */}
          <Outlet /> 
        </div>
        
      </main>
    </div>
  );
};

export default AdminLayout;