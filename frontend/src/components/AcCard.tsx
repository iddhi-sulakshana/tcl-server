import React, { useState, useEffect, useRef } from "react";
import { useUpdateDeviceState } from "@/service/tclService";
import type { DeviceWithState } from "@/types/tcl";
import { Wind, Snowflake, ChevronUp, ChevronDown, Check, Power, AirVent, WashingMachine, Fan } from "lucide-react";
import { useSelectionStore } from "@/lib/SelectionStore";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface AcCardProps {
    device: DeviceWithState;
    onClick: () => void;
}

const AcCard = ({ device, onClick }: AcCardProps) => {
    const isOnline = device.isOnline === "1";
    const state = device.state;
    const updateState = useUpdateDeviceState();
    const { selectedDeviceIds, toggleDevice } = useSelectionStore();

    const isSelected = selectedDeviceIds.includes(device.deviceId);
    const isOn = state?.powerSwitch === 1;

    const [localTemp, setLocalTemp] = useState<number | null>(null);
    const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (state?.targetTemperature && !debounceTimeout.current) {
            setLocalTemp(state.targetTemperature);
        }
    }, [state?.targetTemperature]);

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
        const currentTemp = localTemp ?? state.targetTemperature;
        const newTemp = Math.min(31, Math.max(16, currentTemp + delta));
        setLocalTemp(newTemp);
        
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        debounceTimeout.current = setTimeout(() => {
            updateState.mutate({ deviceId: device.deviceId, properties: { targetTemperature: newTemp } });
            debounceTimeout.current = null;
        }, 300);
    };

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation();
        if (!checkOnline() || !state) return;
        const val = parseInt(e.target.value);
        setLocalTemp(val);

        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        debounceTimeout.current = setTimeout(() => {
            updateState.mutate({ deviceId: device.deviceId, properties: { targetTemperature: val } });
            debounceTimeout.current = null;
        }, 500);
    };

    const handleModeChange = (e: React.MouseEvent, mode: number) => {
        e.stopPropagation();
        if (!checkOnline()) return;

        const properties: any = { workMode: mode };
        if (mode === 1 || mode === 2) {
            properties.targetTemperature = 16;
            setLocalTemp(16);
        }
        if (mode === 3 || mode === 4) {
            properties.targetTemperature = 31;
            setLocalTemp(31);
        }

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
            properties: state.powerSwitch === 1 ? { powerSwitch: 0 } : { powerSwitch: 1, healthy: 1 },
        });
    };

    const handleSelect = (e: React.MouseEvent) => {
        e.stopPropagation();
        toggleDevice(device.deviceId);
    };

    return (
        <motion.div
            whileHover={isOnline ? { y: -8 } : {}}
            className={cn(
                "glass-card w-full rounded-[2rem] p-6 sm:p-8 relative overflow-hidden group transition-all duration-500",
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
                    "absolute top-6 left-5 sm:left-6 w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer z-10 pointer-events-auto",
                    isSelected ? "bg-primary text-on-primary scale-110 shadow-lg shadow-primary/30" : "bg-white/5 text-white/20 hover:bg-white/10"
                )}
            >
                <Check size={16} strokeWidth={3} />
            </div>

            {/* Header Info */}
            <div className="flex justify-between items-start mb-1 gap-2">
                <div className="pl-8 sm:pl-10 min-w-0 flex-1">
                    <h3 className="text-lg sm:text-xl font-heading font-bold text-on-surface line-clamp-1">
                        {device.nickName}
                    </h3>
                    <div className="flex items-start gap-2">
                        <span className={cn(
                            "w-1.5 h-1.5 rounded-full mt-1",
                            isOnline ? (isOn ? "bg-tertiary animate-pulse" : "bg-white/20") : "bg-secondary"
                        )} />
                        <div className="flex flex-col gap-1 min-w-0">
                            <span className="text-[10px] font-black tracking-[0.2em] uppercase text-on-surface-variant opacity-60">
                                {isOnline ? "System Active" : "DISCONNECTED"}
                            </span>
                            {isOnline && state?.currentTemperature && (
                                <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest leading-none">
                                    <span className="text-primary flex items-center gap-1">
                                        <AirVent size={12} /> Inside {state.currentTemperature}°C
                                    </span>
                                    {state?.externalUnitTemperature !== undefined && (
                                        <span className="text-orange-500 flex items-center gap-1">
                                            <WashingMachine size={12} /> Outside {state.externalUnitTemperature}°C
                                            {state?.externalUnitFanSpeed !== undefined && (
                                                <span className="flex items-center gap-1">
                                                    <Fan size={12} /> Fan {state.externalUnitFanSpeed}
                                                </span>
                                            )}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                <button
                    onClick={handlePowerToggle}
                    className={cn(
                        "p-2.5 sm:p-3 rounded-2xl transition-all duration-500 pointer-events-auto shadow-lg shrink-0",
                        isOn && isOnline 
                            ? "bg-secondary text-on-secondary shadow-secondary/20" 
                            : "bg-surface-container-highest text-on-surface-variant"
                    )}
                >
                    <Power size={18} className="sm:size-[20px]" />
                </button>
            </div>

            {/* Temperature Readout & Slider */}
            <div className="flex flex-col items-center mb-1 w-full group/temp">
                <div className="flex items-center justify-center gap-5 mb-1 w-full">
                    <button 
                        onClick={(e) => handleTempChange(e, -1)}
                        className="w-8 h-8 rounded-full border border-primary/20 flex items-center justify-center hover:bg-primary/20 transition-all active:scale-90 text-on-surface/60 hover:text-primary pointer-events-auto"
                    >
                        <ChevronDown size={24} />
                    </button>
                    
                    <div className="text-center relative min-w-[3ch]">
                        <div className={cn(
                            "text-6xl leading-none font-heading font-bold text-transparent bg-clip-text bg-gradient-to-b",
                            state?.workMode === 4 ? "from-orange-400 to-orange-600" : "from-primary to-primary-dim"
                        )}>
                            {isOnline ? (localTemp ?? state?.targetTemperature ?? "--") : "--"}
                        </div>
                    </div>

                    <button 
                        onClick={(e) => handleTempChange(e, 1)}
                        className="w-8 h-8 rounded-full border border-primary/20 flex items-center justify-center hover:bg-primary/20 transition-all active:scale-90 text-on-surface/60 hover:text-primary pointer-events-auto"
                    >
                        <ChevronUp size={24} />
                    </button>
                </div>

                {/* Range Slider */}
                <div className="w-full px-2 pointer-events-auto">
                    <input
                        type="range"
                        min="16"
                        max="31"
                        step="1"
                        value={localTemp ?? state?.targetTemperature ?? 16}
                        onChange={handleSliderChange}
                        onClick={(e) => e.stopPropagation()}
                        className={cn(
                            "w-full h-1.5 rounded-full appearance-none cursor-pointer accent-white [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white/50 transition-all",
                            state?.workMode === 4 ? "bg-gradient-to-r from-orange-400 to-orange-600" : "bg-gradient-to-r from-primary to-secondary"
                        )}
                    />
                    <div className="flex justify-between mt-1 px-0.5">
                        <span className="text-[9px] font-black tracking-widest text-on-surface-variant/30 uppercase">16</span>
                        <span className="text-[9px] font-black tracking-widest text-on-surface-variant/30 uppercase">31</span>
                    </div>
                </div>
            </div>

            {/* Quick Controls Grid */}
            <div className="grid grid-cols-1 gap-5 pointer-events-auto">
                {/* Mode + Fan Speed on same row */}
                <div className="grid grid-cols-2 gap-3">
                    {/* Operation Mode */}
                    <div>
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2.5 block opacity-60">Mode</span>
                        <div className="flex bg-surface-container-lowest/50 p-1 rounded-2xl border border-white/5">
                            {[
                                { id: 1, icon: Snowflake, name: "AC" },
                                { id: 3, icon: Wind, name: "Fan" },
                            ].map((m) => (
                                <button
                                    key={m.id}
                                    onClick={(e) => handleModeChange(e, m.id)}
                                    className={cn(
                                        "flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5",
                                        state?.workMode === m.id ? "bg-primary text-on-primary shadow-lg shadow-primary/20" : "text-on-surface-variant hover:text-on-surface"
                                    )}
                                >
                                    <m.icon size={14} />
                                    <span className="text-[10px] font-bold uppercase">{m.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Fan Speed */}
                    <div>
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2.5 block opacity-60">Fan Speed</span>
                        <div className="flex gap-1.5">
                            {[
                                { id: 2, name: "Low" },
                                { id: 7, name: "Max" },
                            ].map((s) => (
                                <button
                                    key={s.id}
                                    onClick={(e) => handleFanChange(e, s.id)}
                                    className={cn(
                                        "flex-1 py-2.5 text-[10px] font-bold uppercase border rounded-xl transition-all",
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

