// MapComponent.jsx
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/leaflet-overrides.css";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerRetina from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Configure Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerRetina,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const LocationMarker = ({ onLocationSelect, selectedLocation }) => {
  const map = useMap();
  
  useMapEvents({
    click(e) {
      onLocationSelect([e.latlng.lat, e.latlng.lng]);
    },
  });

  useEffect(() => {
    if (selectedLocation) {
      map.flyTo(selectedLocation, map.getZoom());
    }
  }, [selectedLocation, map]);

  return selectedLocation ? (
    <Marker position={selectedLocation}>
      <Popup>Selected Location</Popup>
    </Marker>
  ) : null;
};

const CenterUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

const MapComponent = ({ 
  onLocationSelect, 
  locations = [], 
  center,
  referencePoint,
  calculateDistance,
  selectedLocation
}) => {
  const [userLocation, setUserLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setIsLoading(false);
      return;
    }

    const handleSuccess = (position) => {
      const { latitude, longitude } = position.coords;
      setUserLocation([latitude, longitude]);
      setIsLoading(false);
    };

    const handleError = (error) => {
      setError("Unable to retrieve your location");
      setIsLoading(false);
      console.error("Geolocation error:", error);
    };

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError);
  }, []);

  if (isLoading) {
    return <div className="h-full w-full flex items-center justify-center">Loading map...</div>;
  }

  if (error) {
    return <div className="h-full w-full flex items-center justify-center text-red-500">{error}</div>;
  }

  return (
    <div className="h-full w-full relative z-0">
      <MapContainer
        center={center || userLocation}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <CenterUpdater center={center || userLocation} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {userLocation && (
          <Marker position={userLocation}>
            <Popup>You are here!</Popup>
          </Marker>
        )}
        {locations.map((location) => {
          if (!location?.lat || !location?.lng) return null;
          return (
            <Marker key={location._id} position={[location.lat, location.lng]}>
              <Popup>
                <div className="space-y-1">
                  <h4 className="font-semibold">{location.name}</h4>
                  {location.phoneNumber && <p>📞 {location.phoneNumber}</p>}
                  {location.landmark && <p>📍 {location.landmark}</p>}
                  {referencePoint && (
                    <p className="text-sm text-muted-foreground">
                      {calculateDistance(
                        referencePoint.lat,
                        referencePoint.lng,
                        location.lat,
                        location.lng
                      ).toFixed(2)} km away
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
        <LocationMarker 
          onLocationSelect={onLocationSelect} 
          selectedLocation={selectedLocation}
        />
      </MapContainer>
    </div>
  );
};

MapComponent.defaultProps = {
  locations: [],
  onLocationSelect: () => {},
  calculateDistance: () => 0,
};

export default MapComponent;