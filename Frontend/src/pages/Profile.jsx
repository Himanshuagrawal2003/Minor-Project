import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Building2, ShieldCheck, Key, Check, AlertCircle, Loader2 } from 'lucide-react';
import { FormInput } from '../components/FormInput';
import { cn } from '../lib/utils';
import { api } from '../services/api';

export function Profile() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isCompletionMode = searchParams.get('complete') === 'true';
  const role = localStorage.getItem('role') || 'student';
  
  const [isEditing, setIsEditing] = useState(isCompletionMode);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    id: '',
    address: '',
    room: '',
    course: '',
    block: '',
    bio: ''
  });

  const [rooms, setRooms] = useState([]);
  const [formData, setFormData] = useState(profileData);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const data = await api.get('/users/profile');
      const formattedData = {
        ...data,
        name: data.name || '',
        email: data.email || '',
        phone: data.contact || '',
        department: data.department || '',
        id: data.customId || '',
        address: data.address || '',
        room: data.roomNumber || '',
        course: data.course || '',
        block: data.block || '',
        bio: data.bio || ''
      };
      setProfileData(formattedData);
      setFormData(formattedData);

      const roomRes = await api.get('/rooms');
      setRooms(roomRes.rooms || []);
    } catch (err) {
      console.error("Failed to fetch profile", err);
      setMessage({ type: 'error', text: 'Failed to load profile data.' });
    } finally {
      setIsLoading(false);
    }
  };

  const uniqueBlocks = [...new Set(rooms.map(r => r.block))].sort();
  const availableRoomsInBlock = rooms.filter(r => r.block === formData.block);

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const updateData = {
        contact: formData.phone,
        course: formData.course,
        block: formData.block,
        department: formData.department,
        roomNumber: formData.room,
        address: formData.address,
        bio: formData.bio
      };
      const res = await api.patch('/users/update-profile', updateData);
      
      // Update local storage for immediate UI reflect in other components
      localStorage.setItem('isProfileComplete', 'true');
      localStorage.setItem('roomNumber', res.roomNumber || '');
      localStorage.setItem('block', res.block || '');
      localStorage.setItem('messId', res.messId || '');
      
      const newProfile = {
        ...res,
        phone: res.contact,
        room: res.roomNumber,
        id: res.customId
      };
      setProfileData(newProfile);
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      if (isCompletionMode) {
        setTimeout(() => navigate(`/${role}/dashboard`), 1500);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
        setMessage({ type: 'error', text: 'Passwords do not match.' });
        return;
    }
    setIsSaving(true);
    try {
        await api.post('/users/change-password', {
            currentPassword: passwords.current,
            newPassword: passwords.new
        });
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setIsChangingPassword(false);
        setPasswords({ current: '', new: '', confirm: '' });
    } catch (err) {
        setMessage({ type: 'error', text: err.message || 'Failed to change password.' });
    } finally {
        setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {isCompletionMode && (
        <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="bg-primary/20 p-2 rounded-lg">
            <AlertCircle className="text-primary" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-primary">Complete Your Profile</h2>
            <p className="text-sm text-primary/80">Welcome! Since this is your first login, please provide your hostel and academic details below to access the full system.</p>
          </div>
        </div>
      )}

      {message.text && (
        <div className={cn(
          "p-4 rounded-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2",
          message.type === 'success' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" : "bg-destructive/10 border-destructive/20 text-destructive"
        )}>
          {message.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Your Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your account settings and personal information.</p>
        </div>
        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              {!isCompletionMode && (
                <button 
                  onClick={() => { setIsEditing(false); setFormData(profileData); }}
                  className="px-4 py-2 border border-border flex items-center gap-2 rounded-lg hover:bg-muted transition-all font-medium"
                >
                  Cancel
                </button>
              )}
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-primary text-primary-foreground flex items-center gap-2 rounded-lg hover:bg-primary/90 transition-all shadow-sm font-bold min-w-[120px] justify-center"
              >
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                {isCompletionMode ? "Complete Setup" : "Save Changes"}
              </button>
            </>
          ) : (
             <button 
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-all shadow-sm"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Avatar & Quick Info */}
        <div className="space-y-6">
          <div className="glass-card p-6 flex flex-col items-center text-center">
            <div className="relative mb-4 group">
              <div className="h-24 w-24 rounded-full bg-primary/10 border-4 border-background flex items-center justify-center text-primary shadow-lg overflow-hidden">
                <User size={40} />
              </div>
            </div>
            <h2 className="text-xl font-bold">{profileData.name}</h2>
            <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full mt-2">
              <ShieldCheck size={14} /> {role.toUpperCase()}
            </div>
            
          </div>

          <div className="glass-card p-6 space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Account Status</h3>
            <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/20">
              <div className="flex items-center gap-3">
                <div className={cn("h-2 w-2 rounded-full", profileData.isProfileComplete ? "bg-emerald-500 animate-pulse" : "bg-amber-500 animate-pulse")}></div>
                <span className="font-medium text-sm">{profileData.isProfileComplete ? "Active Account" : "Setup Required"}</span>
              </div>
              <span className="text-xs text-muted-foreground">Since Oct 2026</span>
            </div>
          </div>
        </div>

        {/* Right Column - Forms */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <h3 className="font-semibold text-lg mb-6 flex items-center gap-2 border-b border-border/50 pb-4">
              <User size={18} className="text-primary" /> Personal Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormInput 
                label="Full Name" 
                value={profileData.name}
                disabled={true}
                className="opacity-70 bg-muted/30"
              />
              <FormInput 
                label="ID Number" 
                value={profileData.id}
                disabled={true}
                className="opacity-70 bg-muted/30"
              />
              <FormInput 
                label="Email Address" 
                type="email"
                value={profileData.email}
                disabled={true}
                className="opacity-70 bg-muted/30"
                icon={<Mail size={16} />}
              />
              <FormInput 
                label="Phone Number" 
                value={isEditing ? formData.phone : profileData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                disabled={!isEditing}
                className={!isEditing ? "opacity-70 bg-muted/30" : "bg-background"}
                icon={<Phone size={16} />}
                required={isCompletionMode}
              />
              <FormInput 
                label="Department" 
                value={isEditing ? formData.department : profileData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
                disabled={!isEditing}
                className={!isEditing ? "opacity-70 bg-muted/30" : "bg-background"}
                required={isCompletionMode}
              />
              <FormInput 
                label="Course" 
                value={isEditing ? formData.course : profileData.course}
                onChange={(e) => setFormData({...formData, course: e.target.value})}
                disabled={!isEditing}
                className={!isEditing ? "opacity-70 bg-muted/30" : "bg-background"}
                required={isCompletionMode}
              />
              {isEditing && !(role === 'student' && profileData.block) ? (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Building2 size={16} className="text-muted-foreground" /> Hostel Block
                  </label>
                  <select 
                    value={formData.block}
                    onChange={(e) => setFormData({...formData, block: e.target.value, room: ''})}
                    className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
                    required={isCompletionMode}
                  >
                    <option value="">Select Block</option>
                    {uniqueBlocks.map(b => <option key={b} value={b}>Block {b}</option>)}
                  </select>
                </div>
              ) : (
                <FormInput 
                  label="Hostel Block" 
                  value={isEditing ? formData.block : profileData.block}
                  disabled={true}
                  className="opacity-70 bg-muted/30"
                  icon={<Building2 size={16} />}
                />
              )}

              {isEditing && !(role === 'student' && profileData.room) ? (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Building2 size={16} className="text-muted-foreground" /> Room Number
                  </label>
                  <select 
                    value={formData.room}
                    onChange={(e) => setFormData({...formData, room: e.target.value})}
                    disabled={!formData.block}
                    className={cn(
                      "flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all",
                      !formData.block && "opacity-70 bg-muted/30 cursor-not-allowed"
                    )}
                    required={isCompletionMode}
                  >
                    <option value="">{formData.block ? 'Select Room' : 'Select Block First'}</option>
                    {availableRoomsInBlock.map(r => <option key={r._id} value={r.number}>{r.number} ({r.capacity} Seater)</option>)}
                  </select>
                </div>
              ) : (
                <FormInput 
                  label="Room Number" 
                  value={isEditing ? formData.room : profileData.room}
                  disabled={true}
                  className="opacity-70 bg-muted/30"
                  icon={<Building2 size={16} />}
                />
              )}
              <div className="md:col-span-2">
                <FormInput 
                  label="Permanent Address" 
                  value={isEditing ? formData.address : profileData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  disabled={!isEditing}
                  className={!isEditing ? "opacity-70 bg-muted/30" : "bg-background"}
                  icon={<MapPin size={16} />}
                />
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
             <h3 className="font-semibold text-lg mb-6 flex items-center gap-2 border-b border-border/50 pb-4">
              <Key size={18} className="text-primary" /> Security Basics
            </h3>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-border/50 bg-muted/10">
              <div>
                <h4 className="font-medium">Account Password</h4>
                <p className="text-sm text-muted-foreground mt-1">Manage your account security</p>
              </div>
              {!isChangingPassword && (
                <button 
                  onClick={() => setIsChangingPassword(true)}
                  className="px-4 py-2 bg-background border border-border hover:bg-muted font-medium rounded-lg transition-colors text-sm"
                >
                  Change Password
                </button>
              )}
            </div>

            {isChangingPassword && (
              <form onSubmit={handlePasswordChange} className="mt-4 p-5 rounded-xl border border-border/50 bg-background/50 space-y-4 animate-in fade-in slide-in-from-top-2">
                <FormInput
                  label="Current Password"
                  type="password"
                  value={passwords.current}
                  onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                  required
                />
                <FormInput
                  label="New Password"
                  type="password"
                  value={passwords.new}
                  onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                  required
                />
                <FormInput
                  label="Confirm New Password"
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                  required
                />
                <div className="flex items-center gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => {
                        setIsChangingPassword(false);
                        setPasswords({ current: '', new: '', confirm: '' });
                    }}
                    className="px-4 py-2 border border-border flex items-center gap-2 rounded-lg hover:bg-muted transition-all text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-2 bg-primary text-primary-foreground flex items-center gap-2 rounded-lg hover:bg-primary/90 transition-all shadow-sm text-sm font-medium disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                    Update Password
                  </button>
                </div>
              </form>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}