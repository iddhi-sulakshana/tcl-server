import { useState } from "react";
import { useDevices, useRelogin } from "@/service/tclService";
import AcCard from "@/components/AcCard";
import GlobalControls from "@/components/GlobalControls";
import AcDetailModal from "@/components/AcDetailModal";
import type { DeviceItem } from "@/types/tcl";
import { RefreshCcw, LogOut, LayoutGrid, User, Bell, Plus, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "@/lib/AuthStore";
import { motion } from "framer-motion";
import { useSelectionStore } from "@/lib/SelectionStore";
import { cn } from "@/lib/utils";

const Dashboard = () => {
    const { data: devices, isLoading } = useDevices();
    const { mutate: relogin, isPending: isRelogging } = useRelogin();
    const logout = useAuthStore((state) => state.logout);

    const [selectedDevice, setSelectedDevice] = useState<DeviceItem | null>(null);
    const { selectedDeviceIds, selectAll, clearSelection } = useSelectionStore();

    const deviceIds = devices?.map((d) => d.deviceId) ?? [];
    const isAllSelected = devices && devices.length > 0 && selectedDeviceIds.length === devices.length;

    return (
        <div className="relative min-h-screen pb-32">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-40 bg-white/10 backdrop-blur-md border-b border-white/10 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/10">
                            <User size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">Dasanayaka 's home</h1>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold opacity-60">Smart Home AC Control</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => {
                                if (isAllSelected) clearSelection();
                                else selectAll(deviceIds);
                            }}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm font-bold",
                                isAllSelected ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-white/20 hover:bg-white/30"
                            )}
                        >
                            <CheckCircle2 size={18} />
                            <span className="hidden md:inline">{isAllSelected ? "Deselect All" : "Select All"}</span>
                        </button>
                        <button 
                            onClick={() => relogin()}
                            disabled={isRelogging}
                            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all text-sm font-bold"
                            title="TCL Cloud Relogin"
                        >
                            <RefreshCcw size={18} className={isRelogging ? "animate-spin" : ""} />
                            <span className="hidden md:inline">Relogin</span>
                        </button>
                        <button 
                            onClick={logout}
                            className="p-2.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                            title="Logout"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Dashboard Content */}
            <main className="max-w-7xl mx-auto pt-24 px-6">
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4 border-b border-primary/20 pb-2">
                        <button className="text-lg font-bold text-primary relative">
                            All Devices
                            <span className="absolute -bottom-2.5 left-0 right-0 h-1 bg-primary rounded-full" />
                        </button>
                        <button className="text-lg font-bold text-muted-foreground hover:text-foreground transition-colors px-4">
                            Zones
                        </button>
                    </div>
                    <div className="flex gap-2">
                        <button className="p-3 glass rounded-2xl text-muted-foreground hover:text-primary transition-all">
                            <Plus size={20} />
                        </button>
                        <button className="p-3 glass rounded-2xl text-muted-foreground hover:text-primary transition-all">
                            <LayoutGrid size={20} />
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-44 glass animate-pulse rounded-3xl" />
                        ))}
                    </div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
                    >
                        {devices?.map((device) => (
                            <AcCard 
                                key={device.deviceId} 
                                device={device} 
                                onClick={() => setSelectedDevice(device)}
                            />
                        ))}
                    </motion.div>
                )}
            </main>

            {/* Global Actions */}
            <GlobalControls availableDeviceIds={deviceIds} />

            {/* Device Detail Modal */}
            {selectedDevice && (
                <AcDetailModal 
                    device={selectedDevice} 
                    isOpen={!!selectedDevice} 
                    onClose={() => setSelectedDevice(null)} 
                />
            )}

            {/* Footer Navigation (Mobile Style) */}
            <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-t border-white/10 flex items-center justify-around md:hidden">
                <button className="flex flex-col items-center gap-1 text-primary">
                    <LayoutGrid size={24} />
                    <span className="text-[10px] font-bold">Home</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-muted-foreground">
                    <Bell size={24} />
                    <span className="text-[10px] font-bold">Alerts</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-muted-foreground">
                    <User size={24} />
                    <span className="text-[10px] font-bold">Profile</span>
                </button>
            </nav>
        </div>
    );
};

export default Dashboard;

