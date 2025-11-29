import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { Device, SensorData } from '../types';
import * as api from '../services/api';
import { useToast } from './ToastContext';

interface DataContextType {
  devices: Device[];
  latestSensorData: Map<number, SensorData>;
  loading: boolean;
  refreshAllData: () => void;
  updateDevice: (device: Device) => Promise<void>;
  addDevice: (device: Omit<Device, 'device_id'>) => Promise<void>;
  deleteDevice: (id: number) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [latestSensorData, setLatestSensorData] = useState<Map<number, SensorData>>(new Map());
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const devicesData = await api.getDevices();
      setDevices(devicesData);

      // Fetch the single latest data point for each online device
      const sensorDataPromises = devicesData
        .filter(d => d.status === 'Online')
        .map(d => api.getSensorData(d.device_id, 1).then(data => ({ deviceId: d.device_id, data: data[0] })));
      
      const sensorResults = await Promise.all(sensorDataPromises);
      
      const newSensorDataMap = new Map<number, SensorData>();
      sensorResults.forEach(result => {
        if (result.data) {
          newSensorDataMap.set(result.deviceId, result.data);
        }
      });
      setLatestSensorData(newSensorDataMap);

    } catch (error) {
      const baseMessage = 'Failed to fetch data from the server.';
      console.error(baseMessage, error);
      // Check for a common network error when the backend is down
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
          showToast(`${baseMessage} Is the backend server running?`, 'error');
          console.error("Hint: Make sure the backend server is running. You can start it by navigating to the 'backend' directory and running 'npm run dev'.");
      } else {
          showToast(baseMessage, 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);
  
  const updateDevice = async (device: Device) => {
    await api.updateDevice(device);
    fetchAllData();
  }
  
  const addDevice = async (device: Omit<Device, 'device_id'>) => {
    await api.addDevice(device);
    fetchAllData();
  }

  const deleteDevice = async (id: number) => {
    await api.deleteDevice(id);
    fetchAllData();
  }

  return (
    <DataContext.Provider value={{ devices, latestSensorData, loading, refreshAllData: fetchAllData, updateDevice, addDevice, deleteDevice }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};