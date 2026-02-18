import { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  onClose: () => void;
}

export default function Toast({ message, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 left-4 right-4 z-50 max-w-lg mx-auto animate-slide-down">
      <div className="bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle size={20} />
          <span className="font-medium">{message}</span>
        </div>
        <button onClick={onClose} className="ml-4">
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
