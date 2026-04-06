import { useBulkUpdate } from "@/service/tclService";
import { useSelectionStore } from "@/lib/SelectionStore";
import { Power, RefreshCcw, Snowflake, Wind, CheckCircle2, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const GlobalControls = () => {
    const { selectedDeviceIds, clearSelection } = useSelectionStore();
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
        bulkUpdate.mutate({
            deviceIds: selectedDeviceIds,
            properties: { workMode: mode },
        });
    };

    const handleBulkFan = (speed: number) => {
        bulkUpdate.mutate({
            deviceIds: selectedDeviceIds,
            properties: { windSpeed7Gear: speed },
        });
    };

    return (
        <AnimatePresence>
            {hasSelection && (
                <motion.footer
                    initial={{ y: 100, x: "-50%", opacity: 0 }}
                    animate={{ y: 0, x: "-50%", opacity: 1 }}
                    exit={{ y: 100, x: "-50%", opacity: 0 }}
                    className="fixed bottom-8 left-1/2 w-full max-w-5xl z-50 px-6"
                >
                    <div className="master-bar-glass rounded-full px-12 py-6 flex flex-wrap justify-center items-center gap-12 shadow-[0px_20px_60px_rgba(0,0,0,0.4),0px_0px_20px_rgba(94,180,255,0.1)]">
                        
                        {/* Selection Badge & Clear */}
                        <div className="flex flex-col items-center gap-2">
                             <span className="text-[10px] font-bold text-on-surface-variant tracking-widest uppercase opacity-60">Selection</span>
                             <div className="flex items-center gap-3">
                                <div className="bg-primary/20 text-primary px-3 py-1.5 rounded-lg flex items-center gap-2 font-bold text-xs ring-1 ring-primary/30">
                                    <CheckCircle2 size={14} />
                                    {selectedDeviceIds.length}
                                </div>
                                <button onClick={clearSelection} className="text-on-surface-variant hover:text-secondary transition-colors">
                                    <Trash2 size={20} />
                                </button>
                             </div>
                        </div>

                        {/* Power Controls */}
                        <div className="space-y-2">
                            <span className="text-[10px] font-bold text-on-surface-variant tracking-widest uppercase block text-center opacity-60">Power</span>
                            <div className="flex gap-4">
                                <button 
                                    onClick={() => handleBulkPower(false)}
                                    className="w-12 h-12 rounded-full bg-secondary/20 text-secondary border border-secondary/30 shadow-[0_0_15px_rgba(255,113,98,0.2)] active:scale-95 transition-all flex items-center justify-center"
                                >
                                    <Power size={22} strokeWidth={2.5} />
                                </button>
                                <button 
                                    onClick={() => handleBulkPower(true)}
                                    className="w-12 h-12 rounded-full bg-tertiary/20 text-tertiary border border-tertiary/30 shadow-[0_0_15px_rgba(0,253,193,0.2)] active:scale-95 transition-all flex items-center justify-center"
                                >
                                    <Power size={22} strokeWidth={2.5} />
                                </button>
                            </div>
                        </div>

                        {/* Generator Mode */}
                        <div className="space-y-2">
                            <span className="text-[10px] font-bold text-on-surface-variant tracking-widest uppercase block text-center opacity-60">Generator</span>
                            <div className="flex bg-surface-container-highest/40 backdrop-blur-md rounded-xl p-1 gap-1 border border-white/5">
                                {[
                                    { id: 0, label: "Off" },
                                    { id: 1, label: "Lvl 1" },
                                    { id: 2, label: "Lvl 2" }
                                ].map((g) => (
                                    <button 
                                        key={g.id}
                                        onClick={() => handleBulkGenMode(g.id)}
                                        className="px-4 py-2 text-[10px] font-bold uppercase rounded-lg hover:bg-white/5 text-on-surface-variant transition-all active:bg-primary active:text-on-primary"
                                    >
                                        {g.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Master Mode */}
                        <div className="space-y-2">
                            <span className="text-[10px] font-bold text-on-surface-variant tracking-widest uppercase block text-center opacity-60">Master Mode</span>
                            <div className="flex bg-surface-container-highest/40 backdrop-blur-md rounded-xl p-1 gap-1 border border-white/5">
                                {[
                                    { id: 0, icon: RefreshCcw },
                                    { id: 1, icon: Snowflake },
                                    { id: 3, icon: Wind }
                                ].map((m) => (
                                    <button 
                                        key={m.id}
                                        onClick={() => handleBulkMode(m.id)}
                                        className="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all active:bg-primary active:text-on-primary"
                                    >
                                        <m.icon size={20} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Fan Selector */}
                        <div className="space-y-2">
                            <span className="text-[10px] font-bold text-on-surface-variant tracking-widest uppercase block text-center opacity-60">Fan Speed</span>
                            <div className="flex bg-surface-container-highest/40 backdrop-blur-md rounded-xl p-1 gap-1 border border-white/5">
                                {[
                                    { id: 4, name: "Mid" },
                                    { id: 7, name: "Turbo" }
                                ].map((s) => (
                                    <button 
                                        key={s.id}
                                        onClick={() => handleBulkFan(s.id)}
                                        className="px-3 py-1.5 text-[10px] font-bold uppercase rounded-lg text-on-surface-variant hover:bg-white/5 transition-all active:bg-primary/20 active:text-primary active:border-primary/20"
                                    >
                                        {s.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                    </div>
                </motion.footer>
            )}
        </AnimatePresence>
    );
};

export default GlobalControls;

