import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  // FIX: isLoading ko context se nikalna bahut zaroori hai!
  const { user, isLoading } = useAuth();

  // 1. Agar backend se data aa raha hai, toh wait karo (Login par mat fenko)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-white mb-4" size={32} />
        <p className="text-zinc-500 text-sm font-medium animate-pulse">Verifying session...</p>
      </div>
    );
  }

  // 2. Loading khatam hone ke baad bhi agar user nahi hai, tabhi Login par bhejo
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. Sab sahi hai toh page dikha do
  return children;
};

export default ProtectedRoute;