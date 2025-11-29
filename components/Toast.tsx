import React, { useEffect, useState } from 'react';
import { ToastMessage } from '../context/ToastContext';

interface ToastProps {
  message: ToastMessage;
  onDismiss: (id: number) => void;
}

const Toast: React.FC<ToastProps> = ({ message, onDismiss }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Animate in
    setVisible(true);

    const timer = setTimeout(() => {
      handleDismiss();
    }, 5000); // Auto-dismiss after 5 seconds

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    // Allow time for fade-out animation before removing from DOM
    setTimeout(() => onDismiss(message.id), 300);
  };

  const baseClasses = 'w-full max-w-sm p-4 rounded-lg shadow-lg flex items-center space-x-4 transition-all duration-300 ease-in-out';
  const typeClasses = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
  };
  const visibilityClasses = visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4';

  const icon = {
    success: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    error: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  };

  return (
    <div className={`${baseClasses} ${typeClasses[message.type]} ${visibilityClasses}`}>
      <div className="flex-shrink-0">{icon[message.type]}</div>
      <div className="flex-grow text-sm font-medium">{message.text}</div>
      <button onClick={handleDismiss} className="p-1 rounded-full hover:bg-black/20 focus:outline-none">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </div>
  );
};

export default Toast;