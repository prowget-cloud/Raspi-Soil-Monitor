export enum DeviceStatus {
  Online = 'Online',
  Offline = 'Offline',
}

export enum AlertStatus {
  Active = 'Active',
  Resolved = 'Resolved',
}

export enum UserRole {
  Admin = 'Admin',
  Viewer = 'Viewer',
}

export interface Device {
  device_id: number;
  device_name: string;
  location: string;
  latitude: number;
  longitude: number;
  status: DeviceStatus;
  threshold_moisture_low?: number;
  threshold_moisture_high?: number;
  threshold_temp_low?: number;
  threshold_temp_high?: number;
  threshold_ph_low?: number;
  threshold_ph_high?: number;
  threshold_ec_low?: number;
  threshold_ec_high?: number;
  threshold_salinity_low?: number;
  threshold_salinity_high?: number;
  threshold_nitrogen_low?: number;
  threshold_nitrogen_high?: number;
  threshold_phospor_low?: number;
  threshold_phospor_high?: number;
  threshold_potassium_low?: number;
  threshold_potassium_high?: number;
}

export interface SensorData {
  timestamp: string;
  device_id: number;
  moisture_percent: number;
  temperature_celsius: number;
  ec_us_cm: number;
  salinity_mg_l: number;
  ph: number;
  nitrogen_mg_kg: number;
  phospor_mg_kg: number;
  potassium_mg_kg: number;
}

export interface User {
  user_id: number;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
}

export interface Alert {
  alert_id: number;
  device_id: number;
  alert_type: string;
  sensor_value: number;
  threshold: number;
  timestamp: string;
  status: AlertStatus;
}

export type SensorKey = keyof Omit<SensorData, 'timestamp' | 'device_id'>;