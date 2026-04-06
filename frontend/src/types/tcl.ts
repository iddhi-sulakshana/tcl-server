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
    windSpeed7Gear: number; // 1-7, 8 for Auto
    verticalWind: number;
    horizontalWind: number;
    verticalDirection: number;
    horizontalDirection: number;
    workMode: number; // 1: Cool, 2: Dry, 3: Fan, 4: Auto, 5: Heat
    generatorMode: number; // 0: Off, 1: Gen1, 2: Gen2, 3: Gen3
    AIECOSwitch: number;
    ECO: number;
    screen: number; // Display on/off
    sleep: number;
    softWind: number;
    healthy: number;
}

export interface ApiResponse<T> {
    message: string;
    status: number;
    data: T;
}

export interface TclReloginResponse {
    connected: boolean;
}
