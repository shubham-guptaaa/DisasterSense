import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, StandaloneSearchBox } from '@react-google-maps/api';
import { Search, Loader2 } from 'lucide-react';

// Constants extracted for better maintenance
const LIBRARIES = ['places'];
const DEFAULT_CENTER = {
  lat: 22.9734,  // Center of India
  lng: 78.6569,
};
const DEFAULT_ZOOM = 5;
const SELECTED_ZOOM = 14;
const MAP_CONTAINER_STYLE = {
  width: '100%',
  height: '75vh',
  borderRadius: '1rem',
};
const MAP_OPTIONS = {
  disableDefaultUI: true,
  zoomControl: true,
  gestureHandling: 'greedy',
  mapTypeId: 'satellite',
  fullscreenControl: true,
};

const GoogleMapView = () => {
  // State management
  const [map, setMap] = useState(null);
  const [searchBox, setSearchBox] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [center, setCenter] = useState(DEFAULT_CENTER);

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

  // Memoize libraries array to prevent unnecessary re-renders
  const libraries = useMemo(() => LIBRARIES, []);

  // Map loading handler
  const onLoad = useCallback((map) => {
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
      map.panTo(center);
      map.setZoom(DEFAULT_ZOOM);
      setSelectedPlace(null);
    }
  }, [map, center]);

  return (
    <LoadScript 
      googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
      libraries={libraries}
      loadingElement={
        <div className="flex justify-center items-center h-75vh">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <span className="ml-2">Loading Maps...</span>
        </div>
      }
    >
      <div className="relative">
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
                className="block py-2 pr-3 pl-10 w-full bg-white rounded-lg border border-gray-300 shadow-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Search location..."
                disabled={isLoading}
                aria-label="Search for a location"
              />
            </div>
          </StandaloneSearchBox>
          
          {/* Error message */}
          {error && (
            <div className="p-2 mt-2 text-sm text-red-700 bg-red-100 rounded-lg border border-red-300">
              {error}
            </div>
          )}
          
          {/* Reset button - only show when a place is selected */}
          {selectedPlace && (
            <button
              onClick={handleResetView}
              className="px-3 py-1 mt-2 text-sm bg-white rounded-lg border border-gray-300 shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              aria-label="Reset map view"
            >
              Reset View
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
            />
          )}
        </GoogleMap>
      </div>

      {/* Attribution - important for Google Maps terms of service */}
      <div className="mt-2 text-xs text-right text-gray-500">
        Map data ©{new Date().getFullYear()} Google
      </div>
    </LoadScript>
  );
};

export default GoogleMapView;
