import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, MapPin, Search } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import MapComponent from "../components/MapComponent";
import ErrorBoundary from "../components/ErrorBoundary";

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const reverseGeocode = async (lat, lon) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
    );
    const data = await response.json();
    return data.display_name || "Selected location";
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return "Selected location";
  }
};

export default function PadLocator() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isAddLocationModalOpen, setIsAddLocationModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedLocationAddress, setSelectedLocationAddress] = useState("");
  const [selectedReferencePoint, setSelectedReferencePoint] = useState(null);
  const [storeName, setStoreName] = useState("");
  const [storePhone, setStorePhone] = useState("");
  const [storeLandmark, setStoreLandmark] = useState("");
  const [locations, setLocations] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mapCenter, setMapCenter] = useState(null);
  const [locationSearch, setLocationSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const fetchLocations = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/shewell/locations");
      if (!response.ok) throw new Error("Failed to fetch locations");
      const data = await response.json();
      setLocations(data.filter(loc => loc?.lat && loc?.lng && !isNaN(loc.lat) && !isNaN(loc.lng)));
    } catch (error) {
      console.error("Error fetching locations:", error);
      alert("Failed to load locations. Please try again.");
    }
  };

  useEffect(() => { fetchLocations(); }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();
      if (data.length > 0) {
        const newCenter = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        setMapCenter(newCenter);
        setCurrentLocation({ lat: newCenter[0], lng: newCenter[1] });
      } else {
        alert("Location not found!");
      }
    } catch (error) {
      console.error("Search error:", error);
      alert("Error searching for location");
    }
  };

  const handleLocationSearch = async () => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationSearch)}`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Location search error:", error);
      alert("Error searching for location");
    }
  };

  const handleMapLocationSelect = async (coords) => {
    setSelectedLocation(coords);
    const address = await reverseGeocode(coords[0], coords[1]);
    setSelectedLocationAddress(address);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
          setCurrentLocation(coords);
          setMapCenter([coords.lat, coords.lng]);
          const address = await reverseGeocode(coords.lat, coords.lng);
          setSelectedLocationAddress(address);
          setSelectedLocation([coords.lat, coords.lng]);
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Please enable location permissions.");
        }
      );
    } else {
      alert("Geolocation is not supported.");
    }
  };

  const handleAddLocation = async () => {
    if (!storeName?.trim() || !selectedLocation) {
      alert("Please enter valid store name and select location.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("http://localhost:3001/api/shewell/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: storeName.trim(),
          phoneNumber: storePhone.trim(),
          landmark: storeLandmark.trim(),
          lat: selectedLocation[0],
          lng: selectedLocation[1],
        }),
      });

      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.message || "Failed to save location");

      const validatedData = {
        ...responseData,
        lat: Number(responseData.lat),
        lng: Number(responseData.lng),
      };

      if (!validatedData._id || isNaN(validatedData.lat) || isNaN(validatedData.lng)) {
        throw new Error("Received invalid location data from server");
      }

      setLocations(prev => [...prev, validatedData]);
      alert("Location added successfully!");
      resetForm();
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStoreName("");
    setStorePhone("");
    setStoreLandmark("");
    setSelectedLocation(null);
    setSelectedLocationAddress("");
    setLocationSearch("");
    setSearchResults([]);
    setIsAddLocationModalOpen(false);
  };

  return (
    <div className="flex min-h-screen flex-col items-center">
      <main className="flex-1 py-8">
        <div className="container">
          <div className="flex items-center gap-2 mb-6">
            <Link to="/">
              <Button variant="outline" size="icon" asChild>
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Free Pad Shop Locator</h1>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Find Nearby Locations</CardTitle>
                <CardDescription>Locate free menstrual products near you</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Enter location or zip code"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Button type="submit" size="icon">
                      <Search className="h-4 w-4" />
                      <span className="sr-only">Search</span>
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={getCurrentLocation}
                  >
                    Use Current Location
                  </Button>
                </form>

                <div className="mt-6 space-y-4">
                  <h3 className="font-medium">Nearby Locations</h3>
                  {locations.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No locations found. Be the first to add one!</p>
                  ) : (
                    locations.map((location) => {
                      const referencePoint = selectedReferencePoint || currentLocation;
                      return (
                        <div key={location._id} className="flex items-start space-x-2 p-3 rounded-md border">
                          <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-medium">{location.name}</h4>
                            {location.phoneNumber && <p className="text-sm">Phone: {location.phoneNumber}</p>}
                            {location.landmark && <p className="text-sm">Landmark: {location.landmark}</p>}
                            {referencePoint && (
                              <p className="text-sm">
                                {calculateDistance(
                                  referencePoint.lat,
                                  referencePoint.lng,
                                  location.lat,
                                  location.lng
                                ).toFixed(2)} km away
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Map</CardTitle>
                <CardDescription>Visual representation of nearby locations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted rounded-md">
                  <ErrorBoundary>
                    <MapComponent
                      onLocationSelect={(coords) => setSelectedReferencePoint({ lat: coords[0], lng: coords[1] })}
                      locations={locations}
                      center={mapCenter}
                      referencePoint={selectedReferencePoint || currentLocation}
                      calculateDistance={calculateDistance}
                    />
                  </ErrorBoundary>
                </div>

                <div className="mt-6">
                  <h3 className="font-medium mb-2">About This Service</h3>
                  <p className="text-sm text-muted-foreground">
                    Our pad locator helps you find the nearest locations offering free menstrual products.
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      className="text-sm"
                      onClick={() => setIsAddLocationModalOpen(true)}
                    >
                      Add a Location
                    </Button>
                    <Button variant="outline" className="text-sm">
                      Report an Issue
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {isAddLocationModalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add NGO Location</h2>
            <div className="space-y-4">
              <Input
                placeholder="Store Name *"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                disabled={isSubmitting}
              />
              <Input
                placeholder="Phone Number"
                value={storePhone}
                onChange={(e) => setStorePhone(e.target.value)}
                disabled={isSubmitting}
              />
              <Input
                placeholder="Nearby Landmark"
                value={storeLandmark}
                onChange={(e) => setStoreLandmark(e.target.value)}
                disabled={isSubmitting}
              />
              
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search location"
                    value={locationSearch}
                    onChange={(e) => setLocationSearch(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleLocationSearch()}
                  />
                  <Button onClick={handleLocationSearch} disabled={isSubmitting}>
                    Search
                  </Button>
                </div>
                
                {searchResults.length > 0 && (
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {searchResults.map((result, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="w-full text-left"
                        onClick={async () => {
                          const coords = [parseFloat(result.lat), parseFloat(result.lon)];
                          setSelectedLocation(coords);
                          const address = await reverseGeocode(coords[0], coords[1]);
                          setSelectedLocationAddress(address);
                          setSearchResults([]);
                        }}
                      >
                        {result.display_name}
                      </Button>
                    ))}
                  </div>
                )}
              </div>

              <div className="aspect-video bg-muted rounded-md">
                <ErrorBoundary>
                  <MapComponent
                    onLocationSelect={handleMapLocationSelect}
                    locations={locations}
                    center={selectedLocation || mapCenter}
                    selectedLocation={selectedLocation}
                    key={JSON.stringify(selectedLocation)}
                  />
                </ErrorBoundary>
              </div>

              {selectedLocationAddress && (
                <p className="text-sm text-muted-foreground">
                  Selected Location: {selectedLocationAddress}
                </p>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={resetForm}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddLocation}
                  disabled={isSubmitting || !storeName?.trim() || !selectedLocation}
                >
                  {isSubmitting ? "Adding..." : "Add Location"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}