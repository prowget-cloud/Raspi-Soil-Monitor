import React, { useState, useEffect } from 'react';
import { getAlerts, updateAlertStatus } from '../../services/api'; // UPDATED
import { Alert, AlertStatus } from '../../types';
import Card from '../../components/Card';
import { useToast } from '../../context/ToastContext';

const ManageAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchAlerts = () => {
    setLoading(true);
    getAlerts().then(setAlerts).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleResolve = async (alert: Alert) => {
    try {
      await updateAlertStatus(alert.alert_id, AlertStatus.Resolved);
      showToast(`Alert for Device #${alert.device_id} resolved.`, 'success');
      fetchAlerts();
    } catch (error) {
      showToast('Failed to resolve alert.', 'error');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Alerts</h1>
      <Card>
        <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-6 py-3">Time</th>
              <th className="px-6 py-3">Device ID</th>
              <th className="px-6 py-3">Alert Type</th>
              <th className="px-6 py-3">Value</th>
              <th className="px-6 py-3">Threshold</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
                <tr><td colSpan={7} className="text-center p-4">Loading alerts...</td></tr>
            ) : alerts.length > 0 ? (
              alerts.map(alert => (
                <tr key={alert.alert_id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4">{new Date(alert.timestamp).toLocaleString()}</td>
                  <td className="px-6 py-4">{alert.device_id}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{alert.alert_type}</td>
                  <td className="px-6 py-4">{alert.sensor_value.toFixed(2)}</td>
                  <td className="px-6 py-4">{alert.threshold.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${alert.status === AlertStatus.Active ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{alert.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    {alert.status === AlertStatus.Active && (
                      <button onClick={() => handleResolve(alert)} className="text-green-600 hover:underline">Resolve</button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
                <tr><td colSpan={7} className="text-center p-4 text-gray-500">No alerts found. Everything looks good!</td></tr>
            )}
          </tbody>
        </table>
        </div>
      </Card>
    </div>
  );
};

export default ManageAlerts;