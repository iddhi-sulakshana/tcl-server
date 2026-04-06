import { useBulkUpdate } from "@/service/tclService";
import { useSelectionStore } from "@/lib/SelectionStore";
import { Power, Trash2, CheckCircle2, RefreshCcw, Snowflake, Zap, Wind } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const GlobalControls = ({ availableDeviceIds }: { availableDeviceIds: string[] }) => {
    const { selectedDeviceIds, clearSelection, selectAll } = useSelectionStore();
    const bulkUpdate = useBulkUpdate();

    const hasSelection = selectedDeviceIds.length > 0;

    const handleBulkPower = (isOn: boolean) => {
        bulkUpdate.mutate({
            deviceIds: selectedDeviceIds,
            properties: { powerSwitch: isOn ? 1 : 0 },
        });
    };

    const handleBulkGenMode = (mode: number) => {
        bulkUpdate.mutate({
            deviceIds: selectedDeviceIds,
            properties: { generatorMode: mode },
        });
    };

    const handleBulkMode = (mode: number) => {
        const properties: any = { workMode: mode };
        if (mode === 1) properties.targetTemperature = 16;
        if (mode === 3) properties.targetTemperature = 31;

        bulkUpdate.mutate({
            deviceIds: selectedDeviceIds,
            properties,
        });
    };

    return (
        <AnimatePresence>
            {hasSelection && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-4xl"
                >
                    <div className="glass p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl border-white/20">
                        <div className="flex items-center gap-4">
                            <div className="bg-primary/10 px-4 py-2 rounded-2xl flex items-center gap-2">
                                <CheckCircle2 className="text-primary" size={20} />
                                <span className="font-bold text-primary">{selectedDeviceIds.length} Selected</span>
                            </div>
                            <button
                                onClick={clearSelection}
                                className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                                title="Clear Selection"
                            >
                                <Trash2 size={24} />
                            </button>
                            <button
                                onClick={() => selectAll(availableDeviceIds)}
                                className="text-sm font-semibold text-primary/70 hover:text-primary"
                            >
                                Select All
                            </button>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-3">
                            {/* Power Controls */}
                            <div className="flex gap-2 bg-gray-100/50 p-1.5 rounded-2xl">
                                <button
                                    onClick={() => handleBulkPower(true)}
                                    className="px-4 py-2 bg-green-500 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-green-200"
                                >
                                    <Power size={18} /> On
                                </button>
                                <button
                                    onClick={() => handleBulkPower(false)}
                                    className="px-4 py-2 bg-red-500 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-red-200"
                                >
                                    <Power size={18} /> Off
                                </button>
                            </div>

                            {/* Mode Controls */}
                            <div className="flex gap-2 bg-gray-100/50 p-1.5 rounded-2xl">
                                <button
                                    onClick={() => handleBulkMode(0)}
                                    className={cn("p-2 rounded-xl shadow-sm hover:shadow-md transition-all bg-white text-gray-500")}
                                    title="Auto All"
                                >
                                    <RefreshCcw size={20} />
                                </button>
                                <button
                                    onClick={() => handleBulkMode(1)}
                                    className={cn("p-2 rounded-xl shadow-sm hover:shadow-md transition-all bg-white text-blue-500")}
                                    title="Cool All"
                                >
                                    <Snowflake size={20} />
                                </button>
                                <button
                                    onClick={() => handleBulkMode(3)}
                                    className={cn("p-2 rounded-xl shadow-sm hover:shadow-md transition-all bg-white text-teal-500")}
                                    title="Fan All"
                                >
                                    <Wind size={20} />
                                </button>
                                <button
                                    onClick={() => handleBulkMode(4)}
                                    className={cn("p-2 rounded-xl shadow-sm hover:shadow-md transition-all bg-white text-orange-500")}
                                    title="Heat All"
                                >
                                    <Zap size={20} />
                                </button>
                            </div>

                            {/* Generator Modes */}
                            <div className="flex gap-2 bg-gray-100/50 p-1.5 rounded-2xl overflow-hidden">
                                {[1, 2, 3, 0].map((mode) => (
                                    <button
                                        key={mode}
                                        onClick={() => handleBulkGenMode(mode)}
                                        className={cn(
                                            "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex flex-col items-center",
                                            mode === 0 
                                                ? "bg-gray-400 text-white" 
                                                : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                                        )}
                                    >
                                        <span>Gen {mode === 0 ? "Off" : mode}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default GlobalControls;
