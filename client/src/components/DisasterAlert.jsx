import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, X, Navigation, MapPin } from 'lucide-react';
import { getDisasterDescription } from '../models/DisasterModel';

const DisasterAlert = ({ disaster, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();

  // Auto-close the alert after 15 seconds if not interacted with
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) setTimeout(onClose, 300); // Allow for animation
    }, 15000);

    return () => clearTimeout(timer);
  }, [onClose]);

  // Handle close
  const handleClose = () => {
    setIsVisible(false);
    if (onClose) setTimeout(onClose, 300); // Allow for animation
  };

  // Navigate to map view with this disaster focused
  const handleViewMap = () => {
    navigate('/map', { state: { focusDisaster: disaster._id } });
  };

  if (!disaster) return null;

  const description = getDisasterDescription(disaster);
  const colorClass = getAlertColorClass(disaster.type);

  return (
    <div 
      className={`fixed bottom-6 right-6 max-w-sm w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border-l-4 ${colorClass} p-4 transform transition-all duration-300 ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}
      role="alert"
    >
      <div className="flex justify-between items-start">
        <div className="flex">
          <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400 mr-3 mt-0.5" />
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-1">
              {disaster.name || `${disaster.type} Alert`}
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
              {description}
            </p>
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <MapPin className="h-3 w-3 mr-1" />
              <span>
                {disaster.location?.address || "Nearby location"}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 focus:outline-none"
          aria-label="Close alert"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <div className="mt-3 flex space-x-2">
        <button
          onClick={handleViewMap}
          className="flex items-center justify-center px-4 py-2 w-full text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <Navigation className="h-4 w-4 mr-1" />
          View Evacuation Route
        </button>
      </div>
      
      <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
        <div 
          className="bg-red-600 h-1 rounded-full animate-countdown"
          style={{
            width: '100%',
            animation: 'countdown 15s linear forwards'
          }}
        />
      </div>
    </div>
  );
};

// Get appropriate color class based on disaster type
const getAlertColorClass = (type) => {
  const colors = {
    'EARTHQUAKE': 'border-red-600',
    'FLOOD': 'border-blue-600',
    'FIRE': 'border-orange-600',
    'STORM': 'border-purple-600',
    'OTHER': 'border-gray-600'
  };
  
  return colors[type] || colors.OTHER;
};

export default DisasterAlert;

// Add to your global CSS file:
/*
@keyframes countdown {
  from { width: 100%; }
  to { width: 0%; }
}

.animate-countdown {
  animation: countdown 15s linear forwards;
}
*/ 