import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Building2, ShieldCheck, Key, Camera, Check } from 'lucide-react';
import { FormInput } from '../components/FormInput';
import { cn } from '../lib/utils';
import { DashboardCard } from '../components/DashboardCard';

export function Profile() {
  const role = localStorage.getItem('role') || 'student';
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  
  // Dummy data based on role
  const [profileData, setProfileData] = useState({
    name: role.charAt(0).toUpperCase() + role.slice(1) + ' User',
    email: `${role}@lumina.hostel.com`,
    phone: '+91 98765 43210',
    department: role === 'student' ? 'Computer Science' : 'Hostel Administration',
    id: role === 'student' ? 'STU-2023-045' : role.toUpperCase() + '-001',
    address: '123, Hostel Lane, Campus Valley',
    room: role === 'student' ? 'B-204' : 'Office 101',
    bio: 'Dedicated to maintaining a great hostel environment.'
  });

  const [formData, setFormData] = useState(profileData);

  const handleSave = () => {
    setProfileData(formData);
    setIsEditing(false);
    // Add a small toast or notification logic here if needed
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Your Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your account settings and personal information.</p>
        </div>
        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <button 
                onClick={() => { setIsEditing(false); setFormData(profileData); }}
                className="px-4 py-2 border border-border flex items-center gap-2 rounded-lg hover:bg-muted transition-all font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="px-4 py-2 bg-primary text-primary-foreground flex items-center gap-2 rounded-lg hover:bg-primary/90 transition-all shadow-sm font-medium"
              >
                <Check size={18} /> Save Changes
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
              {isEditing && (
                <button className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-md hover:scale-105 transition-transform">
                  <Camera size={14} />
                </button>
              )}
            </div>
            <h2 className="text-xl font-bold">{profileData.name}</h2>
            <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full mt-2">
              <ShieldCheck size={14} /> {role.toUpperCase()}
            </div>
            
            <p className="text-muted-foreground text-sm mt-4 leading-relaxed">
              {profileData.bio}
            </p>
          </div>

          <div className="glass-card p-6 space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Account Status</h3>
            <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="font-medium text-sm">Active Account</span>
              </div>
              <span className="text-xs text-muted-foreground">Since 2026</span>
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
                value={isEditing ? formData.name : profileData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                disabled={!isEditing}
                className={!isEditing ? "opacity-70 bg-muted/30" : ""}
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
                value={isEditing ? formData.email : profileData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                disabled={!isEditing}
                className={!isEditing ? "opacity-70 bg-muted/30" : ""}
                icon={<Mail size={16} />}
              />
              <FormInput 
                label="Phone Number" 
                value={isEditing ? formData.phone : profileData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                disabled={!isEditing}
                className={!isEditing ? "opacity-70 bg-muted/30" : ""}
                icon={<Phone size={16} />}
              />
              <FormInput 
                label="Department" 
                value={isEditing ? formData.department : profileData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
                disabled={!isEditing}
                className={!isEditing ? "opacity-70 bg-muted/30" : ""}
              />
              <FormInput 
                label={role === 'student' ? "Room Number" : "Office Number"} 
                value={isEditing ? formData.room : profileData.room}
                onChange={(e) => setFormData({...formData, room: e.target.value})}
                disabled={!isEditing}
                className={!isEditing ? "opacity-70 bg-muted/30" : ""}
                icon={<Building2 size={16} />}
              />
              <div className="md:col-span-2">
                <FormInput 
                  label="Permanent Address" 
                  value={isEditing ? formData.address : profileData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  disabled={!isEditing}
                  className={!isEditing ? "opacity-70 bg-muted/30" : ""}
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
                <p className="text-sm text-muted-foreground mt-1">Last changed 3 months ago</p>
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
              <div className="mt-4 p-5 rounded-xl border border-border/50 bg-background/50 space-y-4 animate-in fade-in slide-in-from-top-2">
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
                    onClick={() => {
                        setIsChangingPassword(false);
                        setPasswords({ current: '', new: '', confirm: '' });
                    }}
                    className="px-4 py-2 border border-border flex items-center gap-2 rounded-lg hover:bg-muted transition-all text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                        setIsChangingPassword(false);
                        setPasswords({ current: '', new: '', confirm: '' });
                        alert("Password updated successfully!");
                    }}
                    className="px-4 py-2 bg-primary text-primary-foreground flex items-center gap-2 rounded-lg hover:bg-primary/90 transition-all shadow-sm text-sm font-medium"
                  >
                    Update Password
                  </button>
                </div>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
