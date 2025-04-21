import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, StandaloneSearchBox } from '@react-google-maps/api';
import { Search, Loader2, RefreshCcw, Layers } from 'lucide-react';

// Constants extracted for better maintenance
const LIBRARIES = ['places'];
const DEFAULT_CENTER = {
  lat: 20.5937,  // More central world view
  lng: 78.9629,
};
const DEFAULT_ZOOM = 3;
const SELECTED_ZOOM = 14;
const MAP_CONTAINER_STYLE = {
  width: '100%',
  height: 'calc(100vh - 9rem)',
  borderRadius: '0.75rem',
};
const MAP_OPTIONS = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: true,
  streetViewControl: true,
  fullscreenControl: true,
  gestureHandling: 'greedy',
  mapTypeId: 'roadmap', // Changed from satellite to roadmap for better initial view
  mapTypeControlOptions: {
    mapTypeIds: ['roadmap', 'satellite', 'hybrid', 'terrain'],
    style: 2, // DROPDOWN_MENU
    position: 3, // TOP_RIGHT
  },
};

const GoogleMapView = () => {
  // State management
  const [map, setMap] = useState(null);
  const [searchBox, setSearchBox] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [mapType, setMapType] = useState('roadmap');

  // Get API key from environment variables
  const apiKey = import.meta.env.VITE_GMAP_KEY;

  // Try to get user location on component mount
  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      setIsLoadingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCenter(userLocation);
          if (map) {
            map.panTo(userLocation);
            map.setZoom(12); // Zoom in closer to user location
          }
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setIsLoadingLocation(false);
        },
        { 
          timeout: 10000, 
          enableHighAccuracy: true 
        }
      );
    }
  };

  // Memoize libraries array to prevent unnecessary re-renders
  const libraries = useMemo(() => LIBRARIES, []);

  // Map loading handler
  const onLoad = useCallback((map) => {
    console.log("Map loaded successfully");
    setMap(map);
  }, []);

  // SearchBox loading handler
  const onLoadSearchBox = useCallback((ref) => {
    setSearchBox(ref);
  }, []);

  // Unload handlers to prevent memory leaks
  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const onUnmountSearchBox = useCallback(() => {
    setSearchBox(null);
  }, []);

  // Places changed handler with error handling
  const onPlacesChanged = useCallback(() => {
    if (!searchBox) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const places = searchBox.getPlaces();
      if (!places || places.length === 0) {
        setIsLoading(false);
        return;
      }

      const place = places[0];
      if (!place.geometry || !place.geometry.location) {
        setError("Location details not found");
        setIsLoading(false);
        return;
      }

      // Pan to the selected location
      if (map) {
        map.panTo(place.geometry.location);
        map.setZoom(SELECTED_ZOOM);
      }

      setSelectedPlace({
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        name: place.name || "Selected Location"
      });
    } catch (err) {
      setError("Failed to search location");
      console.error("Search error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [searchBox, map]);

  // Reset map to default view
  const handleResetView = useCallback(() => {
    if (map) {
      map.panTo(DEFAULT_CENTER);
      map.setZoom(DEFAULT_ZOOM);
      setSelectedPlace(null);
    }
  }, [map]);

  // Toggle map type between roadmap and satellite
  const toggleMapType = useCallback(() => {
    if (!map) return;
    
    const newType = mapType === 'roadmap' ? 'satellite' : 'roadmap';
    map.setMapTypeId(newType);
    setMapType(newType);
  }, [map, mapType]);

  // Check if API key exists
  if (!apiKey) {
    return (
      <div className="p-8 text-center">
        <h1 className="mb-4 text-xl font-bold text-red-600">Map Configuration Error</h1>
        <p>Google Maps API key is missing. Please check your environment variables.</p>
        <p className="mt-4 text-sm">Make sure VITE_GMAP_KEY is set in your .env file.</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 sm:px-6 md:px-8">
      <h1 className="mb-4 text-xl font-bold sm:text-2xl">Disaster Map View</h1>
      
      <LoadScript 
        googleMapsApiKey={apiKey}
        libraries={libraries}
        loadingElement={
          <div className="flex justify-center items-center h-[50vh] sm:h-[60vh] md:h-[70vh] rounded-lg bg-gray-100 dark:bg-gray-800">
            <div className="text-center">
              <Loader2 className="mx-auto w-10 h-10 text-blue-500 animate-spin" />
              <span className="block mt-2">Loading Google Maps...</span>
            </div>
          </div>
        }
      >
        <div className="overflow-hidden relative rounded-lg border border-gray-200 shadow-md dark:border-gray-700">
          {/* Search Box */}
          <div className="absolute top-4 right-4 left-4 z-10 mx-auto max-w-md">
            <StandaloneSearchBox
              onLoad={onLoadSearchBox}
              onUnmount={onUnmountSearchBox}
              onPlacesChanged={onPlacesChanged}
            >
              <div className="relative">
                <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                  ) : (
                    <Search className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <input
                  type="text"
                  className="block py-2 pr-3 pl-10 w-full text-gray-900 bg-white rounded-lg border border-gray-300 shadow-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-gray-300"
                  placeholder="Search location..."
                  disabled={isLoading}
                  aria-label="Search for a location"
                />
              </div>
            </StandaloneSearchBox>
            
            {/* Error message */}
            {error && (
              <div className="p-2 mt-2 text-sm text-red-700 bg-red-100 rounded-lg border border-red-300 dark:bg-red-900 dark:border-red-700 dark:text-red-100">
                {error}
              </div>
            )}
          </div>
          
          {/* Control buttons */}
          <div className="flex absolute right-4 bottom-4 z-10 flex-col gap-2">
            {/* Map type toggle button */}
            <button
              onClick={toggleMapType}
              className="p-2 bg-white rounded-full shadow-md transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white"
              aria-label={`Switch to ${mapType === 'roadmap' ? 'satellite' : 'roadmap'} view`}
              title={`Switch to ${mapType === 'roadmap' ? 'satellite' : 'roadmap'} view`}
            >
              <Layers className="w-5 h-5" />
            </button>
            
            {/* My location button */}
            <button
              onClick={getUserLocation}
              disabled={isLoadingLocation}
              className="p-2 bg-white rounded-full shadow-md transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white"
              aria-label="Get my location"
              title="Get my location"
            >
              {isLoadingLocation ? (
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.94 11A8 8 0 0 0 12 4.52"></path>
                  <path d="M12 4.52A8 8 0 0 0 4.06 11"></path>
                  <path d="M4.06 13A8 8 0 0 0 12 19.48"></path>
                  <path d="M12 19.48A8 8 0 0 0 19.94 13"></path>
                </svg>
              )}
            </button>
            
            {/* Reset view button - only show when a place is selected */}
            {selectedPlace && (
              <button
                onClick={handleResetView}
                className="p-2 bg-white rounded-full shadow-md transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white"
                aria-label="Reset map view"
                title="Reset view"
              >
                <RefreshCcw className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Google Map Component */}
          <GoogleMap
            mapContainerStyle={MAP_CONTAINER_STYLE}
            center={center}
            zoom={DEFAULT_ZOOM}
            options={MAP_OPTIONS}
            onLoad={onLoad}
            onUnmount={onUnmount}
          >
            {/* Selected Place Marker */}
            {selectedPlace && (
              <Marker
                position={selectedPlace}
                animation={2} // DROP animation
                title={selectedPlace.name}
                label={{
                  text: selectedPlace.name.substring(0, 1),
                  color: "white",
                  fontWeight: "bold"
                }}
              />
            )}
          </GoogleMap>
        </div>

        {/* Attribution - important for Google Maps terms of service */}
        <div className="mt-2 text-xs text-right text-gray-500 dark:text-gray-400">
          Map data ©{new Date().getFullYear()} Google
        </div>
      </LoadScript>
    </div>
  );
};

export default GoogleMapView;
