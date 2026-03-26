import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Building2, ArrowLeft, CheckCircle2, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { FormInput } from '../components/FormInput';
import { api } from '../services/api';
import { cn } from '../lib/utils';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [customId, setCustomId] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const passedRole = location.state?.role || 'student';
  const roleLabels = {
    'student': 'Student',
    'warden': 'Warden',
    'chief-warden': 'Chief Warden',
    'staff': 'Staff',
    'admin': 'Admin'
  };
  const roleLabel = roleLabels[passedRole] || 'Role';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await api.post('/users/forgot-password', { email, customId });
      setSuccessMessage(res.message);
      setIsSubmitted(true);
    } catch (err) {
      setError(err?.message || "Failed to reset password. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6 relative overflow-hidden selection:bg-primary/30">
      {/* Background decorations */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-500/20 blur-[100px]" />
      </div>

      <div className="w-full max-w-[460px] animate-in fade-in slide-in-from-bottom-8 duration-700 relative z-10">

        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium text-sm">Back to Login</span>
          </Link>
          <div className="flex items-center gap-2 text-foreground font-semibold font-mono tracking-tighter">
            <div className="bg-primary/10 text-primary p-1.5 rounded-lg border border-primary/20">
              <Building2 size={18} />
            </div>
            LUMINA HOSTEL
          </div>
        </div>

        {!isSubmitted ? (
          <div className="glass-card p-6 sm:p-8 border-t-4 border-primary shadow-2xl backdrop-blur-xl bg-background/60">
            <div className="mb-6 pb-6 border-b border-border/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-primary/10 text-primary rounded-xl">
                  <ShieldCheck size={24} />
                </div>
                <h2 className="text-3xl font-black tracking-tighter">Reset Access</h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                Enter your registered credentials to securely reset your account password to a default value.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold flex items-start gap-3 animate-in slide-in-from-top-2">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <FormInput
                label="Registered Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
              />

              <FormInput
                label={`${roleLabel} ID`}
                type="text"
                value={customId}
                onChange={(e) => setCustomId(e.target.value)}
                placeholder={`e.g. ${passedRole === 'student' ? 'S101' : passedRole === 'warden' ? 'W101' : passedRole === 'staff' ? 'ST101' : passedRole === 'chief-warden' ? 'CW101' : 'U101'}`}
                required
              />

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 mt-4 bg-primary text-primary-foreground font-black rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70 uppercase tracking-widest text-xs"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Reset My Password"}
              </button>
            </form>
          </div>
        ) : (
          <div className="glass-card p-6 sm:p-10 text-center space-y-6 animate-in zoom-in-95 duration-500 shadow-2xl border-t-4 border-emerald-500 backdrop-blur-xl bg-background/60">
            <div className="mx-auto w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-3xl flex items-center justify-center ring-8 ring-emerald-500/5 mb-6 rotate-12">
              <CheckCircle2 size={40} />
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-black tracking-tighter">Success!</h2>
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                <p className="text-sm text-emerald-600 font-bold leading-relaxed">
                  {successMessage}
                </p>
              </div>
              <p className="text-muted-foreground leading-relaxed text-xs font-bold uppercase tracking-widest px-4">
                Please login with the default password and update it immediately in your profile settings.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full h-14 mt-4 inline-flex items-center justify-center gap-2 font-black rounded-2xl text-foreground transition-all border-2 border-border/60 bg-muted/30 hover:bg-muted font-bold active:scale-95 shadow-sm uppercase tracking-widest text-xs"
            >
              Return to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
