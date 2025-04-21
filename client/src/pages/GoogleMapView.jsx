import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { GoogleMap, LoadScript, Marker, StandaloneSearchBox, Circle, DirectionsService, DirectionsRenderer, InfoWindow } from '@react-google-maps/api';
import { Search, Loader2, RefreshCcw, Layers, AlertTriangle, MapPin, LifeBuoy } from 'lucide-react';
import { useDisasters } from '../contexts/DisasterContext';
import { getDisasterRadius } from '../models/DisasterModel';

// Constants extracted for better maintenance
const LIBRARIES = ['places', 'directions'];
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
  mapTypeId: 'roadmap',
  mapTypeControlOptions: {
    mapTypeIds: ['roadmap', 'satellite', 'hybrid', 'terrain'],
    style: 2, // DROPDOWN_MENU
    position: 3, // TOP_RIGHT
  },
};

// Disaster type to color mapping
const DISASTER_COLORS = {
  EARTHQUAKE: '#FF5252', // Red
  FLOOD: '#2196F3',      // Blue
  FIRE: '#FF9800',       // Orange
  STORM: '#8E24AA',      // Purple
  OTHER: '#757575',      // Gray
};

// Map severity to radius in meters
const getSeverityRadius = (severity) => {
  // Scale: 1-3 (small), 4-6 (medium), 7-10 (large)
  if (severity >= 1 && severity <= 3) return 2000;  // 2km
  if (severity >= 4 && severity <= 6) return 5000;  // 5km
  return 10000; // 10km for severe disasters (7-10)
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
  const [selectedDisaster, setSelectedDisaster] = useState(null);
  const [directions, setDirections] = useState(null);
  const [isLoadingDirections, setIsLoadingDirections] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [showInfoWindow, setShowInfoWindow] = useState(false);
  const [googleApiLoaded, setGoogleApiLoaded] = useState(false);
  const mapRef = useRef(null);
  
  // Get disasters from context
  const { disasters, loading: disastersLoading, getNearbyDisasters } = useDisasters();

  // Get API key from environment variables
  const apiKey = import.meta.env.VITE_GMAP_KEY;

  // Try to get user location on component mount
  useEffect(() => {
    getUserLocation();
  }, []);

  // Fetch nearby disasters when user location changes
  useEffect(() => {
    if (userLocation && userLocation.lat && userLocation.lng) {
      fetchNearbyDisasters(userLocation.lng, userLocation.lat);
    }
  }, [userLocation]);

  // Fetch nearby disasters
  const fetchNearbyDisasters = async (longitude, latitude) => {
    try {
      // Radius: 100km to see disasters in the vicinity
      await getNearbyDisasters(longitude, latitude, 100);
    } catch (error) {
      console.error("Error fetching nearby disasters:", error);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      setIsLoadingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCenter(location);
          setUserLocation(location);
          
          if (map) {
            map.panTo(location);
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
    console.log("Map loaded successfully with ID:", map ? map.gm_bindings_ : 'No map ID');
    console.log("Google Maps API Status:", window.google && window.google.maps ? 'Loaded' : 'Not Loaded');
    setMap(map);
    mapRef.current = map;
    setGoogleApiLoaded(true);
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
      setSelectedDisaster(null);
      setDirections(null);
    }
  }, [map]);

  // Toggle map type between roadmap and satellite
  const toggleMapType = useCallback(() => {
    if (!map) return;
    
    const newType = mapType === 'roadmap' ? 'satellite' : 'roadmap';
    map.setMapTypeId(newType);
    setMapType(newType);
  }, [map, mapType]);

  // Handle disaster marker click to show details and calculate evacuation route
  const handleDisasterClick = useCallback((disaster) => {
    setSelectedDisaster(disaster);
    setShowInfoWindow(true);
    
    // If user location is available, calculate evacuation route
    if (userLocation && disaster.location && disaster.location.coordinates) {
      calculateEvacuationRoute(disaster);
    }
  }, [userLocation]);

  // Calculate evacuation route away from disaster
  const calculateEvacuationRoute = useCallback((disaster) => {
    if (!disaster.location || !disaster.location.coordinates || !userLocation || !window.google) return;
    
    setIsLoadingDirections(true);
    
    const disasterLocation = {
      lat: disaster.location.coordinates[1],
      lng: disaster.location.coordinates[0]
    };
    
    // Calculate direction vector pointing away from disaster
    const dx = userLocation.lng - disasterLocation.lng;
    const dy = userLocation.lat - disasterLocation.lat;
    
    // Normalize and scale to get a safe point (10km away in the opposite direction)
    const distance = Math.sqrt(dx * dx + dy * dy);
    const safeDistance = 10; // 10km away
    
    // Create a destination point away from disaster
    const destinationPoint = {
      lat: userLocation.lat + (dy / distance) * safeDistance,
      lng: userLocation.lng + (dx / distance) * safeDistance
    };
    
    try {
      // Set direction request
      const directionsRequest = {
        origin: userLocation,
        destination: destinationPoint,
        travelMode: window.google.maps.TravelMode.DRIVING,
        optimizeWaypoints: true,
        provideRouteAlternatives: true,
        avoidTolls: false,
        avoidHighways: false,
        avoidFerries: false,
      };
      
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(directionsRequest, (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);
        } else {
          console.error('Directions request failed:', status);
          setError('Failed to calculate evacuation route');
        }
        setIsLoadingDirections(false);
      });
    } catch (error) {
      console.error('Error calculating evacuation route:', error);
      setError('Google Maps API not fully loaded yet. Please try again.');
      setIsLoadingDirections(false);
    }
  }, [userLocation]);

  // Close info window
  const handleCloseInfoWindow = () => {
    setShowInfoWindow(false);
  };

  // Find nearest safe zone and calculate route to it
  const findSafeZone = useCallback(() => {
    if (!userLocation || !selectedDisaster || !window.google) return;
    
    setIsLoadingDirections(true);
    
    // In a real app, you would query an API for safe zones
    // For this demo, we'll create a simulated safe zone
    
    const disasterLocation = {
      lat: selectedDisaster.location.coordinates[1],
      lng: selectedDisaster.location.coordinates[0]
    };
    
    // Calculate direction vector pointing away from disaster
    const dx = userLocation.lng - disasterLocation.lng;
    const dy = userLocation.lat - disasterLocation.lat;
    
    // Normalize and get a safe point (15km away in the opposite direction)
    const distance = Math.sqrt(dx * dx + dy * dy);
    const safeDistance = 15; // 15km away
    
    const safeZone = {
      lat: userLocation.lat + (dy / distance) * safeDistance,
      lng: userLocation.lng + (dx / distance) * safeDistance
    };
    
    try {
      // Set direction request
      const directionsRequest = {
        origin: userLocation,
        destination: safeZone,
        travelMode: window.google.maps.TravelMode.DRIVING,
        optimizeWaypoints: true,
        provideRouteAlternatives: true,
      };
      
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(directionsRequest, (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);
        } else {
          console.error('Safe zone route request failed:', status);
          setError('Failed to find route to safe zone');
        }
        setIsLoadingDirections(false);
      });
    } catch (error) {
      console.error('Error finding safe zone route:', error);
      setError('Google Maps API not fully loaded yet. Please try again.');
      setIsLoadingDirections(false);
    }
  }, [userLocation, selectedDisaster]);

  // Create a marker icon based on whether the Google Maps API is loaded
  const createMarkerIcon = useCallback((type = 'default') => {
    // Always provide a safe fallback that doesn't rely on Google Maps API
    if (!googleApiLoaded || !window.google || !window.google.maps) {
      return type === 'user' 
        ? { url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png' }
        : { url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png' };
    }
    
    try {
      // For user location, create a circle icon
      if (type === 'user') {
        return {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: '#4285F4',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
          scale: 8,
        };
      }
      
      // For disaster markers, use default URL icons without Size constructor
      return {
        url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
      };
    } catch (error) {
      console.error("Error creating marker icon:", error);
      // Safe fallback if any error occurs
      return {
        url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
      };
    }
  }, [googleApiLoaded]);

  // Handle Google Maps API loading status
  useEffect(() => {
    if (window.google && window.google.maps) {
      console.log("Google Maps API loaded via window check");
      setGoogleApiLoaded(true);
    }
    
    // Listen for the API to load
    const checkGoogleMapsLoaded = () => {
      if (window.google && window.google.maps) {
        console.log("Google Maps API loaded via event listener");
        setGoogleApiLoaded(true);
      }
    };
    
    window.addEventListener('load', checkGoogleMapsLoaded);
    
    return () => {
      window.removeEventListener('load', checkGoogleMapsLoaded);
    };
  }, []);

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
          
          {/* Legend */}
          <div className="absolute top-20 left-4 z-10 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-md max-w-xs border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-bold mb-2">Disaster Types</h3>
            <div className="space-y-1 text-xs">
              <div className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                <span>Earthquake</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                <span>Flood</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-orange-500 mr-2"></span>
                <span>Fire</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-purple-500 mr-2"></span>
                <span>Storm</span>
              </div>
            </div>
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
                <MapPin className="w-5 h-5" />
              )}
            </button>
            
            {/* Find safe zone button - only show when a disaster is selected */}
            {selectedDisaster && userLocation && (
              <button
                onClick={findSafeZone}
                disabled={isLoadingDirections}
                className="p-2 bg-green-500 text-white rounded-full shadow-md transition-colors hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                aria-label="Find safe zone"
                title="Find safe zone"
              >
                {isLoadingDirections ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <LifeBuoy className="w-5 h-5" />
                )}
              </button>
            )}
            
            {/* Reset view button */}
            <button
              onClick={handleResetView}
              className="p-2 bg-white rounded-full shadow-md transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white"
              aria-label="Reset map view"
              title="Reset view"
            >
              <RefreshCcw className="w-5 h-5" />
            </button>
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
            {/* User Location Marker */}
            {userLocation && (
              <Marker
                position={userLocation}
                icon={createMarkerIcon('user')}
                title="Your Location"
              />
            )}
            
            {/* Disaster Markers and Circles */}
            {disasters?.map((disaster) => {
              if (!disaster.location || !disaster.location.coordinates) return null;
              
              const position = {
                lat: disaster.location.coordinates[1],
                lng: disaster.location.coordinates[0]
              };
              
              return (
                <React.Fragment key={disaster._id}>
                  {/* Disaster Area Circle */}
                  <Circle
                    center={position}
                    radius={getSeverityRadius(disaster.severity)}
                    options={{
                      fillColor: DISASTER_COLORS[disaster.type] || DISASTER_COLORS.OTHER,
                      fillOpacity: 0.3,
                      strokeColor: DISASTER_COLORS[disaster.type] || DISASTER_COLORS.OTHER,
                      strokeOpacity: 0.8,
                      strokeWeight: 2,
                    }}
                  />
                  
                  {/* Disaster Marker */}
                  <Marker
                    position={position}
                    onClick={() => handleDisasterClick(disaster)}
                    icon={createMarkerIcon('disaster')}
                    title={disaster.name || `${disaster.type} Disaster`}
                  />

                  {/* Info Window */}
                  {selectedDisaster && selectedDisaster._id === disaster._id && showInfoWindow && (
                    <InfoWindow
                      position={position}
                      onCloseClick={handleCloseInfoWindow}
                    >
                      <div className="max-w-xs">
                        <h3 className="font-bold text-lg">{disaster.name || `${disaster.type} Disaster`}</h3>
                        <div className="flex items-center my-1">
                          <AlertTriangle className="w-4 h-4 mr-1 text-yellow-500" />
                          <span className="font-semibold">Severity: {disaster.severity}/10</span>
                        </div>
                        <p className="text-sm mb-2">{disaster.description || `A ${disaster.type.toLowerCase()} has been detected in this area.`}</p>
                        <p className="text-sm font-semibold text-red-600">
                          {disaster.status === 'ACTIVE' ? 'Active disaster - Evacuate immediately!' : 'Caution required in this area'}
                        </p>
                        {userLocation && (
                          <button
                            onClick={findSafeZone}
                            className="mt-2 px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors w-full"
                          >
                            Find Evacuation Route
                          </button>
                        )}
                      </div>
                    </InfoWindow>
                  )}
                </React.Fragment>
              );
            })}
            
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
            
            {/* Evacuation Route */}
            {directions && googleApiLoaded && (
              <DirectionsRenderer
                options={{
                  directions: directions,
                  markerOptions: { visible: false },
                  polylineOptions: {
                    strokeColor: '#138808', // Green for evacuation
                    strokeWeight: 6,
                    strokeOpacity: 0.7,
                  },
                }}
              />
            )}
          </GoogleMap>
        </div>

        {/* Status Bar */}
        <div className="flex justify-between items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
          <div>
            {disastersLoading ? (
              <span className="flex items-center">
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Loading disaster data...
              </span>
            ) : (
              <span>Showing {disasters?.length || 0} disasters</span>
            )}
          </div>
          <div>
            Map data ©{new Date().getFullYear()} Google
          </div>
        </div>
      </LoadScript>
    </div>
  );
};

export default GoogleMapView;
