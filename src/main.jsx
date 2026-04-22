import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.jsx';
import { Toaster } from 'react-hot-toast';
import axios from 'axios';

// === GLOBAL API CONFIGURATION ===
// Yahan ek baar URL set kar diya. Ab poore app mein bas axios.post('/api/auth/login') likhna hai!
export const BASE_URL = 'https://bizzflow-backend.onrender.com';
axios.defaults.baseURL = BASE_URL;
axios.defaults.withCredentials = true; // Cookies aur security ke liye bohot zaroori

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
      {/* Premium Dark Theme Toast Notifications */}
      <Toaster 
        position="top-right" 
        reverseOrder={false}
        toastOptions={{
          duration: 3500,
          style: {
            background: '#18181b', // Zinc-900 (Dark theme)
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 20px 40px -15px rgba(0,0,0,0.5)',
          },
          success: {
            iconTheme: { primary: '#34d399', secondary: '#18181b' }, // Emerald color
          },
          error: {
            iconTheme: { primary: '#f87171', secondary: '#18181b' }, // Red color
          },
        }} 
      />
    </AuthProvider>
  </React.StrictMode>,
);