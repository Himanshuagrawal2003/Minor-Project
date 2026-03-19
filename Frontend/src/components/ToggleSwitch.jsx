import React from 'react';
import { cn } from '../lib/utils';

export function ToggleSwitch({ checked, onChange, label, disabled }) {
  return (
    <label className={cn("flex items-center gap-3", disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer")}>
      <div className="relative">
        <input 
          type="checkbox" 
          className="sr-only" 
          checked={checked} 
          onChange={onChange}
          disabled={disabled}
        />
        <div className={cn(
          "block w-10 h-6 rounded-full transition-colors duration-300 ease-in-out",
          checked ? "bg-primary" : "bg-muted-foreground/30"
        )}></div>
        <div className={cn(
          "dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ease-in-out shadow-sm",
          checked ? "transform translate-x-4" : ""
        )}></div>
      </div>
      {label && <span className="text-sm font-medium text-foreground">{label}</span>}
    </label>
  );
}
