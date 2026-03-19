import React from 'react';
import { Building2, Users, BedDouble, Wrench } from 'lucide-react';
import { DashboardCard } from '../components/DashboardCard';

export function RoomDetails() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Room Information</h1>
          <p className="text-muted-foreground mt-1">Details about your current accommodation.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard title="Room Number" value="B-204" icon={BedDouble} className="ring-1 ring-primary/20 bg-primary/5" />
        <DashboardCard title="Building" value="Boys Hostel" icon={Building2} />
        <DashboardCard title="Block Name" value="Block B" />
        <DashboardCard title="Capacity" value="2 Seater" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border/50 bg-muted/20">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Users size={20} className="text-primary" /> Roommates
            </h2>
          </div>
          <div className="divide-y divide-border/50">
            <div className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                JS
              </div>
              <div>
                <h3 className="font-semibold text-lg">John Smith (You)</h3>
                <p className="text-sm text-muted-foreground">Computer Science, 2nd Year</p>
                <p className="text-sm text-muted-foreground mt-1">+91 98765 43210</p>
              </div>
            </div>
            <div className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold text-lg">
                AM
              </div>
              <div>
                <h3 className="font-semibold text-lg">Amit Malhotra</h3>
                <p className="text-sm text-muted-foreground">Information Tech, 2nd Year</p>
                <p className="text-sm text-muted-foreground mt-1">+91 98765 12345</p>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border/50 bg-muted/20">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Building2 size={20} className="text-primary" /> Room Inventory
            </h2>
          </div>
          <div className="p-6">
            <ul className="space-y-4">
              <li className="flex justify-between items-center border-b border-border/50 pb-2">
                <span className="font-medium">Beds</span>
                <span className="text-muted-foreground">2</span>
              </li>
              <li className="flex justify-between items-center border-b border-border/50 pb-2">
                <span className="font-medium">Study Tables</span>
                <span className="text-muted-foreground">2</span>
              </li>
              <li className="flex justify-between items-center border-b border-border/50 pb-2">
                <span className="font-medium">Chairs</span>
                <span className="text-muted-foreground">2</span>
              </li>
              <li className="flex justify-between items-center border-b border-border/50 pb-2">
                <span className="font-medium">Almirahs / Cupboards</span>
                <span className="text-muted-foreground">2</span>
              </li>
              <li className="flex justify-between items-center border-b border-border/50 pb-2">
                <span className="font-medium">Ceiling Fan</span>
                <span className="text-muted-foreground">1</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="font-medium">Tube Lights</span>
                <span className="text-muted-foreground">2</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
