import { Device, SensorData, User, Alert, AlertStatus } from '../types';

// FIX: Resolved TypeScript errors related to `import.meta.env` by simplifying the API base URL.
// The Vite proxy handles redirecting API requests in development, so a relative path works for both development and production environments.
const API_BASE_URL = '/api';

// Helper for fetch requests
const fetchApi = async <T,>(url: string, options: RequestInit = {}): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!response.ok) {
    // Try to parse the error message from the backend
    const errorData = await response.json().catch(() => ({ error: 'API call failed' }));
    throw new Error(errorData.error || `API call failed: ${response.statusText}`);
  }
  return response.json();
};

// Devices
export const getDevices = () => fetchApi<Device[]>('/devices');
export const addDevice = (device: Omit<Device, 'device_id'>) => fetchApi<Device>('/devices', {
  method: 'POST',
  body: JSON.stringify(device),
});
export const updateDevice = (device: Device) => fetchApi<Device>(`/devices/${device.device_id}`, {
  method: 'PUT',
  body: JSON.stringify(device),
});
export const deleteDevice = (id: number) => fetchApi<{ success: boolean }>(`/devices/${id}`, {
  method: 'DELETE',
});

// Sensor Data
export const getSensorData = (deviceId?: number, limit: number = 100) => {
  const params = new URLSearchParams();
  if (deviceId) params.append('deviceId', deviceId.toString());
  if (limit) params.append('limit', limit.toString());
  return fetchApi<SensorData[]>(`/sensor-data?${params.toString()}`);
};

// This function is for the IoT device to call, not typically used in the frontend.
export const addSensorData = (data: SensorData) => fetchApi<SensorData>('/sensor-data', {
    method: 'POST',
    body: JSON.stringify(data),
});

// Users
export const getUsers = () => fetchApi<User[]>('/users');
export const addUser = (user: Partial<User>) => fetchApi<User>('/users', {
  method: 'POST',
  body: JSON.stringify(user),
});
export const updateUser = (user: Partial<User>) => fetchApi<User>(`/users/${user.user_id}`, {
  method: 'PUT',
  body: JSON.stringify(user),
});
export const deleteUser = (id: number) => fetchApi<{ message: string }>(`/users/${id}`, {
  method: 'DELETE',
});


// Alerts
export const getAlerts = () => fetchApi<Alert[]>('/alerts');
export const updateAlertStatus = (id: number, status: AlertStatus) => fetchApi<Alert>(`/alerts/${id}`, {
  method: 'PUT',
  body: JSON.stringify({ status }),
});
