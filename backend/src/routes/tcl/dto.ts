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

export const tclDeviceStateResponseSchema = z.object({
    powerSwitch: z.number().optional(),
    targetTemperature: z.number().optional(),
    currentTemperature: z.number().optional(),
    windSpeed7Gear: z.number().optional(),
    verticalDirection: z.number().optional(),
    horizontalDirection: z.number().optional(),
    workMode: z.number().optional(),
    screen: z.number().optional(),
    sleep: z.number().optional(),
    beepSwitch: z.number().optional(),
    softWind: z.number().optional(),
    antiMoldew: z.number().optional(),
    ECO: z.number().optional(),
    healthy: z.number().optional(),
    externalUnitTemperature: z.number().optional(),
    externalUnitFanSpeed: z.number().optional(),
});

export type TclDeviceStateResponse = z.infer<typeof tclDeviceStateResponseSchema>;

export const tclDeviceListResponseItemSchema = z.object({
    deviceId: z.string(),
    deviceName: z.string(),
    nickName: z.string(),
    isOnline: z.string(),
    deviceType: z.string(),
    mac: z.string(),
});

export type TclDeviceListResponseItem = z.infer<typeof tclDeviceListResponseItemSchema>;

export const tclDeviceWithStateResponseSchema = tclDeviceListResponseItemSchema.extend({
    state: tclDeviceStateResponseSchema.nullable().default(null),
});

export type TclDeviceWithStateResponse = z.infer<typeof tclDeviceWithStateResponseSchema>;
