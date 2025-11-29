import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Device, DeviceStatus } from '../../types';
import Card from '../../components/Card';
import { useToast } from '../../context/ToastContext';

const DeviceForm: React.FC<{ device?: Device; onSave: (device: Omit<Device, 'device_id'> | Device) => void; onCancel: () => void }> = ({ device, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Omit<Device, 'device_id'> | Device>(
    device || {
      device_name: '',
      location: '',
      latitude: 0,
      longitude: 0,
      status: DeviceStatus.Online,
      threshold_moisture_low: undefined,
      threshold_moisture_high: undefined,
      threshold_temp_low: undefined,
      threshold_temp_high: undefined,
      threshold_ph_low: undefined,
      threshold_ph_high: undefined,
      threshold_ec_low: undefined,
      threshold_ec_high: undefined,
      threshold_salinity_low: undefined,
      threshold_salinity_high: undefined,
      threshold_nitrogen_low: undefined,
      threshold_nitrogen_high: undefined,
      threshold_phospor_low: undefined,
      threshold_phospor_high: undefined,
      threshold_potassium_low: undefined,
      threshold_potassium_high: undefined,
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const isNumberField = [
      'latitude', 'longitude', 
      'threshold_moisture_low', 'threshold_moisture_high', 
      'threshold_temp_low', 'threshold_temp_high', 
      'threshold_ph_low', 'threshold_ph_high',
      'threshold_ec_low', 'threshold_ec_high',
      'threshold_salinity_low', 'threshold_salinity_high',
      'threshold_nitrogen_low', 'threshold_nitrogen_high',
      'threshold_phospor_low', 'threshold_phospor_high',
      'threshold_potassium_low', 'threshold_potassium_high',
    ].includes(name);

    setFormData(prev => ({ 
      ...prev, 
      [name]: isNumberField ? (value === '' ? undefined : parseFloat(value)) : value 
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card title={device ? 'Edit Device' : 'Add New Device'} className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Device Name</label>
            <input type="text" name="device_name" value={formData.device_name} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-agri-green focus:border-agri-green" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input type="text" name="location" value={formData.location} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Latitude</label>
              <input type="number" step="any" name="latitude" value={formData.latitude} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Longitude</label>
              <input type="number" step="any" name="longitude" value={formData.longitude} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3">
              <option value={DeviceStatus.Online}>Online</option>
              <option value={DeviceStatus.Offline}>Offline</option>
            </select>
          </div>
          
          <div className="pt-4 border-t mt-4">
            <h3 className="text-lg font-medium text-gray-800 mb-2">Alert Thresholds</h3>
            <p className="text-sm text-gray-500 mb-4">Set low and high thresholds to trigger alerts for this device.</p>
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {/* Moisture */}
              <div className="col-span-2 font-semibold text-gray-600">Moisture (%)</div>
              <input type="number" step="any" name="threshold_moisture_low" placeholder="Low" value={formData.threshold_moisture_low ?? ''} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
              <input type="number" step="any" name="threshold_moisture_high" placeholder="High" value={formData.threshold_moisture_high ?? ''} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />

              {/* Temperature */}
              <div className="col-span-2 font-semibold text-gray-600 mt-2">Temperature (°C)</div>
              <input type="number" step="any" name="threshold_temp_low" placeholder="Low" value={formData.threshold_temp_low ?? ''} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
              <input type="number" step="any" name="threshold_temp_high" placeholder="High" value={formData.threshold_temp_high ?? ''} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />

              {/* pH */}
              <div className="col-span-2 font-semibold text-gray-600 mt-2">pH</div>
              <input type="number" step="any" name="threshold_ph_low" placeholder="Low" value={formData.threshold_ph_low ?? ''} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
              <input type="number" step="any" name="threshold_ph_high" placeholder="High" value={formData.threshold_ph_high ?? ''} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />

              {/* EC */}
              <div className="col-span-2 font-semibold text-gray-600 mt-2">EC (µS/cm)</div>
              <input type="number" step="any" name="threshold_ec_low" placeholder="Low" value={formData.threshold_ec_low ?? ''} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
              <input type="number" step="any" name="threshold_ec_high" placeholder="High" value={formData.threshold_ec_high ?? ''} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />

              {/* Salinity */}
              <div className="col-span-2 font-semibold text-gray-600 mt-2">Salinity (mg/L)</div>
              <input type="number" step="any" name="threshold_salinity_low" placeholder="Low" value={formData.threshold_salinity_low ?? ''} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
              <input type="number" step="any" name="threshold_salinity_high" placeholder="High" value={formData.threshold_salinity_high ?? ''} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />

              {/* Nitrogen */}
              <div className="col-span-2 font-semibold text-gray-600 mt-2">Nitrogen (mg/kg)</div>
              <input type="number" step="any" name="threshold_nitrogen_low" placeholder="Low" value={formData.threshold_nitrogen_low ?? ''} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
              <input type="number" step="any" name="threshold_nitrogen_high" placeholder="High" value={formData.threshold_nitrogen_high ?? ''} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
              
              {/* Phosphorus */}
              <div className="col-span-2 font-semibold text-gray-600 mt-2">Phosphorus (mg/kg)</div>
              <input type="number" step="any" name="threshold_phospor_low" placeholder="Low" value={formData.threshold_phospor_low ?? ''} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
              <input type="number" step="any" name="threshold_phospor_high" placeholder="High" value={formData.threshold_phospor_high ?? ''} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
              
              {/* Potassium */}
              <div className="col-span-2 font-semibold text-gray-600 mt-2">Potassium (mg/kg)</div>
              <input type="number" step="any" name="threshold_potassium_low" placeholder="Low" value={formData.threshold_potassium_low ?? ''} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
              <input type="number" step="any" name="threshold_potassium_high" placeholder="High" value={formData.threshold_potassium_high ?? ''} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />

            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-agri-green text-white rounded-md hover:bg-agri-green-dark">Save</button>
          </div>
        </form>
      </Card>
    </div>
  );
};

const ManageDevices: React.FC = () => {
  const { devices, addDevice, updateDevice, deleteDevice } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | undefined>(undefined);
  const { showToast } = useToast();

  const handleSave = async (deviceData: Omit<Device, 'device_id'> | Device) => {
    try {
      if ('device_id' in deviceData) {
          await updateDevice(deviceData);
          showToast('Device updated successfully!', 'success');
      } else {
          await addDevice(deviceData);
          showToast('Device added successfully!', 'success');
      }
      setShowForm(false);
      setEditingDevice(undefined);
    } catch(error) {
      showToast('Failed to save device.', 'error');
    }
  };
  
  const handleDelete = async (id: number) => {
    if(window.confirm('Are you sure you want to delete this device? This action cannot be undone.')) {
        try {
          await deleteDevice(id);
          showToast('Device deleted successfully.', 'success');
        } catch (error) {
          showToast('Failed to delete device.', 'error');
        }
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Manage Devices</h1>
        <button onClick={() => { setEditingDevice(undefined); setShowForm(true); }} className="px-4 py-2 bg-agri-green text-white rounded-md hover:bg-agri-green-dark flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
            Add Device
        </button>
      </div>
      <Card>
        <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Location</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {devices.map(device => (
              <tr key={device.device_id} className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4">{device.device_id}</td>
                <td className="px-6 py-4 font-medium text-gray-900">{device.device_name}</td>
                <td className="px-6 py-4">{device.location}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${device.status === DeviceStatus.Online ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{device.status}</span>
                </td>
                <td className="px-6 py-4 flex space-x-2">
                  <button onClick={() => { setEditingDevice(device); setShowForm(true); }} className="text-blue-600 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(device.device_id)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </Card>
      {showForm && <DeviceForm device={editingDevice} onSave={handleSave} onCancel={() => { setShowForm(false); setEditingDevice(undefined); }} />}
    </div>
  );
};

export default ManageDevices;