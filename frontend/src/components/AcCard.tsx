import React from "react";
import { useDeviceState, useUpdateDeviceState } from "@/service/tclService";
import type { DeviceItem } from "@/types/tcl";
import { Power, Wind, CheckCircle2, Circle } from "lucide-react";
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

    const handlePowerToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        updateState.mutate({
            deviceId: device.deviceId,
            properties: { powerSwitch: isOn ? 0 : 1 },
        });
    };

    const handleSelect = (e: React.MouseEvent) => {
        e.stopPropagation();
        toggleDevice(device.deviceId);
    };

    if (isLoading) {
        return (
            <div className="h-40 glass animate-pulse rounded-2xl flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-gray-200/50" />
            </div>
        );
    }

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={cn(
                "relative p-5 glass rounded-3xl cursor-pointer transition-all duration-500",
                isOn ? "ring-2 ring-primary/50 shadow-primary/20" : "opacity-80 grayscale-[0.2]"
            )}
        >
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "p-3 rounded-2xl transition-colors duration-500",
                        isOn ? "bg-primary text-white" : "bg-gray-200/50 text-gray-400"
                    )}>
                        <Wind size={24} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg line-clamp-1">{device.nickName}</h3>
                        <p className="text-xs text-muted-foreground opacity-70">
                            Indoor {state?.currentTemperature}°C
                        </p>
                    </div>
                </div>
                
                <div className="flex gap-2">
                    <button
                        onClick={handleSelect}
                        className={cn(
                            "p-2 rounded-full transition-all",
                            isSelected ? "text-primary bg-primary/10" : "text-gray-300 hover:text-primary/50"
                        )}
                    >
                        {isSelected ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                    </button>
                    <button
                        onClick={handlePowerToggle}
                        className={cn(
                            "p-3 rounded-full transition-all duration-500",
                            isOn ? "bg-red-500 text-white shadow-lg shadow-red-200" : "bg-gray-200 text-gray-400 hover:bg-gray-300"
                        )}
                    >
                        <Power size={20} />
                    </button>
                </div>
            </div>

            <div className="flex items-end justify-between">
                <div>
                    <span className="text-4xl font-bold tracking-tighter">
                        {state?.targetTemperature}°C
                    </span>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <div className={cn(
                        "flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full",
                        state?.workMode === 1 ? "bg-blue-500/10 text-blue-500" : 
                        state?.workMode === 0 ? "bg-green-500/10 text-green-500" :
                        state?.workMode === 4 ? "bg-orange-500/10 text-orange-500" :
                        "bg-gray-500/10 text-gray-500"
                    )}>
                        {state?.workMode === 0 && "Auto"}
                        {state?.workMode === 1 && "Cool"}
                        {state?.workMode === 2 && "Dry"}
                        {state?.workMode === 3 && "Fan"}
                        {state?.workMode === 4 && "Heat"}
                    </div>
                </div>
            </div>

            {/* Slider Track Visualization */}
            <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${((state?.targetTemperature ?? 16) - 16) / (32 - 16) * 100}%` }}
                    className="h-full bg-gradient-to-r from-blue-400 to-blue-600"
                />
            </div>
        </motion.div>
    );
};

export default AcCard;
