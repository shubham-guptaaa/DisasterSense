import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Flame, Droplet, Activity, Loader2, Search } from 'lucide-react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';

// Constants for map configuration
const MAP_CONTAINER_STYLE = {
  width: '100%',
  height: '400px',
  borderRadius: '0.75rem',
};

const DEFAULT_CENTER = {
  lat: 29.7604,  // Houston center
  lng: -95.3698,
};

const DEFAULT_ZOOM = 4;
const SELECTED_ZOOM = 8;
const SEARCH_ZOOM = 14;
const LIBRARIES = ['places'];
const MAP_OPTIONS = {
  disableDefaultUI: true,
  zoomControl: true,
  gestureHandling: 'greedy',
  mapTypeId: 'satellite',
  fullscreenControl: true,
};

const alerts = [
  { 
    type: 'Wildfire',
    icon: <Flame className="text-red-500" />,
    time: '2:45 PM',
    position: { lat: 34.0522, lng: -118.2437 },
    iconColor: 'red',
    description: 'Wildfire detected in Los Angeles, CA',
    location: 'Los Angeles, CA'
  },
  { 
    type: 'Flood',
    icon: <Droplet className="text-blue-400" />,
    time: '1:30 PM',
    position: { lat: 29.7604, lng: -95.3698 },
    iconColor: 'blue',
    description: 'Major flood in Houston, TX',
    location: 'Houston, TX'
  },
  { 
    type: 'Earthquake',
    icon: <Activity className="text-red-400" />,
    time: '12:15 AM',
    position: { lat: 37.7749, lng: -122.4194 },
    iconColor: 'yellow',
    description: 'Magnitude 4.5 earthquake in San Francisco, CA',
    location: 'San Francisco, CA'
  },
];

const MainFeed = () => {
  // Use the useJsApiLoader hook instead of LoadScript component
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });
  
  // State management
  const [map, setMap] = useState(null);
  const [searchBox, setSearchBox] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(loadError);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [showInfoWindow, setShowInfoWindow] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Try to get user location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        // Silently fall back to default center if geolocation fails
        () => {}
      );
    }
  }, []);
  
  // Update error state if loadError changes
  useEffect(() => {
    if (loadError) {
      setError("Failed to load Google Maps: " + loadError.message);
    }
  }, [loadError]);

  // Map loading handler with useCallback for better performance
  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);

  // SearchBox loading handler
  const onLoadSearchBox = useCallback((ref) => {
    setSearchBox(ref);
  }, []);

  // Map unload handler to prevent memory leaks
  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Handle search input changes
  const handleSearchInputChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  // Handle search submission
  const handleSearchSubmit = useCallback((e) => {
    e.preventDefault();
    if (!searchQuery.trim() || !isLoaded || !window.google) return;
    
    try {
      setIsSearching(true);
      setError(null);
      
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: searchQuery }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const place = results[0];
          
          // Pan to the selected location
          if (map) {
            map.panTo(place.geometry.location);
            map.setZoom(SEARCH_ZOOM);
          }
          
          setSelectedPlace({
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            name: place.formatted_address || searchQuery,
            address: place.formatted_address || ""
          });
          
          // Show InfoWindow for search results
          setShowInfoWindow(true);
          
          // Clear selected alert when searching for a place
          setSelectedAlert(null);
        } else {
          setError(`Location not found: ${status}`);
        }
        setIsSearching(false);
      });
    } catch (err) {
      setError("Failed to search location");
      console.error("Search error:", err);
      setIsSearching(false);
    }
  }, [searchQuery, isLoaded, map]);

  // Function to zoom to a specific alert
  const focusOnAlert = useCallback((alert) => {
    if (!map) return;
    
    try {
      setIsSearching(true);
      setError(null);
      setSelectedAlert(alert);
      
      // Clear selected place when focusing on an alert
      setSelectedPlace(null);
      
      map.panTo(alert.position);
      map.setZoom(SELECTED_ZOOM); // Closer zoom to see the alert area
      
      // Show InfoWindow for the alert
      setShowInfoWindow(true);
      
    } catch (err) {
      setError("Failed to focus on alert");
      console.error("Map error:", err);
    } finally {
      setIsSearching(false);
    }
  }, [map]);

  // Reset view to show all alerts
  const resetView = useCallback(() => {
    if (!map) return;
    map.panTo(DEFAULT_CENTER);
    map.setZoom(DEFAULT_ZOOM);
    setSelectedAlert(null);
    setSelectedPlace(null);
    setShowInfoWindow(false);
  }, [map]);

  // Toggle InfoWindow visibility
  const toggleInfoWindow = useCallback(() => {
    setShowInfoWindow(prev => !prev);
  }, []);

  // Memoized marker icon generator to prevent unnecessary recalculations
  const getMarkerIcon = useCallback((color, isSelected = false) => {
    return {
      path: 'M -5, 0 a 5,5 0 1,0 10,0 a 5,5 0 1,0 -10,0', // Simple circle SVG path
      fillColor: color,
      fillOpacity: 0.9,
      strokeWeight: isSelected ? 3 : 2,
      strokeColor: isSelected ? '#ffffff' : '#f8f8f8',
      scale: isSelected ? 3 : 2,
    };
  }, []);

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-[400px] bg-[#242635] rounded-xl">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <span className="ml-2">Loading Maps...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-700 bg-red-100 rounded-lg border border-red-300">
        <h4 className="mb-2 font-medium">Error loading map</h4>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {/* Live Disaster Feed Map */}
      <div className="bg-[#1a1c2c] rounded-xl p-4 lg:col-span-2">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-semibold">Live Disaster Feed</h4>
          <div className="flex space-x-2">
            {(selectedAlert || selectedPlace) && (
              <button 
                onClick={resetView}
                className="px-2 py-1 text-xs bg-[#242635] hover:bg-[#2d2f45] rounded-md transition-colors"
                aria-label="Reset map view"
              >
                View All Alerts
              </button>
            )}
            <button 
              onClick={toggleInfoWindow}
              className="px-2 py-1 text-xs bg-[#242635] hover:bg-[#2d2f45] rounded-md transition-colors"
              aria-label={showInfoWindow ? "Hide labels" : "Show labels"}
            >
              {showInfoWindow ? "Hide Labels" : "Show Labels"}
            </button>
          </div>
        </div>
        
        <div className="relative mb-4">
          {/* Search Box - Manual implementation instead of StandaloneSearchBox */}
          <div className="absolute top-2 right-2 left-2 z-10 mx-auto max-w-md">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                  {isSearching ? (
                    <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                  ) : (
                    <Search className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <input
                  type="text"
                  className="block py-2 pr-3 pl-10 w-full bg-white rounded-lg border border-gray-300 shadow-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Search location..."
                  disabled={isSearching}
                  aria-label="Search for a location"
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                />
                <button 
                  type="submit" 
                  className="flex absolute inset-y-0 right-0 items-center px-3 text-white bg-blue-500 rounded-r-lg transition-colors hover:bg-blue-600"
                  disabled={isSearching || !searchQuery.trim()}
                >
                  Go
                </button>
              </div>
            </form>
          </div>

          {error && (
            <div className="absolute right-2 left-2 top-14 z-10 p-2 mx-auto max-w-md text-sm text-white bg-red-500 bg-opacity-90 rounded-lg">
              {error}
            </div>
          )}
          
          {/* Google Map */}
          <GoogleMap
            mapContainerStyle={MAP_CONTAINER_STYLE}
            center={center}
            zoom={DEFAULT_ZOOM}
            options={MAP_OPTIONS}
            onLoad={onLoad}
            onUnmount={onUnmount}
          >
            {/* Alert markers */}
            {alerts.map((alert, index) => (
              <React.Fragment key={`alert-${index}`}>
                <Marker
                  position={alert.position}
                  icon={getMarkerIcon(alert.iconColor, selectedAlert === alert)}
                  title={alert.type}
                  onClick={() => focusOnAlert(alert)}
                  animation={selectedAlert === alert ? 1 : null} // BOUNCE animation when selected
                />
                {showInfoWindow && selectedAlert === alert && (
                  <InfoWindow
                    position={alert.position}
                    onCloseClick={() => setShowInfoWindow(false)}
                  >
                    <div className="p-1">
                      <h3 className="text-sm font-bold">{alert.type}</h3>
                      <p className="text-xs">{alert.location}</p>
                    </div>
                  </InfoWindow>
                )}
              </React.Fragment>
            ))}
            
            {/* Search result marker */}
            {selectedPlace && (
              <React.Fragment>
                <Marker
                  position={selectedPlace}
                  animation={2} // DROP animation
                  title={selectedPlace.name}
                />
                {showInfoWindow && (
                  <InfoWindow
                    position={selectedPlace}
                    onCloseClick={() => setShowInfoWindow(false)}
                  >
                    <div className="p-1">
                      <h3 className="text-sm font-bold">{selectedPlace.name}</h3>
                      {selectedPlace.address && (
                        <p className="text-xs">{selectedPlace.address}</p>
                      )}
                    </div>
                  </InfoWindow>
                )}
              </React.Fragment>
            )}
          </GoogleMap>
        </div>
        
        <ul className="space-y-3">
          {alerts.map((item, index) => (
            <li 
              key={index} 
              className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-colors ${
                selectedAlert === item 
                  ? 'bg-[#2a2c42] border border-[#3d405c]' 
                  : 'bg-[#242635] hover:bg-[#292b3d]'
              }`}
              onClick={() => focusOnAlert(item)}
            >
              {item.icon}
              <div>
                <span className="font-medium">{item.type}</span>
                <p className="mt-1 text-xs text-gray-400">{item.description}</p>
              </div>
              <span className="ml-auto text-sm text-gray-400">{item.time}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Alert Box */}
      <div className="bg-[#1a1c2c] rounded-xl p-4">
        <h4 className="mb-4 font-semibold">Alerts</h4>
        <div className="space-y-3">
          <div className="px-3 py-2 text-sm text-white bg-red-500 rounded-md">
            Major flood in Houston detected
          </div>
          
          {selectedAlert && (
            <div className="mt-4 p-3 bg-[#242635] rounded-lg">
              <h5 className="mb-2 font-medium">{selectedAlert.type} Details</h5>
              <p className="mb-2 text-sm text-gray-300">{selectedAlert.description}</p>
              <p className="mb-1 text-xs text-gray-400">Location: {selectedAlert.location}</p>
              <p className="text-xs text-gray-400">Reported at {selectedAlert.time}</p>
            </div>
          )}
          
          {/* Display search result details */}
          {selectedPlace && !selectedAlert && (
            <div className="mt-4 p-3 bg-[#242635] rounded-lg">
              <h5 className="mb-2 font-medium">Search Result</h5>
              <p className="mb-2 text-sm text-gray-300">{selectedPlace.name}</p>
              {selectedPlace.address && (
                <p className="mb-1 text-xs text-gray-400">Address: {selectedPlace.address}</p>
              )}
              <p className="text-xs text-gray-400">Coordinates: {selectedPlace.lat.toFixed(4)}, {selectedPlace.lng.toFixed(4)}</p>
            </div>
          )}
        </div>
        
        {/* Attribution notice */}
        <div className="mt-6 text-xs text-right text-gray-500">
          Map data ©{new Date().getFullYear()} Google
        </div>
      </div>
    </div>
  );
};

export default MainFeed;
