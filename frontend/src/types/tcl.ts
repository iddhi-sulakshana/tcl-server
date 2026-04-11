export interface DeviceItem {
    deviceId: string;
    deviceName: string;
    nickName: string;
    mac: string;
    category: string;
    isOnline: string;
    deviceType: string;
}

export interface DeviceState {
    powerSwitch: number; // 0: Off, 1: On
    targetTemperature: number;
    currentTemperature: number;
    windSpeed7Gear: number; // 1-7, 0 for Auto
    verticalDirection: number;
    horizontalDirection: number;
    workMode: number; // 0: Auto, 1: Cool, 2: Dry, 3: Fan, 4: Heat
    generatorMode: number; // 0: Off, 1: Gen1, 2: Gen2, 3: Gen3
    ECO: number;
    screen: number;
    sleep: number;
    beepSwitch: number;
    softWind: number;
    antiMoldew: number;
    healthy: number;
    externalUnitTemperature: number;
    externalUnitFanSpeed: number;
}

export interface DeviceWithState extends DeviceItem {
    state: DeviceState | null;
}

export interface ApiResponse<T> {
    message: string;
    status: number;
    data: T;
}

export interface TclReloginResponse {
    connected: boolean;
}
