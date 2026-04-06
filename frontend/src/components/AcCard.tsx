import React from "react";
import { useDeviceState, useUpdateDeviceState } from "@/service/tclService";
import type { DeviceItem } from "@/types/tcl";
import { Wind, Snowflake, Droplets, Sun, ChevronUp, ChevronDown, Check, Zap, Power } from "lucide-react";
import { useSelectionStore } from "@/lib/SelectionStore";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface AcCardProps {
    device: DeviceItem;
    onClick: () => void;
}

const AcCard = ({ device, onClick }: AcCardProps) => {
    const isOnline = device.isOnline === "1";
    const { data: state, isLoading } = useDeviceState(device.deviceId, isOnline);
    const updateState = useUpdateDeviceState();
    const { selectedDeviceIds, toggleDevice } = useSelectionStore();

    const isSelected = selectedDeviceIds.includes(device.deviceId);
    const isOn = state?.powerSwitch === 1;

    const checkOnline = () => {
        if (!isOnline) {
            toast.error("Device is offline. Configuration unavailable.");
            return false;
        }
        return true;
    };

    const handleTempChange = (e: React.MouseEvent, delta: number) => {
        e.stopPropagation();
        if (!checkOnline() || !state) return;
        updateState.mutate({
            deviceId: device.deviceId,
            properties: { targetTemperature: state.targetTemperature + delta },
        });
    };

    const handleModeChange = (e: React.MouseEvent, mode: number) => {
        e.stopPropagation();
        if (!checkOnline()) return;

        const properties: any = { workMode: mode };
        if (mode === 1) properties.targetTemperature = 16;
        if (mode === 3) properties.targetTemperature = 31;

        updateState.mutate({
            deviceId: device.deviceId,
            properties,
        });
    };

    const handleFanChange = (e: React.MouseEvent, speed: number) => {
        e.stopPropagation();
        if (!checkOnline()) return;
        updateState.mutate({
            deviceId: device.deviceId,
            properties: { windSpeed7Gear: speed },
        });
    };

    const handleGenChange = (e: React.MouseEvent, mode: number) => {
        e.stopPropagation();
        if (!checkOnline()) return;
        updateState.mutate({
            deviceId: device.deviceId,
            properties: { generatorMode: mode },
        });
    };

    const handlePowerToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!checkOnline() || !state) return;
        updateState.mutate({
            deviceId: device.deviceId,
            properties: { powerSwitch: state.powerSwitch === 1 ? 0 : 1 },
        });
    };

    const handleSelect = (e: React.MouseEvent) => {
        e.stopPropagation();
        toggleDevice(device.deviceId);
    };

    if (isLoading && isOnline) {
        return (
            <div className="w-full h-80 glass-card animate-pulse rounded-[2rem]" />
        );
    }

    return (
        <motion.div
            whileHover={isOnline ? { y: -8 } : {}}
            className={cn(
                "glass-card w-full rounded-[2rem] p-8 relative overflow-hidden group transition-all duration-500",
                isOn && isOnline ? "neon-border-primary neon-glow-primary" : "border-white/5",
                isSelected && "ring-2 ring-primary",
                !isOnline && "opacity-40 grayscale pointer-events-none"
            )}
            onClick={onClick}
        >
            {/* Selection Checkmark */}
            <div 
                onClick={handleSelect}
                className={cn(
                    "absolute top-6 left-6 w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer z-10 pointer-events-auto",
                    isSelected ? "bg-primary text-on-primary scale-110 shadow-lg shadow-primary/30" : "bg-white/5 text-white/20 hover:bg-white/10"
                )}
            >
                <Check size={16} strokeWidth={3} />
            </div>

            {/* Header Info */}
            <div className="flex justify-between items-start mb-4">
                <div className="pl-10">
                    <h3 className="text-xl font-heading font-bold text-on-surface line-clamp-1">
                        {device.nickName}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={cn(
                            "w-2 h-2 rounded-full",
                            isOnline ? (isOn ? "bg-tertiary animate-pulse" : "bg-white/20") : "bg-secondary"
                        )} />
                        <span className="text-[10px] font-bold tracking-widest uppercase text-on-surface-variant flex items-center gap-2">
                            {isOnline ? "System Active" : "DISCONNECTED"}
                            {isOnline && state?.currentTemperature && (
                                <span className="text-primary font-bold">
                                    • {state.currentTemperature}°C
                                </span>
                            )}
                        </span>
                    </div>
                </div>
                
                <button
                    onClick={handlePowerToggle}
                    className={cn(
                        "p-3 rounded-2xl transition-all duration-500 pointer-events-auto shadow-lg",
                        isOn && isOnline 
                            ? "bg-secondary text-on-secondary shadow-secondary/20" 
                            : "bg-surface-container-highest text-on-surface-variant"
                    )}
                >
                    <Power size={20} />
                </button>
            </div>

            {/* Temperature Readout */}
            <div className="flex items-center justify-center gap-10 mb-5">
                <button 
                    onClick={(e) => handleTempChange(e, -1)}
                    className="w-12 h-12 rounded-full border border-primary/20 flex items-center justify-center hover:bg-primary/20 transition-all active:scale-90 text-on-surface/60 hover:text-primary pointer-events-auto"
                >
                    <ChevronDown size={24} />
                </button>
                
                <div className="text-center relative">
                    <div className="text-[5rem] leading-none font-heading font-bold text-transparent bg-clip-text bg-gradient-to-b from-primary to-primary-dim">
                        {isOnline ? (state?.targetTemperature ?? "--") : "--"}°
                    </div>
                </div>

                <button 
                    onClick={(e) => handleTempChange(e, 1)}
                    className="w-12 h-12 rounded-full border border-primary/20 flex items-center justify-center hover:bg-primary/20 transition-all active:scale-90 text-on-surface/60 hover:text-primary pointer-events-auto"
                >
                    <ChevronUp size={24} />
                </button>
            </div>

            {/* Quick Controls Grid */}
            <div className="grid grid-cols-1 gap-5 pointer-events-auto">
                {/* Mode Strip */}
                <div>
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2.5 block opacity-60">Operation Mode</span>
                    <div className="flex justify-between bg-surface-container-lowest/50 p-1 rounded-2xl border border-white/5">
                        {[
                            { id: 1, icon: Snowflake, name: "Cool" },
                            { id: 0, icon: Sun, name: "Auto" },
                            { id: 2, icon: Droplets, name: "Dry" },
                            { id: 3, icon: Wind, name: "Fan" },
                            { id: 4, icon: Sun, name: "Heat" } // Using Sun for Heat too
                        ].map((m) => (
                            <button
                                key={m.id}
                                onClick={(e) => handleModeChange(e, m.id)}
                                className={cn(
                                    "flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center",
                                    state?.workMode === m.id ? "bg-primary text-on-primary shadow-lg shadow-primary/20" : "text-on-surface-variant hover:text-on-surface"
                                )}
                            >
                                <m.icon size={18} />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Fan Speed Row */}
                <div>
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2.5 block opacity-60">Fan Speed</span>
                    <div className="flex gap-2">
                        {[
                            { id: 2, name: "Low" },
                            { id: 4, name: "Mid" },
                            { id: 6, name: "High" },
                            { id: 7, name: "Turbo" }
                        ].map((s) => (
                            <button
                                key={s.id}
                                onClick={(e) => handleFanChange(e, s.id)}
                                className={cn(
                                    "flex-1 py-1.5 text-[10px] font-bold uppercase border rounded-lg transition-all",
                                    state?.windSpeed7Gear === s.id 
                                        ? "bg-primary/20 border-primary/50 text-white shadow-[0_0_15px_rgba(94,180,255,0.1)]" 
                                        : "border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-highest"
                                )}
                            >
                                {s.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Generator Mode Row */}
                <div>
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2.5 block opacity-60">Generator Mode</span>
                    <div className="flex gap-2">
                        {[
                            { id: 0, name: "Off" },
                            { id: 1, name: "L1" },
                            { id: 2, name: "L2" },
                            { id: 3, name: "L3" }
                        ].map((g) => (
                            <button
                                key={g.id}
                                onClick={(e) => handleGenChange(e, g.id)}
                                className={cn(
                                    "flex-1 py-1.5 text-[10px] font-bold uppercase border rounded-lg transition-all",
                                    state?.generatorMode === g.id 
                                        ? "bg-tertiary/20 border-tertiary/50 text-tertiary shadow-[0_0_15px_rgba(0,253,193,0.1)]" 
                                        : "border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-highest"
                                )}
                            >
                                {g.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default AcCard;
;

