import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronUp, ChevronDown, Wind, Snowflake, Droplets, RefreshCcw, Zap, Power, Bell, Sun, Tv } from "lucide-react";
import { useDeviceState, useUpdateDeviceState } from "@/service/tclService";
import type { DeviceItem } from "@/types/tcl";
import { cn } from "@/lib/utils";

interface AcDetailModalProps {
    device: DeviceItem;
    isOpen: boolean;
    onClose: () => void;
}

const AcDetailModal = ({ device, isOpen, onClose }: AcDetailModalProps) => {
    const { data: state } = useDeviceState(device.deviceId, isOpen);
    const updateState = useUpdateDeviceState();

    const handleUpdate = (properties: any) => {
        updateState.mutate({ deviceId: device.deviceId, properties });
    };

    const MODES = [
        { id: 0, name: "Auto", icon: RefreshCcw },
        { id: 1, name: "Cool", icon: Snowflake },
        { id: 2, name: "Dry", icon: Droplets },
        { id: 3, name: "Fan", icon: Wind },
        { id: 4, name: "Heat", icon: Sun },
    ];

    const GEN_MODES = [
        { id: 0, name: "Off", desc: "100%" },
        { id: 1, name: "Lvl 1", desc: "30%" },
        { id: 2, name: "Lvl 2", desc: "50%" },
        { id: 3, name: "Lvl 3", desc: "70%" },
    ];

    const FAN_SPEEDS = [
        { id: 0, name: "Auto" },
        { id: 1, name: "Mute" },
        { id: 2, name: "Low" },
        { id: 3, name: "Lvl 2" },
        { id: 4, name: "Mid" },
        { id: 5, name: "Lvl 4" },
        { id: 6, name: "High" },
        { id: 7, name: "Turbo" },
    ];

    const BINARY_SWITCHES = [
        { key: "beepSwitch", name: "Beep", icon: Bell },
        { key: "screen", name: "Display", icon: Tv }, 
        { key: "ECO", name: "ECO", icon: Zap },
        { key: "sleep", name: "Sleep", icon: Snowflake },
        { key: "softWind", name: "Soft Wind", icon: Wind },
        { key: "antiMoldew", name: "Anti-Mold", icon: Droplets },
    ];

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-background/60 backdrop-blur-md"
                />
                
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-lg glass-card rounded-[2.5rem] p-8 text-on-surface shadow-[0_0_80px_rgba(0,0,0,0.5)] overflow-hidden"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 bg-on-surface/5 rounded-full hover:bg-on-surface/10 transition-colors z-10 text-on-surface-variant hover:text-on-surface"
                    >
                        <X size={20} />
                    </button>

                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-heading font-bold text-primary">{device.nickName}</h2>
                        <div className="flex items-center justify-center gap-2 mt-1">
                            <span className={cn("w-2 h-2 rounded-full", device.isOnline === "1" ? "bg-tertiary animate-pulse" : "bg-secondary")} />
                            <p className="text-on-surface-variant text-xs uppercase tracking-widest font-bold">Indoor {state?.currentTemperature}°C</p>
                        </div>
                    </div>

                    {/* Scrollable content area */}
                    <div className="overflow-y-auto max-h-[70vh] custom-scrollbar pr-2 -mr-2">
                        {/* Circular Temp Control */}
                        <div className="flex flex-col items-center gap-6 mb-8 mt-4">
                            <div className="relative w-56 h-56 flex items-center justify-center">
                                {/* Decorative Outer Rings */}
                                <div className="absolute inset-0 rounded-full border border-primary/10" />
                                <div className="absolute inset-4 rounded-full border-2 border-primary/20 border-dashed animate-[spin_30s_linear_infinite]" />
                                <div className="absolute inset-8 rounded-full bg-primary/5 blur-3xl" />
                                
                                <div className="flex flex-col items-center gap-1 z-10">
                                    <button 
                                        onClick={() => handleUpdate({ targetTemperature: (state?.targetTemperature ?? 25) + 1 })}
                                        className="p-2.5 bg-surface-container-highest/60 rounded-2xl hover:bg-primary/20 hover:text-primary active:scale-95 transition-all text-on-surface/60"
                                    >
                                        <ChevronUp size={32} />
                                    </button>
                                    
                                    <div className="text-7xl font-heading font-bold tracking-tighter tabular-nums my-1 text-transparent bg-clip-text bg-gradient-to-b from-primary to-primary-dim relative">
                                        {state?.targetTemperature}
                                        <span className="text-2xl font-sans font-medium absolute -top-1 -right-6 text-on-surface-variant">°C</span>
                                    </div>
                                    
                                    <button 
                                        onClick={() => handleUpdate({ targetTemperature: (state?.targetTemperature ?? 25) - 1 })}
                                        className="p-2.5 bg-surface-container-highest/60 rounded-2xl hover:bg-primary/20 hover:text-primary active:scale-95 transition-all text-on-surface/60"
                                    >
                                        <ChevronDown size={32} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Power Toggle */}
                        <div className="flex justify-center mb-8">
                            <button
                                onClick={() => handleUpdate({ powerSwitch: state?.powerSwitch === 1 ? 0 : 1 })}
                                className={cn(
                                    "flex items-center gap-3 px-10 py-4 rounded-full font-bold transition-all duration-500 shadow-xl group",
                                    state?.powerSwitch === 1 
                                        ? "bg-secondary text-on-secondary shadow-secondary/30" 
                                        : "bg-tertiary text-on-tertiary shadow-tertiary/30"
                                )}
                            >
                                <Power size={22} className="group-hover:rotate-90 transition-transform duration-500" />
                                <span className="text-lg uppercase tracking-wider">{state?.powerSwitch === 1 ? "System Off" : "System On"}</span>
                            </button>
                        </div>

                        {/* Dynamic Controls Grid */}
                        <div className="space-y-6 pb-4 text-on-surface">
                            {/* Modes */}
                            <div className="bg-surface-container-highest/40 backdrop-blur-md p-5 rounded-[2rem] border border-white/5">
                                <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-primary mb-4 ml-1">Operation Mode</p>
                                <div className="grid grid-cols-5 gap-2">
                                    {MODES.map((mode) => (
                                        <button
                                            key={mode.id}
                                            onClick={() => handleUpdate({ workMode: mode.id })}
                                            className={cn(
                                                "flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all",
                                                state?.workMode === mode.id 
                                                    ? "bg-primary text-on-primary shadow-lg shadow-primary/30" 
                                                    : "bg-surface-container-lowest/50 hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface"
                                            )}
                                        >
                                            <mode.icon size={20} />
                                            <span className="text-[9px] font-bold uppercase">{mode.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Fan & Swing */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-surface-container-highest/40 backdrop-blur-md p-5 rounded-[2rem] border border-white/5">
                                    <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-primary mb-4">Fan Speed</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {FAN_SPEEDS.map((speed) => (
                                            <button
                                                key={speed.id}
                                                onClick={() => handleUpdate({ windSpeed7Gear: speed.id })}
                                                className={cn(
                                                    "py-3 rounded-xl text-[10px] font-bold uppercase transition-all",
                                                    state?.windSpeed7Gear === speed.id 
                                                        ? "bg-primary text-on-primary" 
                                                        : "bg-surface-container-lowest/50 text-on-surface-variant hover:bg-surface-container-highest"
                                                )}
                                            >
                                                {speed.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-surface-container-highest/40 backdrop-blur-md p-5 rounded-[2rem] border border-white/5 flex flex-col">
                                    <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-primary mb-4">Swing Mode</p>
                                    <div className="flex-1 flex flex-col gap-2">
                                        <button
                                            onClick={() => handleUpdate({ verticalDirection: state?.verticalDirection === 8 ? 0 : 8 })}
                                            className={cn(
                                                "flex-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2",
                                                state?.verticalDirection === 8 ? "bg-primary/20 text-primary border border-primary/30" : "bg-surface-container-lowest/50 text-on-surface-variant hover:bg-surface-container-highest"
                                            )}
                                        >
                                            <Wind size={16} /> Vertical
                                        </button>
                                        <button
                                            onClick={() => handleUpdate({ horizontalDirection: state?.horizontalDirection === 8 ? 0 : 8 })}
                                            className={cn(
                                                "flex-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2",
                                                state?.horizontalDirection === 8 ? "bg-primary/20 text-primary border border-primary/30" : "bg-surface-container-lowest/50 text-on-surface-variant hover:bg-surface-container-highest"
                                            )}
                                        >
                                            <Wind className="rotate-90" size={16} /> Horizontal
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Gen Mode & Switches */}
                            <div className="grid grid-cols-1 gap-4">
                                <div className="bg-surface-container-highest/40 backdrop-blur-md p-5 rounded-[2rem] border border-white/5">
                                    <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-primary mb-4">Gen Limit Mode</p>
                                    <div className="grid grid-cols-4 gap-2">
                                        {GEN_MODES.map((mode) => (
                                            <button
                                                key={mode.id}
                                                onClick={() => handleUpdate({ generatorMode: mode.id })}
                                                className={cn(
                                                    "p-3 rounded-2xl flex flex-col items-center transition-all",
                                                    state?.generatorMode === mode.id ? "bg-primary text-on-primary" : "bg-surface-container-lowest/50 text-on-surface-variant"
                                                )}
                                            >
                                                <span className="text-[10px] font-bold uppercase">{mode.name}</span>
                                                <span className="text-[8px] opacity-70">{mode.desc}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-surface-container-highest/40 backdrop-blur-md p-5 rounded-[2rem] border border-white/5">
                                    <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-primary mb-4">Quick Switches</p>
                                    <div className="grid grid-cols-3 gap-2">
                                        {BINARY_SWITCHES.map((sw) => (
                                            <button
                                                key={sw.key}
                                                onClick={() => handleUpdate({ [sw.key]: state?.[sw.key as keyof typeof state] === 1 ? 0 : 1 })}
                                                className={cn(
                                                    "flex flex-col items-center gap-1 p-3 rounded-xl transition-all",
                                                    state?.[sw.key as keyof typeof state] === 1 ? "bg-primary/20 text-primary border border-primary/20" : "bg-surface-container-lowest/50 text-on-surface-variant hover:bg-surface-container-highest"
                                                )}
                                            >
                                                <sw.icon size={18} />
                                                <span className="text-[10px] font-bold truncate w-full uppercase text-center mt-1">{sw.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default AcDetailModal;

