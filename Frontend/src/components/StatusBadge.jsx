import React from 'react';
import { cn } from '../lib/utils';

export function StatusBadge({ status, className }) {
  const getVariants = (statusStr) => {
    const s = statusStr?.toLowerCase();
    switch (s) {
      case 'pending':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'approved':
      case 'resolved':
      case 'active':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'rejected':
      case 'escalated':
      case 'urgent':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <span className={cn(
      "px-2.5 py-0.5 rounded-full text-xs font-medium border", 
      getVariants(status), 
      className
    )}>
      {status}
    </span>
  );
}
