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
  ClipboardList,
  BedDouble,
  BellRing,
  UtensilsCrossed
} from 'lucide-react';
import { cn } from '../lib/utils';

export function Sidebar({ isCollapsed, role, onMobileClose }) {
  const isMobile = onMobileClose !== undefined;

  const getNavLinks = () => {
    const commonLinks = [
      { name: 'Dashboard', path: `/${role}/dashboard`, icon: LayoutDashboard }
    ];

    switch (role) {
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
          { name: 'Mess Menu', path: '/warden/mess-menu', icon: Coffee },
          { name: 'Room Allotment', path: '/warden/room-allotment', icon: BedDouble },
          { name: 'Notice Board', path: '/warden/notices', icon: BellRing },
          { name: 'Emergencies', path: '/warden/emergencies', icon: AlertTriangle, danger: true },
        ];
      case 'staff':
        return [
          ...commonLinks,
        ];
      case 'chief-warden':
        return [
          ...commonLinks,
          { name: 'Escalations', path: '/chief-warden/escalations', icon: AlertTriangle },
          { name: 'Warden Overview', path: '/chief-warden/wardens', icon: Users },
          { name: 'Room Allotment', path: '/chief-warden/room-allotment', icon: BedDouble },
          { name: 'Notice Board', path: '/chief-warden/notices', icon: BellRing },
          { name: 'Emergencies', path: '/chief-warden/emergencies', icon: AlertTriangle, danger: true },
        ];
      case 'admin':
        return [
          ...commonLinks,
          { name: 'User Management', path: '/admin/users', icon: Users },
          { name: 'Mess Menu', path: '/admin/mess-menu', icon: Coffee },
          { name: 'Complaints', path: '/admin/complaints', icon: MessageSquare },
          { name: 'Leave Approvals', path: '/admin/leave', icon: CalendarDays },
          { name: 'Room Allotment', path: '/admin/room-allotment', icon: BedDouble },
          { name: 'Notice Board', path: '/admin/notices', icon: BellRing },
          { name: 'Emergencies', path: '/admin/emergencies', icon: AlertTriangle, danger: true },
        ];
      default:
        return commonLinks;
    }
  };

  const navLinks = getNavLinks();

  return (
    <>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col font-sans glass-sidebar border-r border-border/50 transition-all duration-300 ease-in-out",
          isMobile
            ? "w-64 translate-x-0 md:hidden"
            : cn(
              "hidden md:flex md:translate-x-0",
              isCollapsed ? "w-20" : "w-64"
            )
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-center border-b border-border/50 px-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="bg-primary text-primary-foreground p-2 rounded-xl shadow-lg shadow-primary/20 shrink-0">
              <Building2 size={24} />
            </div>

            {(!isCollapsed || isMobile) && (
              <span className="text-xl font-bold tracking-tight text-foreground truncate">
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
              className={({ isActive }) =>
                cn(
                  "relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                  isActive
                    ? "bg-primary/10 text-primary font-medium shadow-sm"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                  link.danger && !isActive && "text-destructive hover:bg-destructive/10 hover:text-destructive",
                  link.danger && isActive && "bg-destructive/10 text-destructive font-medium",
                  (isCollapsed && !isMobile) && "justify-center px-0"
                )
              }
            >
              <link.icon
                size={22}
                className="transition-transform duration-200 group-hover:scale-110 shrink-0"
              />

              {(!isCollapsed || isMobile) && (
                <span className="truncate">{link.name}</span>
              )}

              {(isCollapsed && !isMobile) && (
                <div className="absolute left-full top-1/2 ml-3 -translate-y-1/2 hidden whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1.5 text-xs font-medium text-popover-foreground shadow-md group-hover:block z-50">
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
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 group",
              (isCollapsed && !isMobile) && "justify-center px-0"
            )}
          >
            <LogOut
              size={22}
              className="group-hover:scale-110 transition-transform duration-200 shrink-0"
            />
            {(!isCollapsed || isMobile) && <span>Logout</span>}
          </NavLink>
        </div>
      </aside>

      {isMobile && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={onMobileClose}
        />
      )}
    </>
  );
}