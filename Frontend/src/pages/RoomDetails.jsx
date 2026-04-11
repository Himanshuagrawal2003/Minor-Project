import React, { useState, useEffect } from "react";
import { Building2, Users, BedDouble, Wrench, Loader2, AlertCircle } from "lucide-react";
import { DashboardCard } from "../components/DashboardCard";
import { api } from "../services/api";

export function RoomDetails() {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRoomInfo = async () => {
      try {
        const res = await api.get('/dashboard');
        setDashboardData(res);
      } catch (err) {
        console.error("Failed to load room details:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoomInfo();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  const userRoom = dashboardData?.studentStats?.roomNumber || localStorage.getItem('roomNumber') || "Pending";
  const userBlock = dashboardData?.studentStats?.block || localStorage.getItem('block') || "N/A";
  const userMess = dashboardData?.studentStats?.messId || localStorage.getItem('messId') || "N/A";

  if (userRoom === "Pending") {
    return (
      <div className="px-4 py-8 mx-auto max-w-5xl w-full">
        <div className="glass-card p-8 flex flex-col items-center justify-center text-center space-y-4 border-t-4 border-amber-500">
          <div className="h-20 w-20 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mb-2">
            <AlertCircle size={40} />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Room Not Allotted Yet</h2>
          <p className="text-muted-foreground max-w-md">
            Your hostel room has not been assigned by the warden yet. Please check back later or contact the administration if you believe this is an error.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 sm:px-5 sm:py-6 md:px-6 md:py-6 mx-auto max-w-7xl w-full relative min-h-[calc(100vh-4rem)] space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Room Information
          </h1>
          <p className="text-muted-foreground mt-1">
            Details about your current accommodation.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Room Number"
          value={userRoom}
          icon={BedDouble}
        />
        <DashboardCard
          title="Building"
          value={dashboardData?.studentStats?.buildingType ? `${dashboardData.studentStats.buildingType} Hostel` : "Hostel"}
          icon={Building2}
        />
        <DashboardCard
          title="Block Name"
          value={userBlock !== "N/A" ? `Block ${userBlock}` : "N/A"}
        />
        <DashboardCard
          title={dashboardData?.studentStats?.roomId ? "Room ID" : "Mess Allotted"}
          value={dashboardData?.studentStats?.roomId || userMess}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border/50 bg-muted/20">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Users size={20} className="text-primary" /> Roommates
            </h2>
          </div>
          <div className="divide-y divide-border/50">
            {dashboardData?.studentStats?.roommates?.length > 0 ? (
              dashboardData.studentStats.roommates.map((roommate) => (
                <div key={roommate._id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {roommate.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{roommate.name}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">{roommate.customId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-muted-foreground">{roommate.contact || "No Contact"}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 flex flex-col items-center justify-center text-center space-y-2">
                <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
                  <Users size={24} />
                </div>
                <p className="text-sm text-muted-foreground italic">
                  No roommates yet.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border/50 bg-muted/20">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Building2 size={20} className="text-primary" /> Room Inventory
            </h2>
          </div>
          <div className="p-6">
            <ul className="space-y-4 text-sm">
              <li className="flex justify-between items-center border-b border-border/50 pb-2">
                <span className="font-medium">Beds</span>
                <span className="text-muted-foreground text-xs uppercase tracking-widest font-bold">Standard</span>
              </li>
              <li className="flex justify-between items-center border-b border-border/50 pb-2">
                <span className="font-medium">Study Tables</span>
                <span className="text-muted-foreground text-xs uppercase tracking-widest font-bold">Standard</span>
              </li>
              <li className="flex justify-between items-center border-b border-border/50 pb-2">
                <span className="font-medium">Almirahs / Cupboards</span>
                <span className="text-muted-foreground text-xs uppercase tracking-widest font-bold">Standard</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="font-medium">Fixtures (Fan/Lights)</span>
                <span className="text-muted-foreground text-xs uppercase tracking-widest font-bold">Standard</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
