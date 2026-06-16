// Drop-in replacement for src/service/tclService.ts that talks to TCL directly
// (no backend). Same hook names/signatures, so components swap only the import:
//
//   - import { useDevices, useUpdateDeviceState, ... } from "@/service/tclService"
//   + import { useDevices, useUpdateDeviceState, ... } from "@/service/tcl/hooks"
//
// Login: use `useTclLogin` here instead of `useLogin` from tclService — it takes
// the user's REAL TCL email + password.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { DeviceState, DeviceWithState } from "@/types/tcl";
import type { CachedDeviceData, DeviceData } from "./types";
import { useTclSession } from "./sessionStore";

// reported shadow -> the trimmed DeviceState the UI consumes (mirrors backend service.ts)
function toDeviceState(cached: CachedDeviceData): DeviceState {
    const r = cached.state.reported;
    return {
        powerSwitch: r.powerSwitch,
        targetTemperature: r.targetTemperature,
        currentTemperature: r.currentTemperature,
        windSpeed7Gear: r.windSpeed7Gear,
        verticalDirection: r.verticalDirection,
        horizontalDirection: r.horizontalDirection,
        workMode: r.workMode,
        screen: r.screen,
        sleep: r.sleep,
        beepSwitch: r.beepSwitch,
        softWind: r.softWind,
        antiMoldew: r.antiMoldew,
        ECO: r.ECO,
        generatorMode: r.generatorMode,
        healthy: r.healthy,
        externalUnitTemperature: r.externalUnitTemperature,
        externalUnitFanSpeed: r.externalUnitFanSpeed,
    };
}

function toDeviceWithState(device: DeviceData, state: DeviceState | null): DeviceWithState {
    return {
        deviceId: device.deviceId,
        deviceName: device.deviceName,
        nickName: device.nickName,
        isOnline: device.isOnline,
        deviceType: device.deviceType,
        mac: device.mac,
        category: device.category,
        state,
    };
}

// Login with real TCL credentials (replaces useLogin from tclService.ts)
export const useTclLogin = () => {
    const login = useTclSession((s) => s.login);
    return useMutation({
        mutationFn: async (credentials: { username: string; password: string }) => {
            const ok = await login(credentials.username, credentials.password);
            if (!ok) throw new Error("Login failed");
            return ok;
        },
        onSuccess: () => toast.success("Logged in to TCL Cloud!"),
    });
};

// Devices + merged state (mirrors backend getDevicesService)
export const useDevices = () => {
    const status = useTclSession((s) => s.status);
    return useQuery({
        queryKey: ["tcl-devices"],
        enabled: status === "connected",
        refetchInterval: 10000,
        queryFn: async () => {
            const client = useTclSession.getState().requireClient();
            const devices = await client.getDevicelist();

            const online = devices.filter((d) => d.isOnline === "1");
            const states = await Promise.allSettled(
                online.map((d) => client.getDeviceState({ deviceId: d.deviceId, forceRefresh: false }))
            );

            const stateMap = new Map<string, DeviceState>();
            online.forEach((device, i) => {
                const res = states[i];
                if (res.status === "fulfilled" && res.value) {
                    stateMap.set(device.deviceId, toDeviceState(res.value));
                }
            });

            return devices
                .map((d) => toDeviceWithState(d, stateMap.get(d.deviceId) ?? null))
                .sort((a, b) => a.nickName.localeCompare(b.nickName));
        },
    });
};

export const useDeviceState = (deviceId: string, enabled = true) => {
    const status = useTclSession((s) => s.status);
    return useQuery({
        queryKey: ["tcl-device-state", deviceId],
        enabled: enabled && !!deviceId && status === "connected",
        refetchInterval: 5000,
        queryFn: async () => {
            const client = useTclSession.getState().requireClient();
            const cached = await client.getDeviceState({ deviceId, forceRefresh: false });
            if (!cached) throw new Error("Failed to retrieve device state");
            return toDeviceState(cached);
        },
    });
};

export const useUpdateDeviceState = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ deviceId, properties }: { deviceId: string; properties: Partial<DeviceState> }) => {
            const client = useTclSession.getState().requireClient();
            return client.setDeviceState({ deviceId, properties });
        },
        onSuccess: async (_, { deviceId }) => {
            await new Promise((r) => setTimeout(r, 1000)); // let the shadow settle
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["tcl-device-state", deviceId] }),
                queryClient.invalidateQueries({ queryKey: ["tcl-devices"] }),
            ]);
            await Promise.all([
                queryClient.refetchQueries({ queryKey: ["tcl-device-state", deviceId] }),
                queryClient.refetchQueries({ queryKey: ["tcl-devices"] }),
            ]);
            toast.success("Settings updated");
        },
        onError: (error: unknown) => {
            toast.error(error instanceof Error ? error.message : "Failed to update device");
        },
    });
};

export const useRelogin = () => {
    const relogin = useTclSession((s) => s.relogin);
    return useMutation({
        mutationFn: async () => ({ connected: await relogin() }),
        onSuccess: (data) => {
            if (data.connected) toast.success("Successfully logged back into TCL Cloud!");
            else toast.error("TCL connection failed during relogin.");
        },
        onError: (error: unknown) => {
            toast.error(error instanceof Error ? error.message : "Relogin failed");
        },
    });
};

export const useBulkUpdate = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ deviceIds, properties }: { deviceIds: string[]; properties: Partial<DeviceState> }) => {
            const client = useTclSession.getState().requireClient();
            return Promise.all(deviceIds.map((deviceId) => client.setDeviceState({ deviceId, properties })));
        },
        onSuccess: async (_, { deviceIds }) => {
            await new Promise((r) => setTimeout(r, 1000));
            await Promise.all(
                deviceIds.map((id) => queryClient.invalidateQueries({ queryKey: ["tcl-device-state", id] }))
            );
            await Promise.all(
                deviceIds.map((id) => queryClient.refetchQueries({ queryKey: ["tcl-device-state", id] }))
            );
            toast.success("Bulk update successful");
        },
        onError: (error: unknown) => {
            toast.error(error instanceof Error ? error.message : "Bulk update failed");
        },
    });
};
