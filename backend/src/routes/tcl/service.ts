import { ApiError, type DataResponse } from "@/types/api-contract";
import type {
    GetDeviceStateRequest,
    SetDeviceStateRequest,
    TclDeviceListResponseItem,
    TclDeviceStateResponse,
    TclReloginResponse,
} from "./dto";
import HTTP_STATUS from "@/types/status-codes";
import { tcl } from "@/services/tcl-instance";
import winston from "winston";

export async function getDevicesService(): Promise<
    DataResponse<TclDeviceListResponseItem[]>
> {
    try {
        const devices = await tcl.getDevicelist();
        
        const filteredDevices: TclDeviceListResponseItem[] = devices.map(device => ({
            deviceId: device.deviceId,
            deviceName: device.deviceName,
            nickName: device.nickName,
            isOnline: device.isOnline,
            deviceType: device.deviceType,
            mac: device.mac,
        }));

        return {
            message: "Device list retrieved successfully",
            status: HTTP_STATUS.OK,
            data: filteredDevices,
        };
    } catch (error: any) {
        winston.error("TCL: Get device list failed", error);
        throw new ApiError(
            error.message || "Failed to retrieve device list",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
        );
    }
}

export async function getDeviceStateService(
    payload: GetDeviceStateRequest
): Promise<DataResponse<TclDeviceStateResponse>> {
    try {
        const state = await tcl.getDeviceState({
            deviceId: payload.deviceId,
            forceRefresh: payload.forceRefresh,
        });

        if (!state) {
            throw new ApiError(
                "Failed to retrieve device state",
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }

        const reported = state.state.reported;
        const filteredState: TclDeviceStateResponse = {
            powerSwitch: reported.powerSwitch,
            targetTemperature: reported.targetTemperature,
            currentTemperature: reported.currentTemperature,
            windSpeed7Gear: reported.windSpeed7Gear,
            verticalWind: reported.verticalWind,
            horizontalWind: reported.horizontalWind,
            workMode: reported.workMode,
            AIECOSwitch: reported.AIECOSwitch,
            selfClean: reported.selfClean,
            screen: reported.screen,
            sleep: reported.sleep,
            beepSwitch: reported.beepSwitch,
            softWind: reported.softWind,
            antiMoldew: reported.antiMoldew,
            ECO: reported.ECO,
            healthy: reported.healthy,
            errorCode: reported.errorCode,
            lastUpdated: state.lastUpdated,
        };

        return {
            message: "Device state retrieved successfully",
            status: HTTP_STATUS.OK,
            data: filteredState,
        };
    } catch (error: any) {
        winston.error(`TCL: Get device state failed for ${payload.deviceId}`, error);
        throw new ApiError(
            error.message || "Failed to retrieve device state",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
        );
    }
}

export async function setDeviceStateService(
    payload: SetDeviceStateRequest
): Promise<DataResponse<{ success: boolean; message: string }>> {
    try {
        const result = await tcl.setDeviceState({
            deviceId: payload.deviceId,
            properties: payload.properties,
        });

        if (!result.success) {
            throw new ApiError(
                result.message || "Failed to set device state",
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }

        return {
            message: result.message,
            status: HTTP_STATUS.OK,
            data: {
                success: true,
                message: result.message,
            },
        };
    } catch (error: any) {
        winston.error(`TCL: Set device state failed for ${payload.deviceId}`, error);
        throw new ApiError(
            error.message || "Failed to set device state",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
        );
    }
}

export async function reloginService(): Promise<
    DataResponse<TclReloginResponse>
> {
    try {
        await tcl.relogin();
        const isConnected = tcl.isConnected();

        return {
            message: isConnected
                ? "Re-login successful"
                : "Re-login failed",
            status: isConnected
                ? HTTP_STATUS.OK
                : HTTP_STATUS.INTERNAL_SERVER_ERROR,
            data: {
                connected: isConnected,
            },
        };
    } catch (error: any) {
        winston.error("TCL: Re-login failed", error);
        throw new ApiError(
            error.message || "Failed to re-login",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
        );
    }
}
