import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FormInput } from '../components/FormInput';
import { ShieldCheck, User, UserCheck, Star, Wrench, Building2, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';

export function Login() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const roles = [
    { id: 'student', label: 'Student', icon: User, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500', ring: 'ring-blue-500/50' },
    { id: 'warden', label: 'Warden', icon: UserCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500', ring: 'ring-emerald-500/50' },
    { id: 'staff', label: 'Staff', icon: Wrench, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500', ring: 'ring-amber-500/50' },
    { id: 'chief-warden', label: 'Chief Warden', icon: Star, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500', ring: 'ring-purple-500/50' },
    { id: 'admin', label: 'Admin', icon: ShieldCheck, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary', ring: 'ring-primary/50' },
  ];

  // Pre-fill dummy credentials based on selected role
  React.useEffect(() => {
    setEmail(`${selectedRole}@hostel.com`);
    setPassword(`${selectedRole}123`);
  }, [selectedRole]);

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      localStorage.setItem('role', selectedRole);
      navigate(`/${selectedRole}/dashboard`);
    }, 1000);
  };

  const activeRoleConfig = roles.find(r => r.id === selectedRole);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background overflow-hidden selection:bg-primary/30">
      {/* Left side - Branding & Info (Hidden on mobile) */}
      <div className="hidden md:flex md:w-1/2 lg:w-5/12 bg-muted/30 border-r border-border/50 relative flex-col justify-between p-12">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {/* Abstract background shapes */}
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-primary/20 blur-[120px]" />
          <div className="absolute bottom-[10%] -right-[20%] w-[60%] h-[60%] rounded-full bg-blue-500/20 blur-[100px]" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="bg-primary text-primary-foreground p-3 rounded-2xl shadow-lg shadow-primary/20">
              <Building2 size={32} />
            </div>
            <span className="text-3xl font-bold tracking-tight text-foreground">
              LuminaHostel
            </span>
          </div>

          <div className="space-y-6">
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
              Manage your hostel <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">intelligently.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
              A unified digital platform for students, wardens, and administration to streamline complaints, leaves, and daily hostel operations.
            </p>
          </div>
        </div>

        <div className="relative z-10 glass-card p-6 rounded-2xl mt-12 backdrop-blur-md bg-background/40">
          <div className="flex gap-4 items-start">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl shrink-0 mt-1">
               <UserCheck size={24} />
            </div>
            <div>
              <p className="text-sm font-medium leading-relaxed italic text-foreground/80">
                "This platform has completely transformed how we handle daily student requests and maintenance issues. Everything is tracked seamlessly."
              </p>
              <p className="text-sm font-semibold mt-3 text-foreground">— Himanshu Agrawal, Admin</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full md:w-1/2 lg:w-7/12 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-[440px] animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 md:hidden justify-center">
            <div className="bg-primary text-primary-foreground p-2 rounded-xl shadow-lg shadow-primary/20">
              <Building2 size={24} />
            </div>
            <span className="text-2xl font-bold tracking-tight text-foreground">
              LuminaHostel
            </span>
          </div>

          <div className="mb-8 text-center md:text-left">
            <h2 className="text-3xl font-bold tracking-tight mb-2">Welcome back</h2>
            <p className="text-muted-foreground">Please select your role to continue</p>
          </div>

          {/* Role Selector Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-8">
            {roles.map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelectedRole(role.id)}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-200",
                  "hover:bg-muted/50",
                  selectedRole === role.id 
                    ? `border-transparent ring-2 ${role.ring} ${role.bg} shadow-sm scale-[1.02]` 
                    : "border-border/60 bg-transparent text-muted-foreground"
                )}
              >
                <role.icon 
                  size={24} 
                  strokeWidth={selectedRole === role.id ? 2.5 : 2}
                  className={cn("transition-colors duration-200", selectedRole === role.id ? role.color : "")} 
                />
                <span className={cn(
                  "text-[11px] font-semibold tracking-wide uppercase transition-colors duration-200",
                  selectedRole === role.id ? "text-foreground" : ""
                )}>
                  {role.label}
                </span>
              </button>
            ))}
          </div>

          {/* Login Form */}
          <div className={cn(
            "glass-card p-6 sm:p-8 border-t-4 transition-colors duration-300",
            activeRoleConfig?.border
          )}>
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border/50">
               <div className={cn("p-2.5 rounded-xl border", activeRoleConfig?.bg, activeRoleConfig?.color, activeRoleConfig?.border, "border-opacity-20")}>
                  {activeRoleConfig && <activeRoleConfig.icon size={20} />}
               </div>
               <div>
                 <h3 className="font-semibold text-lg">{activeRoleConfig?.label} Sign In</h3>
                 <p className="text-sm text-muted-foreground leading-none mt-1">
                   {selectedRole === 'student' && 'Access complaints & menu'}
                   {selectedRole === 'warden' && 'Manage student requests'}
                   {selectedRole === 'staff' && 'View assigned tasks'}
                   {selectedRole === 'chief-warden' && 'Monitor hostel operations'}
                   {selectedRole === 'admin' && 'System administration'}
                 </p>
               </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <FormInput 
                label={`${activeRoleConfig?.label} ID or Email`} 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={`example@hostel.com`}
                required
              />
              <FormInput 
                label="Password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm mt-2">
                <label className="flex items-center gap-2 cursor-pointer w-fit">
                  <input type="checkbox" className={cn("rounded border-input focus:ring-opacity-50", `text-${activeRoleConfig?.color.split('-')[1]}-500`, `focus:ring-${activeRoleConfig?.color.split('-')[1]}-500`)} />
                  <span className="text-muted-foreground select-none">Remember me</span>
                </label>
                <Link to="/forgot-password" className={cn("font-medium hover:underline", activeRoleConfig?.color)}>Forgot password?</Link>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className={cn(
                  "w-full h-12 mt-6 flex items-center justify-center gap-2 font-semibold rounded-xl text-white transition-all shadow-md active:scale-[0.98] disabled:opacity-70",
                  selectedRole === 'student' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20' : '',
                  selectedRole === 'warden' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20' : '',
                  selectedRole === 'staff' ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20' : '',
                  selectedRole === 'chief-warden' ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/20' : '',
                  selectedRole === 'admin' ? 'bg-primary hover:bg-primary/90 shadow-primary/20 text-primary-foreground' : ''
                )}
              >
                {isLoading ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>Sign In to Portal <ArrowRight size={18} /></>
                )}
              </button>
            </form>
          </div>
          
        </div>
      </div>
    </div>
  );
}
