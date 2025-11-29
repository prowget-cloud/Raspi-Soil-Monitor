import React from 'react';

interface SensorDisplayProps {
  name: string;
  value?: number;
  unit: string;
  icon: React.ReactNode;
}

const SensorDisplay: React.FC<SensorDisplayProps> = ({ name, value, unit, icon }) => {
  const displayValue = value !== undefined ? value.toFixed(2) : '--';
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-md flex items-center space-x-4 transition-transform transform hover:scale-105">
      <div className="bg-agri-green/10 text-agri-green p-3 rounded-full text-2xl font-bold">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{name}</p>
        <p className="text-2xl font-bold text-gray-800">
          {displayValue} <span className="text-lg font-normal text-gray-600">{unit}</span>
        </p>
      </div>
    </div>
  );
};

export default SensorDisplay;
