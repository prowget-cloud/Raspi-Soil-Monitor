import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getSensorData } from '../services/api'; // UPDATED
import { SensorData, SensorKey } from '../types';
import Card from './Card';

interface HistoricalChartProps {
  deviceId: number | undefined;
  sensorKey: SensorKey;
  sensorName: string;
  sensorUnit: string;
}

const HistoricalChart: React.FC<HistoricalChartProps> = ({ deviceId, sensorKey, sensorName, sensorUnit }) => {
  const [data, setData] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (deviceId) {
      setLoading(true);
      // Get last ~48 data points (assuming data every hour)
      getSensorData(deviceId, 48) 
        .then(res => {
          // The data is already sorted by the backend, we just need to reverse it for chronological order
          const formattedData = res.reverse().map(d => ({
            ...d,
            timestamp: new Date(d.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute:'2-digit' }),
          }));
          setData(formattedData);
        })
        .finally(() => setLoading(false));
    } else {
      setData([]);
    }
  }, [deviceId, sensorKey]);

  return (
    <Card title={`${sensorName} Trend`}>
        {loading && <div className="text-center">Loading chart...</div>}
        {!loading && data.length === 0 && <div className="text-center text-gray-500">No data available for the selected device.</div>}
        {!loading && data.length > 0 && (
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                <LineChart
                    data={data}
                    margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" fontSize={12} tickCount={6} />
                    <YAxis 
                      domain={['dataMin - 1', 'dataMax + 1']} 
                      tickFormatter={(value) => typeof value === 'number' ? value.toFixed(2) : value} 
                      fontSize={12} 
                    />
                    <Tooltip formatter={(value: number) => [`${value.toFixed(2)} ${sensorUnit}`, sensorName]} />
                    <Legend />
                    <Line type="monotone" dataKey={sensorKey} name={`${sensorName} (${sensorUnit})`} stroke="#28a745" activeDot={{ r: 8 }} />
                </LineChart>
                </ResponsiveContainer>
            </div>
        )}
    </Card>
  );
};

export default HistoricalChart;
