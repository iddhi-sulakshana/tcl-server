import ApiClient from "@/lib/ApiClient";
import type { ApiResponse, DeviceItem, DeviceState, TclReloginResponse } from "@/types/tcl";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/AuthStore";

// Login mutation
export const useLogin = () => {
    const login = useAuthStore((state) => state.login);

    return useMutation({
        mutationFn: async (credentials: { username: string; password: any }) => {
            const response = await ApiClient.post<ApiResponse<{ token: string }>>("/auth/login", credentials);
            return response.data.data;
        },
        onSuccess: (data) => {
            login(data.token);
            toast.success("Logged in successfully!");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Login failed");
        },
    });
};

// Fetch all devices
export const useDevices = () => {
    return useQuery({
        queryKey: ["tcl-devices"],
        queryFn: async () => {
            const response = await ApiClient.get<ApiResponse<DeviceItem[]>>("/tcl/devices");
            const devices = response.data.data;
            return devices.sort((a, b) => a.nickName.localeCompare(b.nickName));
        },
        refetchInterval: 60000,
    });
};

// Fetch state for a specific device
export const useDeviceState = (deviceId: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: ["tcl-device-state", deviceId],
        queryFn: async () => {
            const response = await ApiClient.get<ApiResponse<DeviceState>>(`/tcl/device-state/${deviceId}`);
            return response.data.data;
        },
        enabled: enabled && !!deviceId,
        refetchInterval: 5000, // Poll every 5s
    });
};

// Update device state
export const useUpdateDeviceState = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ deviceId, properties }: { deviceId: string; properties: Partial<DeviceState> }) => {
            const response = await ApiClient.post<ApiResponse<{ success: boolean; message: string }>>(
                `/tcl/device-state/${deviceId}`,
                { properties }
            );
            return response.data.data;
        },
        onSuccess: async (_, { deviceId }) => {
            // Wait for 1 second to allow the TCL cloud to update its shadow/state
            await new Promise((resolve) => setTimeout(resolve, 1000));
            await queryClient.invalidateQueries({ queryKey: ["tcl-device-state", deviceId] });
            await queryClient.refetchQueries({ queryKey: ["tcl-device-state", deviceId] });
            toast.success("Settings updated");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to update device");
        },
    });
};

// Manual relogin to TCL
export const useRelogin = () => {
    return useMutation({
        mutationFn: async () => {
            const response = await ApiClient.post<ApiResponse<TclReloginResponse>>("/tcl/relogin");
            return response.data.data;
        },
        onSuccess: (data) => {
            if (data.connected) {
                toast.success("Successfully logged back into TCL Cloud!");
            } else {
                toast.error("TCL connection failed during relogin.");
            }
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Relogin failed");
        },
    });
};

// Bulk update multiple devices
export const useBulkUpdate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ deviceIds, properties }: { deviceIds: string[]; properties: Partial<DeviceState> }) => {
            const promises = deviceIds.map((deviceId) =>
                ApiClient.post<ApiResponse<{ success: boolean; message: string }>>(
                    `/tcl/device-state/${deviceId}`,
                    { properties }
                )
            );
            return Promise.all(promises);
        },
        onSuccess: async (_, { deviceIds }) => {
            // Wait for 1 second to allow the TCL cloud to update its shadow/state
            await new Promise((resolve) => setTimeout(resolve, 1000));
            await Promise.all(
                deviceIds.map((id) =>
                    queryClient.invalidateQueries({ queryKey: ["tcl-device-state", id] })
                )
            );
            await Promise.all(
                deviceIds.map((id) =>
                    queryClient.refetchQueries({ queryKey: ["tcl-device-state", id] })
                )
            );
            toast.success("Bulk update successful");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Bulk update failed");
        },
    });
};
