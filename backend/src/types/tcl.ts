import type { AxiosResponse } from "axios";

export type TclLoginResponseData = {
  status: number;
  token: string;
  refreshToken: string;
  msg: string;
  firstLogin: number;
  data: {
    loginAccount: string;
    loginType: number;
    loginCountryAbbr: string;
  }
  user: {
    countryAbbr: string;
    nickname: string;
    username: string;
    bindName: string;
    type: number;
    createTime: number;
    updateTime: number;
    headpic: string;
    email: string;
    sex: string;
    clientId: number;
    tenantId: number;
    source: number;
    platform: number;
    protocol: number;
    isprivate: number;
    region: string;
    tclid: string;
    isFirstLogin: string;
    crossRegion: boolean;
  }
}

export type TclLoginResponse = AxiosResponse<TclLoginResponseData>

export type TclCloudUrlsResponseData = {
  code: number;
  message: string;
  data: {
    sso_region: string;
    cloud_region: string;
    sso_url: string;
    cloud_url: string;
    icon_resource_url: string;
    identity_pool_id: string;
    upload_web_url: string;
    newStruct: number;
    device_url: string;
    cloud_url_emq: string
  }
}

export type TclCloudUrlsResponse = AxiosResponse<TclCloudUrlsResponseData>

export type TclRefreshTokensResponseData = {
  code: number;
  message: string;
  data: {
    saasToken: string;
    cognitoToken: string;
    cognitoId: string;
    mqttEndpoint: string;
  }
}

export type TclRefreshTokensResponse = AxiosResponse<TclRefreshTokensResponseData>

export type TclAwsCredintialsResponseData = {
  IdentityId: string;
  Credentials: {
    AccessKeyId: string;
    SecretKey: string;
    SessionToken: string;
    Expiration: number;
  }
}

export type TclAwsCredintialsResponse = AxiosResponse<TclAwsCredintialsResponseData>

export type TclDeviceListResponseData = {
  code: number;
  message: string;
  data: DeviceData[];
}

export type TclDeviceListResponse = AxiosResponse<TclDeviceListResponseData>

export type DeviceData = {
  deviceId: string;
  homeShowFlag: number;
  productKey: string;
  isControl: number;
  autoUpgrade: number;
  otaStatus: number;
  platform: string;
  nickName: string;
  deviceName: string;
  mac: string;
  headUrl: string;
  headUrlNew: string;
  category: string;
  type: number;
  masterId: string;
  locationId: string | null;
  locationName: string | null;
  isOnline: string;
  ssid: string;
  bindTime: string;
  deviceType: string;
  firmwareVersion: string;
  TSLVersion: string;
  netType: number;
  sn: string;
  entranceId: number;
  dnum: string | null;
  linkType: number;
  commercial: number;
  channelType: number;
  supportLargeCard: number;
  shortcuts: {
    identifier: string;
    type: string;
    dataType: string;
    dependence: string;
    attributes: {
      value: string;
      text: string;
      imgUrl: string;
      command: string;
    }[]
  }[]
  identifiers: {
    identifier: string;
    value: string;
  }[]
  labels: {
    labelId: number;
    labelKey: string;
    labelValue: string;
    labelType: number;
  }[]
  cardIdentifierList: {
    identifier: string;
    name: string;
    dataType: {
      specs: Record<string, string>;
      type: string;
    }
  }[]
}


export type TclDeviceShadowResponseData = {
  state: {
    desired: {
      powerSwitch: number;
      targetTemperature: number;
      currentTemperature: number;
      windSpeed7Gear: number;
      verticalWind: number;
      horizontalWind: number;
      horizontalDirection: number;
      verticalDirection: number;
      workMode: number;
      AIECOSwitch: number;
      regularReporting: number;
      selfClean: number;
      screen: number;
      targetFahrenheitTemp: number;
      temperatureType: number;
      sleep: number;
      beepSwitch: number;
      softWind: number;
      antiMoldew: number;
      generatorMode: number;
      filterBlockStatus: number;
      errorCode: number[];
      internalUnitCoilTemperature: number;
      capabilities: number[];
      PTCStatus: number;
      ECO: number;
      windSpeedPercentage: number;
      windSpeedAutoSwitch: number;
      selfCleanStatus: number;
      selfCleanPercentage: number;
      healthy: number;
      AIECOStatus: number;
      OutDoorCompTarFreqSet: number;
      OutDoorFanTarSpeed: number;
      OutDoorEEVTarOpenDegree: number;
      OutDoorCompTarFreqRun: number;
      eightAddHot: number;
      lowerTemperatureLimit: number;
      upperTemperatureLimit: number;
      highTemperatureWind: number;
      coolFeelWind: number;
      externalUnitTemperature: number;
      externalUnitFanSpeed: number;
    },
    reported: {
      powerSwitch: number;
      targetTemperature: number;
      currentTemperature: number;
      windSpeed7Gear: number;
      verticalWind: number;
      horizontalWind: number;
      horizontalDirection: number;
      verticalDirection: number;
      workMode: number;
      AIECOSwitch: number;
      regularReporting: number;
      selfClean: number;
      screen: number;
      targetFahrenheitTemp: number;
      temperatureType: number;
      sleep: number;
      beepSwitch: number;
      softWind: number;
      antiMoldew: number;
      generatorMode: number;
      filterBlockStatus: number;
      errorCode: number[];
      internalUnitCoilTemperature: number;
      capabilities: number[];
      PTCStatus: number;
      ECO: number;
      windSpeedPercentage: number;
      windSpeedAutoSwitch: number;
      selfCleanStatus: number;
      selfCleanPercentage: number;
      healthy: number;
      AIECOStatus: number;
      OutDoorCompTarFreqSet: number;
      OutDoorFanTarSpeed: number;
      OutDoorEEVTarOpenDegree: number;
      OutDoorCompTarFreqRun: number;
      eightAddHot: number;
      lowerTemperatureLimit: number;
      upperTemperatureLimit: number;
      highTemperatureWind: number;
      coolFeelWind: number;
      externalUnitTemperature: number;
      externalUnitFanSpeed: number;
    },
    metadata: {
      desired: Record<string, {
        timestamp: number;
      }>;
      reported: Record<string, {
        timestamp: number;
      }>;
    },
    version: number;
    timestamp: number;
  }
}
export type CachedDeviceData = TclDeviceShadowResponseData & { lastUpdated: number }