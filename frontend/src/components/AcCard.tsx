import React from "react";
import { useDeviceState, useUpdateDeviceState } from "@/service/tclService";
import type { DeviceItem } from "@/types/tcl";
import { Wind, Snowflake, Droplets, Sun, ChevronUp, ChevronDown, Check } from "lucide-react";
import { useSelectionStore } from "@/lib/SelectionStore";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AcCardProps {
    device: DeviceItem;
    onClick: () => void;
}

const AcCard = ({ device, onClick }: AcCardProps) => {
    const { data: state, isLoading } = useDeviceState(device.deviceId);
    const updateState = useUpdateDeviceState();
    const { selectedDeviceIds, toggleDevice } = useSelectionStore();

    const isSelected = selectedDeviceIds.includes(device.deviceId);
    const isOn = state?.powerSwitch === 1;

    const handleTempChange = (e: React.MouseEvent, delta: number) => {
        e.stopPropagation();
        if (!state) return;
        updateState.mutate({
            deviceId: device.deviceId,
            properties: { targetTemperature: state.targetTemperature + delta },
        });
    };

    const handleModeChange = (e: React.MouseEvent, mode: number) => {
        e.stopPropagation();
        updateState.mutate({
            deviceId: device.deviceId,
            properties: { workMode: mode },
        });
    };

    const handleFanChange = (e: React.MouseEvent, speed: number) => {
        e.stopPropagation();
        updateState.mutate({
            deviceId: device.deviceId,
            properties: { windSpeed7Gear: speed },
        });
    };

    const handleSelect = (e: React.MouseEvent) => {
        e.stopPropagation();
        toggleDevice(device.deviceId);
    };

    if (isLoading) {
        return (
            <div className="w-full h-80 glass-card animate-pulse rounded-[2rem]" />
        );
    }

    return (
        <motion.div
            whileHover={{ y: -8 }}
            className={cn(
                "glass-card w-full rounded-[2rem] p-8 relative overflow-hidden group transition-all duration-500",
                isOn ? "neon-border-primary neon-glow-primary" : "opacity-60 grayscale-[0.5] border-white/5",
                isSelected && "ring-2 ring-primary"
            )}
            onClick={onClick}
        >
            {/* Selection Checkmark */}
            <div 
                onClick={handleSelect}
                className={cn(
                    "absolute top-6 right-6 w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer z-10",
                    isSelected ? "bg-primary text-on-primary scale-110 shadow-lg shadow-primary/30" : "bg-white/5 text-white/20 hover:bg-white/10"
                )}
            >
                <Check size={16} strokeWidth={3} />
            </div>

            {/* Header Info */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h3 className="text-xl font-heading font-bold text-on-surface line-clamp-1 pr-10">
                        {device.nickName}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={cn(
                            "w-2 h-2 rounded-full",
                            isOn ? "bg-tertiary animate-pulse" : "bg-white/20"
                        )} />
                        <span className="text-[10px] font-bold tracking-widest uppercase text-on-surface-variant">
                            {isOn ? (
                                state?.workMode === 1 ? "Cooling Active" :
                                state?.workMode === 4 ? "Heating Active" :
                                "System Active"
                            ) : "System Offline"}
                        </span>
                    </div>
                </div>
                <div className="p-2 bg-primary/10 rounded-xl text-primary">
                    <Snowflake size={24} />
                </div>
            </div>

            {/* Temperature Readout */}
            <div className="flex items-center justify-center gap-10 mb-10">
                <button 
                    onClick={(e) => handleTempChange(e, -1)}
                    className="w-12 h-12 rounded-full border border-primary/20 flex items-center justify-center hover:bg-primary/20 transition-all active:scale-90 text-on-surface/60 hover:text-primary"
                >
                    <ChevronDown size={24} />
                </button>
                
                <div className="text-center relative">
                    <div className="text-[5rem] leading-none font-heading font-bold text-transparent bg-clip-text bg-gradient-to-b from-primary to-primary-dim">
                        {state?.targetTemperature ?? "--"}°
                    </div>
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.3em] absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
                        Target Temp
                    </span>
                </div>

                <button 
                    onClick={(e) => handleTempChange(e, 1)}
                    className="w-12 h-12 rounded-full border border-primary/20 flex items-center justify-center hover:bg-primary/20 transition-all active:scale-90 text-on-surface/60 hover:text-primary"
                >
                    <ChevronUp size={24} />
                </button>
            </div>

            {/* Quick Controls Grid */}
            <div className="grid grid-cols-1 gap-6">
                {/* Mode Strip */}
                <div>
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3 block opacity-60">Operation Mode</span>
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
                                    "flex-1 py-3 rounded-xl transition-all flex items-center justify-center",
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
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3 block opacity-60">Fan Speed</span>
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
                                    "flex-1 py-2 text-[10px] font-bold uppercase border rounded-lg transition-all",
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
            </div>
        </motion.div>
    );
};

export default AcCard;

