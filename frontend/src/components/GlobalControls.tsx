import { useBulkUpdate, useDevices } from "@/service/tclService";
import { useSelectionStore } from "@/lib/SelectionStore";
import { Power, PowerOff, RefreshCcw, Snowflake, Wind } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const GlobalControls = () => {
    const { selectedDeviceIds } = useSelectionStore();
    const { data: devices } = useDevices();
    const bulkUpdate = useBulkUpdate();

    const allDeviceIds = devices?.map((d) => d.deviceId) || [];
    const targetDeviceIds = selectedDeviceIds.length > 0 ? selectedDeviceIds : allDeviceIds;
    const isUsingAll = selectedDeviceIds.length === 0;

    const handleBulkPower = (isOn: boolean) => {
        bulkUpdate.mutate({
            deviceIds: targetDeviceIds,
            properties: { powerSwitch: isOn ? 1 : 0 },
        });
    };

    const handleBulkGenMode = (mode: number) => {
        bulkUpdate.mutate({
            deviceIds: targetDeviceIds,
            properties: { generatorMode: mode },
        });
    };

    const handleBulkMode = (mode: number) => {
        const properties: any = { workMode: mode };
        if (mode === 1 || mode === 2) properties.targetTemperature = 16;
        if (mode === 3 || mode === 4) properties.targetTemperature = 31;

        bulkUpdate.mutate({
            deviceIds: targetDeviceIds,
            properties,
        });
    };

    const handleBulkFan = (speed: number) => {
        bulkUpdate.mutate({
            deviceIds: targetDeviceIds,
            properties: { windSpeed7Gear: speed },
        });
    };

    return (
        <AnimatePresence>
            <motion.footer
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-8 inset-x-0 mx-auto w-[92%] max-w-4xl z-50 pointer-events-none"
            >
                <div className="pointer-events-auto relative">
                    {/* Seamless Master Controller Bar */}
                    <div className="bg-[#0A101A]/90 backdrop-blur-3xl border border-white/10 shadow-[0_20px_100px_rgba(0,0,0,0.8)] 
                        rounded-[2rem] sm:rounded-[2.5rem] p-4 sm:p-5 sm:px-10  
                        grid grid-cols-2 sm:flex sm:flex-row justify-between items-center gap-4 sm:gap-4 
                        transition-all duration-500 hover:border-white/20"
                    >
                        {/* Status Float Label */}
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1 rounded-full bg-[#0A101A] border border-white/10 shadow-2xl">
                             <div className={`w-1 h-1 rounded-full animate-pulse ${isUsingAll ? "bg-primary" : "bg-tertiary"}`} />
                             <span className="text-[7px] sm:text-[8px] font-black tracking-[0.3em] uppercase text-on-surface-variant opacity-80 whitespace-nowrap">
                                {isUsingAll ? "Global Mode: ALL" : `Selection: ${selectedDeviceIds.length}`}
                             </span>
                        </div>

                        {/* Power Section */}
                        <div className="flex flex-col items-center gap-1.5 sm:gap-2">
                            <span className="text-[8px] sm:text-[9px] font-black tracking-[0.2em] uppercase text-on-surface-variant opacity-30">Power</span>
                            <div className="flex gap-3 sm:gap-4">
                                <button 
                                    onClick={() => handleBulkPower(false)}
                                    className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-secondary/10 text-secondary border border-secondary/20 hover:bg-secondary/20 active:scale-90 transition-all flex items-center justify-center p-0"
                                >
                                    <PowerOff size={18} className="sm:size-[20px] drop-shadow-[0_0_8px_rgba(255,113,98,0.3)]" />
                                </button>
                                <button 
                                    onClick={() => handleBulkPower(true)}
                                    className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-tertiary/10 text-tertiary border border-tertiary/20 hover:bg-tertiary/20 active:scale-90 transition-all flex items-center justify-center p-0"
                                >
                                    <Power size={18} className="sm:size-[20px] drop-shadow-[0_0_8px_rgba(0,253,193,0.3)]" />
                                </button>
                            </div>
                        </div>

                        <div className="hidden sm:block w-px h-10 bg-white/5 opacity-40 self-end mb-2" />

                        {/* Master Mode Section */}
                        <div className="flex flex-col items-center gap-1.5 sm:gap-2">
                            <span className="text-[8px] sm:text-[9px] font-black tracking-[0.2em] uppercase text-on-surface-variant opacity-30">Mode</span>
                            <div className="flex bg-white/5 rounded-xl sm:rounded-2xl p-1 gap-1 border border-white/5">
                                {[
                                    { id: 0, icon: RefreshCcw, title: "Auto" },
                                    { id: 1, icon: Snowflake, title: "Cool" },
                                    { id: 3, icon: Wind, title: "Fan" }
                                ].map((m) => (
                                    <button 
                                        key={m.id}
                                        onClick={() => handleBulkMode(m.id)}
                                        className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg sm:rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-white/10 transition-all active:bg-primary active:text-on-primary"
                                    >
                                        <m.icon size={16} className="sm:size-[18px]" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="hidden sm:block w-px h-10 bg-white/5 opacity-40 self-end mb-2" />

                        {/* Generator Section */}
                        <div className="flex flex-col items-center gap-1.5 sm:gap-2">
                            <span className="text-[8px] sm:text-[9px] font-black tracking-[0.2em] uppercase text-on-surface-variant opacity-30">Generator</span>
                            <div className="flex bg-white/5 rounded-xl sm:rounded-2xl p-1 gap-0.5 sm:gap-1 border border-white/5">
                                {[0, 1, 2, 3].map((g) => (
                                    <button 
                                        key={g}
                                        onClick={() => handleBulkGenMode(g)}
                                        className="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center text-[9px] sm:text-[10px] font-black rounded-lg sm:rounded-xl hover:bg-white/10 text-on-surface-variant transition-all active:bg-primary active:text-on-primary"
                                    >
                                        {g === 0 ? "OFF" : g}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="hidden sm:block w-px h-10 bg-white/5 opacity-40 self-end mb-2" />

                        {/* Fan Speed Section */}
                        <div className="flex flex-col items-center gap-1.5 sm:gap-2">
                            <span className="text-[8px] sm:text-[9px] font-black tracking-[0.2em] uppercase text-on-surface-variant opacity-30">Fan</span>
                            <div className="flex bg-white/5 rounded-xl sm:rounded-2xl p-1 gap-1 border border-white/5">
                                {[
                                    { id: 4, name: "MID" },
                                    { id: 7, name: "MAX" }
                                ].map((s) => (
                                    <button 
                                        key={s.id}
                                        onClick={() => handleBulkFan(s.id)}
                                        className="px-4 sm:px-5 py-1.5 sm:py-2 text-[9px] sm:text-[10px] font-black tracking-tighter uppercase rounded-lg sm:rounded-xl text-on-surface-variant hover:bg-white/10 transition-all active:bg-primary/20 active:text-primary"
                                    >
                                        {s.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.footer>
        </AnimatePresence>
    );
};

export default GlobalControls;
