import { ArrowLeft, Home, FileQuestion } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

export function NotFound() {
  const navigate = useNavigate();
  const role = localStorage.getItem('role') || 'admin';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background selection:bg-primary/30 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-destructive/10 blur-[100px]" />
      </div>

      <div className="relative z-10 glass-card max-w-lg w-full p-8 md:p-12 text-center flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        <div className="bg-destructive/10 text-destructive p-4 rounded-3xl mb-8 shadow-lg shadow-destructive/20 relative">
          <FileQuestion size={48} strokeWidth={1.5} />
          <div className="absolute -top-2 -right-2 bg-background rounded-full text-foreground/50 border border-border/50 w-8 h-8 flex items-center justify-center font-bold text-xs">
            404
          </div>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-foreground">
          Page Not Found
        </h1>
        
        <p className="text-lg text-muted-foreground mb-10 max-w-md leading-relaxed">
          Oops! The page you are looking for doesn't exist or has been moved. Let's get you back on track.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <button 
            onClick={() => navigate(-1)}
            className="flex-1 px-6 py-3 bg-muted/50 border border-border hover:bg-muted text-foreground font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 active:scale-95 group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Go Back
          </button>
          
          <button 
            onClick={() => navigate(role ? `/${role}/dashboard` : '/')}
            className={cn(
              "flex-1 px-6 py-3 font-semibold rounded-xl text-white transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 group",
              role === 'student' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20' : '',
              role === 'warden' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20' : '',
              role === 'staff' ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20' : '',
              role === 'chief-warden' ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/20' : '',
              role === 'admin' ? 'bg-primary hover:bg-primary/90 shadow-primary/20 text-primary-foreground' : ''
            )}
          >
            <Home size={18} className="group-hover:scale-110 transition-transform" />
            Dashboard
          </button>
        </div>
      </div>
      
      {/* Footer minimal logo */}
      <div className="absolute bottom-8 text-muted-foreground/50 font-semibold tracking-wider text-sm">
        LuminaHostel
      </div>
    </div>
  );
}
