import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { getAlerts, getSensorData } from '../../services/api'; // UPDATED
import { Alert, AlertStatus, DeviceStatus, SensorData } from '../../types';
import Card from '../../components/Card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
  <Card>
    <div className="flex items-center space-x-4">
      <div className="text-agri-green bg-agri-green/10 p-3 rounded-full">{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  </Card>
);

const AdminOverview: React.FC = () => {
  const { devices, loading: devicesLoading } = useData();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [sensorTrend, setSensorTrend] = useState<any[]>([]);

  useEffect(() => {
    getAlerts().then(setAlerts);
    // Get last 24 data points for the trend
    getSensorData(undefined, 24).then(data => {
        const formattedData = data.reverse().map(d => ({
            ...d,
            timestamp: new Date(d.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute:'2-digit' }),
          }));
        setSensorTrend(formattedData);
    });
  }, []);

  const totalDevices = devices.length;
  const onlineDevices = devices.filter(d => d.status === DeviceStatus.Online).length;
  const offlineDevices = totalDevices - onlineDevices;
  const activeAlerts = alerts.filter(a => a.status === AlertStatus.Active).length;

  if (devicesLoading) return <div>Loading overview...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Devices" value={totalDevices} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>} />
        <StatCard title="Devices Online" value={onlineDevices} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071a7.5 7.5 0 0110.606 0" /></svg>} />
        <StatCard title="Devices Offline" value={offlineDevices} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m-12.728 0a9 9 0 010-12.728m12.728 0L5.636 18.364" /></svg>} />
        <StatCard title="Active Alerts" value={activeAlerts} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>} />
      </div>

      <Card title="Sensor Trend (Recent Data)">
        <div style={{ width: '100%', height: 350 }}>
          <ResponsiveContainer>
            <LineChart data={sensorTrend}>
              <XAxis dataKey="timestamp" fontSize={12} />
              <YAxis fontSize={12} tickFormatter={(value) => typeof value === 'number' ? value.toFixed(2) : value} />
              <Tooltip formatter={(value: number, name: string) => [`${value.toFixed(2)}`, name]} />
              <Legend />
              <Line type="monotone" dataKey="temperature_celsius" name="Temperature (°C)" stroke="#ef4444" dot={false} />
              <Line type="monotone" dataKey="moisture_percent" name="Moisture (%)" stroke="#3b82f6" dot={false} />
              <Line type="monotone" dataKey="ph" name="pH" stroke="#eab308" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default AdminOverview;
