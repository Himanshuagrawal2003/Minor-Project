import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FormInput } from '../components/FormInput';
import { ArrowRight, UserCheck } from 'lucide-react';

export function WardenLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('warden@hostel.com');
  const [password, setPassword] = useState('warden123');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      localStorage.setItem('role', 'warden');
      navigate('/warden/dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/20 rounded-full blur-[120px] opacity-50 pointer-events-none"></div>
      
      <div className="w-full max-w-md z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20 border border-emerald-500/20">
            <UserCheck size={32} className="text-emerald-500" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Warden Portal</h1>
          <p className="text-muted-foreground mt-2 text-center">Manage hostel operations and students</p>
        </div>

        <div className="glass-card p-8 border-t-4 border-t-emerald-500">
          <form onSubmit={handleLogin} className="space-y-5">
            <FormInput 
              label="Warden Email" 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="warden@hostel.com"
              required
            />
            <FormInput 
              label="Password" 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-input text-primary focus:ring-primary" />
                <span className="text-muted-foreground">Remember me</span>
              </label>
              <a href="#" className="font-medium text-primary hover:underline">Forgot password?</a>
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-11 flex items-center justify-center gap-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20 active:scale-[0.98] disabled:opacity-70"
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>Sign In <ArrowRight size={18} /></>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
