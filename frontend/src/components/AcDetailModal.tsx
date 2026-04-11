import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronUp, ChevronDown, Wind, Snowflake, Droplets, RefreshCcw, Zap, Power, Bell, Sun, Tv, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, ArrowDownLeft, ArrowDownRight, ArrowUpRight, Leaf, AirVent, WashingMachine, Fan, type LucideIcon } from "lucide-react";
import { useDeviceState, useUpdateDeviceState } from "@/service/tclService";
import type { DeviceWithState } from "@/types/tcl";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface DirectionOption {
    id: number;
    label: string;
    icons: LucideIcon[];
}

interface ArcConfig {
    angle: number;
    swingRange?: [number, number];
}

const HorizontalConfig: Record<number, ArcConfig> = {
    9: { angle: 165 },
    10: { angle: 127.5 },
    11: { angle: 90 },
    12: { angle: 52.5 },
    13: { angle: 15 },

    2: { angle: 145, swingRange: [127.5, 165] },
    3: { angle: 90, swingRange: [52.5, 127.5] },
    4: { angle: 35, swingRange: [15, 52.5] },

    1: { angle: 90, swingRange: [15, 165] },
    8: { angle: 0 }, // Closed
};

const VerticalConfig: Record<number, ArcConfig> = {
    9: { angle: -75 },
    10: { angle: -37.5 },
    11: { angle: 0 },
    12: { angle: 37.5 },
    13: { angle: 75 },

    2: { angle: -45, swingRange: [-75, 0] },
    3: { angle: 45, swingRange: [0, 75] },

    1: { angle: 0, swingRange: [-75, 75] },
    8: { angle: 0 }, // Closed
};

const getArcSegmentPath = (cx: number, cy: number, r: number, startAngle: number, endAngle: number) => {
    const startRad = startAngle * (Math.PI / 180);
    const endRad = endAngle * (Math.PI / 180);
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    
    // For ranges < 180
    const largeArcFlag = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;
    const sweepFlag = endAngle > startAngle ? 1 : 0;
    
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} ${sweepFlag} ${x2} ${y2}`;
};

const DirectionArcSelector = ({
    title,
    options,
    value,
    onChange,
    arcType,
}: {
    title: string;
    options: DirectionOption[];
    value: number | undefined;
    onChange: (id: number) => void;
    arcType: 'vertical' | 'horizontal';
}) => {
    const width = arcType === 'vertical' ? 150 : 220;
    const height = arcType === 'vertical' ? 220 : 150;
    const cx = arcType === 'vertical' ? 40 : 110;
    const cy = arcType === 'vertical' ? 110 : 40;
    const rOuter = 96;
    const rInner = 62;
    const rInnermost = 28;
    const dotR = 12;

    const arcPathOuter = arcType === 'vertical'
        ? `M ${cx} ${cy - rOuter} A ${rOuter} ${rOuter} 0 0 1 ${cx} ${cy + rOuter}`
        : `M ${cx - rOuter} ${cy} A ${rOuter} ${rOuter} 0 0 0 ${cx + rOuter} ${cy}`;

    const arcPathInner = arcType === 'vertical'
        ? `M ${cx} ${cy - rInner} A ${rInner} ${rInner} 0 0 1 ${cx} ${cy + rInner}`
        : `M ${cx - rInner} ${cy} A ${rInner} ${rInner} 0 0 0 ${cx + rInner} ${cy}`;

    const arcPathInnermost = arcType === 'vertical'
        ? `M ${cx} ${cy - rInnermost} A ${rInnermost} ${rInnermost} 0 0 1 ${cx} ${cy + rInnermost}`
        : `M ${cx - rInnermost} ${cy} A ${rInnermost} ${rInnermost} 0 0 0 ${cx + rInnermost} ${cy}`;

    const configMap = arcType === 'vertical' ? VerticalConfig : HorizontalConfig;
    const current = options.find(o => o.id === value);
    const activeConfig = value !== undefined ? configMap[value] : undefined;

    return (
        <div className="bg-surface-container-highest/40 backdrop-blur-md p-5 rounded-[2rem] border border-white/5 flex flex-col justify-between h-full">
            <div>
                <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-primary mb-1">{title}</p>
                <p className="text-[11px] text-on-surface-variant mb-2 flex items-center gap-1 min-h-[16px]">
                    {current && (
                        <>
                            <span className="flex items-center gap-0.5">
                                {current.icons.map((Icon, i) => <Icon key={i} size={11} />)}
                            </span>
                            {current.label}
                        </>
                    )}
                </p>
            </div>
            
            <div className="flex justify-center flex-1 items-center mt-2">
                <div className="relative flex-shrink-0" style={{ width, height }}>
                    <svg className="absolute inset-0 text-on-surface/10" width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
                        <path d={arcPathOuter} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 4" />
                        <path d={arcPathInner} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 4" />
                        <path d={arcPathInnermost} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 4" />
                        
                        {/* Highlighted arc segment for active swing mode */}
                        {activeConfig?.swingRange && (
                            <path 
                                className="text-primary opacity-30"
                                d={getArcSegmentPath(cx, cy, rOuter, activeConfig.swingRange[0], activeConfig.swingRange[1])}
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="4" 
                                strokeLinecap="round" 
                            />
                        )}
                    </svg>
                    
                    {/* Animated sweep dot */}
                    {activeConfig?.swingRange && (
                        <motion.div
                            className="absolute z-0 pointer-events-none"
                            style={{ left: cx, top: cy, width: 0, height: 0 }}
                            animate={{ rotate: [activeConfig.swingRange[0], activeConfig.swingRange[1]] }}
                            transition={{ duration: 4, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                        >
                            <div style={{
                                position: 'absolute',
                                left: rOuter - 5,
                                top: -5,
                                width: 10,
                                height: 10,
                            }} className="bg-primary rounded-full ring-4 ring-primary/20 shadow-lg shadow-primary saturate-150" />
                        </motion.div>
                    )}

                    {options.map((opt) => {
                        const conf = configMap[opt.id];
                        if (!conf) return null;

                        const isClosed = opt.id === 8;
                        const isFullSwing = opt.id === 1;
                        const isSwingBtn = !!conf.swingRange;
                        const radius = isClosed ? 0 : (isFullSwing ? rInnermost : (isSwingBtn ? rInner : rOuter));

                        const angleRad = conf.angle * (Math.PI / 180);
                        const x = cx + radius * Math.cos(angleRad);
                        const y = cy + radius * Math.sin(angleRad);
                        
                        const isSelected = value === opt.id;

                        return (
                            <button
                                key={opt.id}
                                onClick={() => onChange(opt.id)}
                                title={opt.label}
                                style={{
                                    position: 'absolute',
                                    left: x - dotR,
                                    top: y - dotR,
                                    width: dotR * 2,
                                    height: dotR * 2,
                                }}
                                className={cn(
                                    "rounded-full flex items-center justify-center transition-all",
                                    isSelected ? "z-20" : "z-10",
                                    isSwingBtn && !isSelected && "border-dashed border-2 border-primary/40",
                                    !isSwingBtn && !isSelected && "border border-on-surface/10",
                                    isSelected
                                        ? "bg-primary text-on-primary shadow-lg shadow-primary/40 scale-125 border-transparent"
                                        : "bg-surface-container-highest/80 text-on-surface-variant hover:bg-primary/20 hover:text-primary hover:scale-110"
                                )}
                            >
                                <div className="flex items-center">
                                    {opt.icons.map((Icon, j) => <Icon key={j} size={10} strokeWidth={2.5} />)}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

interface AcDetailModalProps {
    device: DeviceWithState;
    isOpen: boolean;
    onClose: () => void;
}

const AcDetailModal = ({ device, isOpen, onClose }: AcDetailModalProps) => {
    const isOnline = device.isOnline === "1";
    const { data: state } = useDeviceState(device.deviceId, isOpen && isOnline);
    const updateState = useUpdateDeviceState();

    const [localTemp, setLocalTemp] = useState<number | null>(null);
    const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (state?.targetTemperature && !debounceTimeout.current) {
            setLocalTemp(state.targetTemperature);
        }
    }, [state?.targetTemperature]);

    const handleTempChange = (delta: number) => {
        if (!isOnline || !state) return;
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
        if (!isOnline || !state) return;
        const val = parseInt(e.target.value);
        setLocalTemp(val);

        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        debounceTimeout.current = setTimeout(() => {
            updateState.mutate({ deviceId: device.deviceId, properties: { targetTemperature: val } });
            debounceTimeout.current = null;
        }, 500);
    };

    const handleUpdate = (properties: any) => {
        if (!isOnline) {
            toast.error("Device is offline. Configuration unavailable.");
            return;
        }
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
        { id: 3, name: "Lvl 3", desc: "80%" },
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

    const VERTICAL_DIRECTIONS = [
        { id: 1, label: "Full Swing", icons: [ArrowUpRight, ArrowDownRight] },
        { id: 2, label: "Up Swing", icons: [ArrowUpRight] },
        { id: 3, label: "Down Swing", icons: [ArrowDownRight] },
        { id: 8, label: "Closed", icons: [X] },
        { id: 9, label: "Top", icons: [ArrowUp] },
        { id: 10, label: "Upper", icons: [ArrowUpRight] },
        { id: 11, label: "Middle", icons: [ArrowRight] },
        { id: 12, label: "Lower", icons: [ArrowDownRight] },
        { id: 13, label: "Bottom", icons: [ArrowDown] },
    ];

    const HORIZONTAL_DIRECTIONS = [
        { id: 1, label: "Full Swing", icons: [ArrowLeft, ArrowRight] },
        { id: 2, label: "Left Swing", icons: [ArrowLeft] },
        { id: 3, label: "Center", icons: [ArrowDown] },
        { id: 4, label: "Right Swing", icons: [ArrowRight] },
        { id: 8, label: "Closed", icons: [X] },
        { id: 9, label: "L Fix", icons: [ArrowLeft] },
        { id: 10, label: "CL Fix", icons: [ArrowDownLeft] },
        { id: 11, label: "Mid Fix", icons: [ArrowDown] },
        { id: 12, label: "CR Fix", icons: [ArrowDownRight] },
        { id: 13, label: "R Fix", icons: [ArrowRight] },
    ];

    const BINARY_SWITCHES = [
        { key: "beepSwitch", name: "Beep", icon: Bell },
        { key: "screen", name: "Display", icon: Tv }, 
        { key: "ECO", name: "ECO", icon: Zap },
        { key: "sleep", name: "Sleep", icon: Snowflake },
        { key: "softWind", name: "Soft Wind", icon: Wind },
        { key: "antiMoldew", name: "Anti-Mold", icon: Droplets },
        { key: "healthy", name: "Healthy", icon: Leaf },
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
                        <div className="flex items-center justify-center gap-4 mt-2 flex-wrap pb-2">
                            <div className="flex items-center gap-2">
                                <span className={cn("w-2 h-2 rounded-full", device.isOnline === "1" ? "bg-tertiary animate-pulse" : "bg-secondary")} />
                                <p className="text-on-surface-variant text-[10px] uppercase tracking-widest font-black flex items-center gap-1.5 opacity-80">
                                    <AirVent size={14} className="text-primary" /> Indoor {state?.currentTemperature}°C
                                </p>
                            </div>
                            {state?.externalUnitTemperature !== undefined && (
                                <div className="flex items-center gap-1.5 text-orange-500 text-[10px] uppercase tracking-widest font-black transition-all">
                                    <span className="w-1 h-1 rounded-full bg-orange-500/30" />
                                    <WashingMachine size={14} /> Outdoor {state.externalUnitTemperature}°C
                                    {state?.externalUnitFanSpeed !== undefined && (
                                        <div className="flex items-center gap-1.5 ml-1">
                                            <span className="w-1 h-1 rounded-full bg-orange-500/30" />
                                            <Fan size={14} /> EXT FAN {state.externalUnitFanSpeed}
                                        </div>
                                    )}
                                </div>
                            )}
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
                                
                                <div className="flex flex-col items-center gap-1 z-10 w-full max-w-[200px]">
                                    <button 
                                        onClick={() => handleTempChange(1)}
                                        className="p-2.5 bg-surface-container-highest/60 rounded-2xl hover:bg-primary/20 hover:text-primary active:scale-95 transition-all text-on-surface/60"
                                    >
                                        <ChevronUp size={32} />
                                    </button>
                                    
                                    <div className={cn(
                                        "text-7xl font-heading font-bold tracking-tighter tabular-nums my-1 text-transparent bg-clip-text bg-gradient-to-b relative",
                                        state?.workMode === 4 ? "from-orange-400 to-orange-600" : "from-primary to-primary-dim"
                                    )}>
                                        {localTemp ?? state?.targetTemperature}
                                        <span className="text-2xl font-sans font-medium absolute -top-1 -right-6 text-on-surface-variant">°C</span>
                                    </div>
                                    
                                    <button 
                                        onClick={() => handleTempChange(-1)}
                                        className="p-2.5 bg-surface-container-highest/60 rounded-2xl hover:bg-primary/20 hover:text-primary active:scale-95 transition-all text-on-surface/60"
                                    >
                                        <ChevronDown size={32} />
                                    </button>
                                </div>
                            </div>
                        </div>
                        {/* Slider */}
                        <div className="w-full mt-6 px-2 pointer-events-auto">
                            <input
                                type="range"
                                min="16"
                                max="31"
                                step="1"
                                value={localTemp ?? state?.targetTemperature ?? 16}
                                onChange={handleSliderChange}
                                className={cn(
                                    "w-full h-2 rounded-full appearance-none cursor-pointer accent-white [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-xl [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white/50 transition-all",
                                    state?.workMode === 4 ? "bg-gradient-to-r from-orange-400 to-orange-600" : "bg-gradient-to-r from-primary to-secondary"
                                )}
                            />
                            <div className="flex justify-between mt-1.5 px-0.5">
                                <span className="text-[10px] font-black tracking-widest text-on-surface-variant/30 uppercase">16°</span>
                                <span className="text-[10px] font-black tracking-widest text-on-surface-variant/30 uppercase">31°</span>
                            </div>
                        </div>

                        {/* Power Toggle */}
                        <div className="flex justify-center mb-8">
                            <button
                                onClick={() => handleUpdate(state?.powerSwitch === 1 ? { powerSwitch: 0 } : { powerSwitch: 1, healthy: 1 })}
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
                                            onClick={() => {
                                                const properties: any = { workMode: mode.id };
                                                if (mode.id === 1 || mode.id === 2) properties.targetTemperature = 16;
                                                if (mode.id === 3 || mode.id === 4) properties.targetTemperature = 31;
                                                handleUpdate(properties);
                                            }}
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

                            {/* Fan Speed */}
                            <div className="bg-surface-container-highest/40 backdrop-blur-md p-5 rounded-[2rem] border border-white/5">
                                <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-primary mb-4">Fan Speed</p>
                                <div className="grid grid-cols-4 gap-2">
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

                            {/* Wind Direction */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <DirectionArcSelector
                                    title="Vertical Direction"
                                    arcType="vertical"
                                    options={VERTICAL_DIRECTIONS}
                                    value={state?.verticalDirection}
                                    onChange={(id) => handleUpdate({ verticalDirection: id })}
                                />
                                <DirectionArcSelector
                                    title="Horizontal Direction"
                                    arcType="horizontal"
                                    options={HORIZONTAL_DIRECTIONS}
                                    value={state?.horizontalDirection}
                                    onChange={(id) => handleUpdate({ horizontalDirection: id })}
                                />
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

