import { useState } from "react";
import { useDevices, useRelogin } from "@/service/tclService";
import AcCard from "@/components/AcCard";
import GlobalControls from "@/components/GlobalControls";
import AcDetailModal from "@/components/AcDetailModal";
import type { DeviceItem } from "@/types/tcl";
import { RefreshCcw, LogOut, Settings } from "lucide-react";
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
        <div className="min-h-screen overflow-x-hidden pb-48 selection:bg-primary/30">
            {/* TopNavBar */}
            <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-8 py-4 bg-background/80 backdrop-blur-xl border-b border-primary/10">
                <div className="flex items-center gap-8">
                    <h1 className="text-2xl font-bold tracking-tight text-primary font-heading uppercase">
                        TCL Server
                    </h1>
                </div>
                
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => {
                                if (isAllSelected) clearSelection();
                                else selectAll(deviceIds);
                            }}
                            className={cn(
                                "hidden md:flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-xs font-bold uppercase tracking-wider",
                                isAllSelected ? "bg-primary text-on-primary shadow-lg shadow-primary/20" : "bg-surface-container-highest/50 hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface"
                            )}
                        >
                            {isAllSelected ? "Deselect" : "Select All"}
                        </button>
                        
                        <button 
                            onClick={() => relogin()}
                            disabled={isRelogging}
                            className="p-2 text-on-surface-variant hover:text-primary transition-colors disabled:opacity-50"
                            title="TCL Cloud Relogin"
                        >
                            <RefreshCcw size={18} className={isRelogging ? "animate-spin" : ""} />
                        </button>

                        <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
                            <Settings size={20} />
                        </button>

                        <button 
                            onClick={logout}
                            className="p-2 text-on-surface-variant hover:text-secondary transition-colors"
                            title="Logout"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Canvas */}
            <main className="pt-32 px-10">
                <div className="max-w-7xl mx-auto">
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-items-center">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="w-full h-80 glass-card animate-pulse rounded-[2rem]" />
                            ))}
                        </div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-items-center"
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
                </div>
            </main>

            {/* Global Actions (Master Bottom Bar) */}
            <GlobalControls />

            {/* Device Detail Modal */}
            {selectedDevice && (
                <AcDetailModal 
                    device={selectedDevice} 
                    isOpen={!!selectedDevice} 
                    onClose={() => setSelectedDevice(null)} 
                />
            )}
        </div>
    );
};

export default Dashboard;


