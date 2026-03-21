import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { FormInput } from '../components/FormInput';
import { cn } from '../lib/utils';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setIsLoading(true);
      // MOCK API Call
      setTimeout(() => {
        setIsLoading(false);
        setIsSubmitted(true);
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6 relative overflow-hidden selection:bg-primary/30">
      {/* Background decorations */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-500/20 blur-[100px]" />
        <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] dark:bg-background/80 mix-blend-overlay" />
      </div>

      <div className="w-full max-w-[460px] animate-in fade-in slide-in-from-bottom-8 duration-700 relative z-10">
        
        {/* Logo and Back Link */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium text-sm">Back to Login</span>
          </Link>
          <div className="flex items-center gap-2 text-foreground font-semibold">
            <div className="bg-primary/10 text-primary p-1.5 rounded-lg">
               <Building2 size={18} />
            </div>
            LuminaHostel
          </div>
        </div>

        {!isSubmitted ? (
          <div className="glass-card p-6 sm:p-8 border-t-4 border-primary/50 transition-colors duration-300 shadow-xl backdrop-blur-xl bg-background/60">
             <div className="mb-6 pb-6 border-b border-border/50">
               <h2 className="text-3xl font-bold tracking-tight mb-3">Reset Password</h2>
               <p className="text-sm text-muted-foreground leading-relaxed">
                 Enter your registered email address below. We'll send you a securely encrypted link to regain access to your dashboard.
               </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <FormInput
                label="Registered Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@hostel.com"
                required
              />

              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  "w-full h-12 mt-6 flex items-center justify-center gap-2 font-semibold rounded-xl text-white transition-all shadow-md active:scale-[0.98] disabled:opacity-70",
                  "bg-primary hover:bg-primary/90 shadow-primary/20 text-primary-foreground"
                )}
              >
                {isLoading ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="glass-card p-6 sm:p-8 text-center space-y-6 animate-in zoom-in-95 duration-500 shadow-xl border-t-4 border-emerald-500/50 backdrop-blur-xl bg-background/60">
            <div className="mx-auto w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center ring-8 ring-emerald-500/5 mb-6">
              <CheckCircle2 size={32} />
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-bold tracking-tight">Check your email</h2>
              <p className="text-muted-foreground leading-relaxed text-sm">
                We've sent a password reset link to <br/>
                <span className="font-medium text-foreground text-base mt-1 block">{email}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full h-12 mt-4 inline-flex items-center justify-center gap-2 font-semibold rounded-xl text-foreground transition-colors border border-border/60 bg-background/50 hover:bg-muted/80 backdrop-blur-sm shadow-sm"
            >
              Return to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
