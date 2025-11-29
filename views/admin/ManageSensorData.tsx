import React, { useState, useEffect, useMemo } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { getSensorData } from '../../services/api'; // UPDATED
import { useData } from '../../context/DataContext';
import { SensorData } from '../../types';
import Card from '../../components/Card';

const ITEMS_PER_PAGE = 20;

const ManageSensorData: React.FC = () => {
  const { devices } = useData();
  const [data, setData] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    setCurrentPage(1); // Reset to first page on filter change
    const deviceId = selectedDevice === 'all' ? undefined : parseInt(selectedDevice);
    // Fetch last 1000 records for the selected device
    getSensorData(deviceId, 1000)
      .then(res => {
        setData(res);
      })
      .finally(() => setLoading(false));
  }, [selectedDevice]);

  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
  const currentData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return data.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [data, currentPage]);


  const handleExportCSV = () => {
    if (data.length === 0) {
      alert("No data to export.");
      return;
    }

    const headers = [
      'timestamp', 'device_id', 'moisture_percent', 'temperature_celsius', 
      'ec_us_cm', 'salinity_mg_l', 'ph', 'nitrogen_mg_kg', 'phospor_mg_kg', 'potassium_mg_kg'
    ];

    const csvRows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(fieldName => {
          const value = row[fieldName as keyof SensorData];
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value}"`;
          }
          return value;
        }).join(',')
      )
    ];

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    const fileName = `sensor_data_${selectedDevice}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    if (data.length === 0) {
      alert("No data to export.");
      return;
    }

    const doc = new jsPDF();
    const selectedDeviceName = selectedDevice === 'all' ? 'All Devices' : devices.find(d => d.device_id.toString() === selectedDevice)?.device_name || 'Unknown Device';
    
    doc.text(`Sensor Data Report - ${selectedDeviceName}`, 14, 15);
    doc.setFontSize(10);
    doc.text(`Exported on: ${new Date().toLocaleString()}`, 14, 20);

    const tableColumns = ["Timestamp", "Device ID", "Moisture (%)", "Temp (°C)", "EC (µS/cm)", "Salinity (mg/L)", "pH", "N (mg/kg)", "P (mg/kg)", "K (mg/kg)"];
    const tableRows = data.map(row => [
      new Date(row.timestamp).toLocaleString(),
      row.device_id,
      row.moisture_percent.toFixed(2),
      row.temperature_celsius.toFixed(2),
      row.ec_us_cm.toFixed(2),
      row.salinity_mg_l.toFixed(2),
      row.ph.toFixed(2),
      row.nitrogen_mg_kg.toFixed(2),
      row.phospor_mg_kg.toFixed(2),
      row.potassium_mg_kg.toFixed(2)
    ]);

    (doc as any).autoTable({
      head: [tableColumns],
      body: tableRows,
      startY: 25,
      theme: 'grid',
      styles: { fontSize: 7 },
      headStyles: { fillColor: [40, 167, 69] }, // agri-green color
    });
    
    const fileName = `sensor_data_${selectedDevice}_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(fileName);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Sensor Data History</h1>
      <Card>
        <div className="p-4 flex flex-wrap items-center justify-between gap-4 border-b">
          <div className="flex items-center space-x-4">
            <label htmlFor="device-filter" className="font-medium">Filter by device:</label>
            <select id="device-filter" value={selectedDevice} onChange={e => setSelectedDevice(e.target.value)} className="p-2 border border-gray-300 rounded-md">
              <option value="all">All Devices</option>
              {devices.map(d => (
                <option key={d.device_id} value={d.device_id}>{d.device_name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center flex-wrap gap-2">
            <button onClick={handleExportCSV} className="px-4 py-2 bg-agri-green text-white rounded-md hover:bg-agri-green-dark flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              <span>Export to CSV</span>
            </button>
            <button onClick={handleExportPDF} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2-2z" /></svg>
              <span>Export to PDF</span>
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">Timestamp</th>
                <th className="px-6 py-3">Device ID</th>
                <th className="px-6 py-3">Moisture (%)</th>
                <th className="px-6 py-3">Temp (°C)</th>
                <th className="px-6 py-3">EC (µS/cm)</th>
                <th className="px-6 py-3">Salinity (mg/L)</th>
                <th className="px-6 py-3">pH</th>
                <th className="px-6 py-3">N (mg/kg)</th>
                <th className="px-6 py-3">P (mg/kg)</th>
                <th className="px-6 py-3">K (mg/kg)</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} className="text-center p-4">Loading data...</td></tr>
              ) : currentData.length > 0 ? (
                currentData.map((row, index) => (
                  <tr key={index} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4">{new Date(row.timestamp).toLocaleString()}</td>
                    <td className="px-6 py-4">{row.device_id}</td>
                    <td className="px-6 py-4">{row.moisture_percent.toFixed(2)}</td>
                    <td className="px-6 py-4">{row.temperature_celsius.toFixed(2)}</td>
                    <td className="px-6 py-4">{row.ec_us_cm.toFixed(2)}</td>
                    <td className="px-6 py-4">{row.salinity_mg_l.toFixed(2)}</td>
                    <td className="px-6 py-4">{row.ph.toFixed(2)}</td>
                    <td className="px-6 py-4">{row.nitrogen_mg_kg.toFixed(2)}</td>
                    <td className="px-6 py-4">{row.phospor_mg_kg.toFixed(2)}</td>
                    <td className="px-6 py-4">{row.potassium_mg_kg.toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={10} className="text-center p-4">No data found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
            <div className="p-4 flex justify-between items-center border-t">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50">Previous</button>
                <span>Page {currentPage} of {totalPages}</span>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50">Next</button>
            </div>
        )}
      </Card>
    </div>
  );
};

export default ManageSensorData;