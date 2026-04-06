import { create } from "zustand";

interface SelectionStore {
    selectedDeviceIds: string[];
    toggleDevice: (deviceId: string) => void;
    clearSelection: () => void;
    selectAll: (deviceIds: string[]) => void;
}

export const useSelectionStore = create<SelectionStore>((set) => ({
    selectedDeviceIds: [],
    toggleDevice: (deviceId: string) => {
        set((state) => {
            const isSelected = state.selectedDeviceIds.includes(deviceId);
            return {
                selectedDeviceIds: isSelected
                    ? state.selectedDeviceIds.filter((id) => id !== deviceId)
                    : [...state.selectedDeviceIds, deviceId],
            };
        });
    },
    clearSelection: () => set({ selectedDeviceIds: [] }),
    selectAll: (deviceIds: string[]) => set({ selectedDeviceIds: deviceIds }),
}));
