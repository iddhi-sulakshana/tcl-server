import { z } from "zod";

export const getDeviceStateRequestSchema = z.object({
    deviceId: z.string().min(1, "Device ID is required"),
    forceRefresh: z.preprocess((val) => val === "true" || val === true, z.boolean()).optional().default(false),
});

export type GetDeviceStateRequest = z.infer<typeof getDeviceStateRequestSchema>;

export const setDeviceStateRequestSchema = z.object({
    deviceId: z.string().min(1, "Device ID is required"),
    properties: z.record(z.string(), z.any()),
});

export type SetDeviceStateRequest = z.infer<typeof setDeviceStateRequestSchema>;

export const reloginResponseSchema = z.object({
    connected: z.boolean(),
    message: z.string().optional(),
});

export type TclReloginResponse = z.infer<typeof reloginResponseSchema>;

export const tclDeviceListResponseItemSchema = z.object({
    deviceId: z.string(),
    deviceName: z.string(),
    nickName: z.string(),
    isOnline: z.string(),
    deviceType: z.string(),
    mac: z.string(),
});

export type TclDeviceListResponseItem = z.infer<typeof tclDeviceListResponseItemSchema>;

export const tclDeviceStateResponseSchema = z.object({
    powerSwitch: z.number().optional(),
    targetTemperature: z.number().optional(),
    currentTemperature: z.number().optional(),
    windSpeed7Gear: z.number().optional(),
    verticalWind: z.number().optional(),
    horizontalWind: z.number().optional(),
    workMode: z.number().optional(),
    AIECOSwitch: z.number().optional(),
    selfClean: z.number().optional(),
    screen: z.number().optional(),
    sleep: z.number().optional(),
    beepSwitch: z.number().optional(),
    softWind: z.number().optional(),
    antiMoldew: z.number().optional(),
    ECO: z.number().optional(),
    generatorMode: z.number().optional(),
    healthy: z.number().optional(),
    errorCode: z.array(z.number()).optional(),
    lastUpdated: z.number().optional(),
});

export type TclDeviceStateResponse = z.infer<typeof tclDeviceStateResponseSchema>;
