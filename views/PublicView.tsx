import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import SensorDisplay from '../components/SensorDisplay';
import DeviceMap from '../components/DeviceMap';
import HistoricalChart from '../components/HistoricalChart';
import { Device, SensorKey } from '../types';

// FIX: Replace JSX.Element with React.ReactNode to resolve namespace error.
const sensorKeys: { key: SensorKey; name: string; unit: string; icon: React.ReactNode }[] = [
    { key: 'moisture_percent', name: 'Soil Moisture', unit: '%', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
    { key: 'temperature_celsius', name: 'Soil Temperature', unit: '°C', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v10a4 4 0 108 0v-2a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a4 4 0 00-4 4z" /></svg> },
    { key: 'ph', name: 'Soil pH', unit: '', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547a2 2 0 00-.547 1.806l.477 2.387a6 6 0 00.517 3.86l.158.318a6 6 0 00.517 3.86l2.387.477a2 2 0 001.806-.547a2 2 0 00.547-1.806l-.477-2.387a6 6 0 00-.517-3.86l-.158-.318a6 6 0 00-.517-3.86l-2.387-.477a2 2 0 00-1.806.547" /></svg> },
    { key: 'ec_us_cm', name: 'EC', unit: 'µS/cm', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> },
    { key: 'salinity_mg_l', name: 'Salinity', unit: 'mg/L', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6.5 2H20v2.5A2.5 2.5 0 0117.5 7H4" /></svg> },
    { key: 'nitrogen_mg_kg', name: 'Nitrogen (N)', unit: 'mg/kg', icon: <span>N</span> },
    { key: 'phospor_mg_kg', name: 'Phosphorus (P)', unit: 'mg/kg', icon: <span>P</span> },
    { key: 'potassium_mg_kg', name: 'Potassium (K)', unit: 'mg/kg', icon: <span>K</span> },
];

const PublicView: React.FC = () => {
  const { devices, latestSensorData, loading } = useData();
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  const activeDevice = selectedDevice || devices.find(d => d.status === 'Online') || null;

  if (loading) {
    return <div className="text-center p-8">Loading data...</div>;
  }
  
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Real-time Monitoring</h1>
        <p className="text-gray-600">Live sensor data from active agricultural devices.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
            <DeviceMap devices={devices} onSelectDevice={setSelectedDevice} selectedDevice={activeDevice} />
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Device Selection</h2>
            <select
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-agri-green"
                value={activeDevice?.device_id || ''}
                onChange={(e) => {
                    const device = devices.find(d => d.device_id === parseInt(e.target.value));
                    setSelectedDevice(device || null);
                }}
            >
                {devices.map(device => (
                    <option key={device.device_id} value={device.device_id}>{device.device_name} - {device.location}</option>
                ))}
            </select>
            {activeDevice && (
                <div className="mt-4 text-sm text-gray-600 space-y-2">
                    <p><span className="font-semibold">ID:</span> {activeDevice.device_id}</p>
                    <p><span className="font-semibold">Location:</span> {activeDevice.location}</p>
                    <p><span className="font-semibold">Status:</span> 
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${activeDevice.status === 'Online' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {activeDevice.status}
                        </span>
                    </p>
                </div>
            )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
        {sensorKeys.map(({ key, name, unit, icon }) => (
            <SensorDisplay
                key={key}
                name={name}
                value={activeDevice ? latestSensorData.get(activeDevice.device_id)?.[key] : undefined}
                unit={unit}
                icon={icon}
            />
        ))}
      </div>
      
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Historical Data</h2>
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sensorKeys.map(({key, name, unit}) => (
                <HistoricalChart key={key} deviceId={activeDevice?.device_id} sensorKey={key} sensorName={name} sensorUnit={unit} />
            ))}
        </div>
      </div>
    </div>
  );
};

export default PublicView;