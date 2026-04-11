import { cn } from '../lib/utils';

export function DashboardCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendLabel, 
  children,
  className
}) {
  return (
    <div className={cn("glass-card p-4 sm:p-6 flex flex-col gap-3 sm:gap-4 hover-lift", className)}>
      {(title || Icon) && (
        <div className="flex justify-between items-center">
          {title && <h3 className="font-medium text-muted-foreground">{title}</h3>}
          {Icon && (
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Icon size={20} />
            </div>
          )}
        </div>
      )}
      
      {value && (
        <div className="flex items-baseline gap-1.5 sm:gap-2">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground">{value}</h2>
          {trend && (
            <span className={cn(
              "text-sm font-medium",
              trend > 0 ? "text-emerald-500" : "text-rose-500"
            )}>
              {trend > 0 ? "+" : ""}{trend}%
            </span>
          )}
          {trendLabel && <span className="text-sm text-muted-foreground">{trendLabel}</span>}
        </div>
      )}

      {children && <div className="mt-2">{children}</div>}
    </div>
  );
}
