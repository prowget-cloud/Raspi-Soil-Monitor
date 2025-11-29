import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Device, DeviceStatus } from '../types';

interface DeviceMapProps {
  devices: Device[];
  onSelectDevice: (device: Device) => void;
  selectedDevice: Device | null;
}

const DeviceMap: React.FC<DeviceMapProps> = ({ devices, onSelectDevice, selectedDevice }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<number, L.Marker>>(new Map());

  // Initialize map
  useEffect(() => {
    if (mapRef.current && !mapInstance.current) {
      mapInstance.current = L.map(mapRef.current, {
        scrollWheelZoom: false
      }).setView([-2.5489, 118.0149], 5); // Center on Indonesia

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstance.current);
    }
  }, []); // Run only once

  // Update markers
  useEffect(() => {
    if (!mapInstance.current) return;
    const map = mapInstance.current;

    const createIcon = (color: string) => L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: ${color};" class="marker-pin"></div><div style="background-color: ${color};" class="marker-pulse"></div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30]
    });

    const onlineIcon = createIcon('#28a745');
    const offlineIcon = createIcon('#dc3545');

    devices.forEach(device => {
      const existingMarker = markersRef.current.get(device.device_id);
      const icon = device.status === DeviceStatus.Online ? onlineIcon : offlineIcon;

      if (existingMarker) {
        existingMarker.setLatLng([device.latitude, device.longitude]);
        existingMarker.setIcon(icon);
      } else {
        const newMarker = L.marker([device.latitude, device.longitude], { icon })
          .addTo(map)
          .bindPopup(`<b>${device.device_name}</b><br>${device.location}`)
          .on('click', () => onSelectDevice(device));
        markersRef.current.set(device.device_id, newMarker);
      }
    });

    // Cleanup old markers if any devices were removed
    const deviceIds = new Set(devices.map(d => d.device_id));
    markersRef.current.forEach((marker, deviceId) => {
      if (!deviceIds.has(deviceId)) {
        map.removeLayer(marker);
        markersRef.current.delete(deviceId);
      }
    });

  }, [devices, onSelectDevice]);

  // Pan to selected device
  useEffect(() => {
    if (mapInstance.current && selectedDevice) {
      mapInstance.current.flyTo([selectedDevice.latitude, selectedDevice.longitude], 10);
      const marker = markersRef.current.get(selectedDevice.device_id);
      // Open popup after a short delay to ensure the flyTo animation is smooth
      setTimeout(() => {
        marker?.openPopup();
      }, 500);
    }
  }, [selectedDevice]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md w-full h-full flex flex-col">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Device Locations</h3>
        <style>{`
            .marker-pin {
                width: 20px;
                height: 20px;
                border-radius: 50%;
                border: 2px solid white;
                box-shadow: 0 0 5px rgba(0,0,0,0.5);
                position: absolute;
                top: 5px;
                left: 5px;
                z-index: 1;
            }
            .marker-pulse {
                width: 30px;
                height: 30px;
                border-radius: 50%;
                position: absolute;
                top: 0;
                left: 0;
                opacity: 0.7;
                animation: pulse 2s infinite;
            }
            @keyframes pulse {
                0% {
                    transform: scale(0.95);
                    box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.7);
                }
                70% {
                    transform: scale(1);
                    box-shadow: 0 0 0 10px rgba(0, 0, 0, 0);
                }
                100% {
                    transform: scale(0.95);
                    box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
                }
            }
        `}</style>
        <div ref={mapRef} className="w-full flex-grow min-h-[450px] rounded-md" />
    </div>
  );
};

export default DeviceMap;