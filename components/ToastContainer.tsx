import React from 'react';
import { useToast } from '../context/ToastContext';
import Toast from './Toast';

const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2 w-full max-w-sm">
      {toasts.map(toast => (
        <Toast key={toast.id} message={toast} onDismiss={dismissToast} />
      ))}
    </div>
  );
};

export default ToastContainer;