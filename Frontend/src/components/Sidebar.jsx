import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquare, 
  CalendarDays, 
  Users, 
  Building2, 
  Coffee,
  LogOut,
  AlertTriangle,
  UserCheck,
  ClipboardList,
  BedDouble
} from 'lucide-react';
import { cn } from '../lib/utils';

export function Sidebar({ isCollapsed, role, onMobileClose }) {
  // Define navigation links based on role
  const getNavLinks = () => {
    const commonLinks = [
      { name: 'Dashboard', path: `/${role}/dashboard`, icon: LayoutDashboard }
    ];

    switch(role) {
      case 'student':
        return [
          ...commonLinks,
          { name: 'Complaints', path: '/student/complaints', icon: MessageSquare },
          { name: 'Leave Requests', path: '/student/leave', icon: CalendarDays },
          { name: 'Mess Menu', path: '/student/mess-menu', icon: Coffee },
          { name: 'Room Details', path: '/student/room', icon: Building2 },
          { name: 'Emergency', path: '/student/emergency', icon: AlertTriangle, danger: true },
        ];
      case 'warden':
        return [
          ...commonLinks,
          { name: 'Complaints', path: '/warden/complaints', icon: MessageSquare },
          { name: 'Leave Requests', path: '/warden/leave', icon: CalendarDays },
          { name: 'Mess Menu', path: '/warden/mess-menu', icon: Coffee },
        ];
      case 'staff':
        return [
          ...commonLinks,
          { name: 'My Tasks', path: '/staff/tasks', icon: ClipboardList }
        ];
      case 'chief-warden':
        return [
          ...commonLinks,
          { name: 'Escalations', path: '/chief-warden/escalations', icon: AlertTriangle },
          { name: 'Warden Overview', path: '/chief-warden/wardens', icon: Users },
          { name: 'Room Allotment', path: '/chief-warden/room-allotment', icon: BedDouble },
        ];
      case 'admin':
        return [
          ...commonLinks,
          { name: 'User Management', path: '/admin/users', icon: Users },
          { name: 'Hostel Setup', path: '/admin/hostel', icon: Building2 },
          { name: 'Mess Management', path: '/admin/mess-menu', icon: Coffee },
          { name: 'Room Allotment', path: '/admin/room-allotment', icon: BedDouble },
        ];
      default:
        return commonLinks;
    }
  };

  const navLinks = getNavLinks();

  return (
    <>
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 flex flex-col transition-all duration-300 ease-in-out font-sans glass-sidebar",
        isCollapsed ? "w-20" : "w-64",
        "md:translate-x-0 hidden md:flex",
        onMobileClose !== undefined && "flex translate-x-0 !visible" // Mobile override
      )}
      style={onMobileClose !== undefined ? {transform: 'translateX(0)'} : {}}
      >
        <div className="flex h-16 shrink-0 items-center justify-center border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-primary-foreground p-2 rounded-xl shadow-lg shadow-primary/20">
              <Building2 size={24} />
            </div>
            {(!isCollapsed || onMobileClose) && (
              <span className="text-xl font-bold tracking-tight text-foreground">
                LuminaHostel
              </span>
            )}
          </div>
        </div>

        <nav className="flex-1 space-y-2 px-3 py-6 overflow-y-auto">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={onMobileClose}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-primary/10 text-primary font-medium shadow-sm" 
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                link.danger && !isActive && "text-destructive hover:bg-destructive/10 hover:text-destructive",
                link.danger && isActive && "bg-destructive/10 text-destructive font-medium",
                (isCollapsed && !onMobileClose) && "justify-center px-0"
              )}
            >
              <link.icon size={22} className={cn(
                "transition-transform duration-200", 
                "group-hover:scale-110"
              )} />
              {(!isCollapsed || onMobileClose) && <span>{link.name}</span>}
              
              {/* Tooltip for collapsed state */}
              {(isCollapsed && !onMobileClose) && (
                <div className="absolute left-full ml-4 hidden rounded-md bg-popover px-2 py-1.5 text-xs font-medium text-popover-foreground shadow-md border border-border group-hover:block z-50 whitespace-nowrap">
                  {link.name}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-border/50">
          <NavLink
            to="/"
            onClick={() => {
              localStorage.removeItem('role');
              if (onMobileClose) onMobileClose();
            }}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 group",
              (isCollapsed && !onMobileClose) && "justify-center px-0"
            )}
          >
            <LogOut size={22} className="group-hover:scale-110 transition-transform duration-200" />
            {(!isCollapsed || onMobileClose) && <span>Logout</span>}
          </NavLink>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {onMobileClose && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 md:hidden animate-in fade-in"
          onClick={onMobileClose}
        />
      )}
    </>
  );
}
