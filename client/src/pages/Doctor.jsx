import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "../components/ui/card";
import { toast } from "react-toastify";
import {
  ChevronLeft,
  Calendar,
  Clock,
  Medal,
  Star,
  Filter,
} from "lucide-react";

export default function Doctor() {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const initialSymptoms = query.get("symptoms")?.split(",") || [];

  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [filterSpecialty, setFilterSpecialty] = useState("");
  const [specialties, setSpecialties] = useState([]);
  
  // User details state to store logged-in user information
  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
    phone: ""
  });

  useEffect(() => {
    if (initialSymptoms.length > 0) findDoctors();
    
    // Fetch authenticated user details when component mounts
    fetchUserDetails();
  }, []);

  // Function to fetch authenticated user's details
  const fetchUserDetails = async () => {
    try {
      const response = await axios.get("http://localhost:3001/api/shewell/auth");
      if (response.data.user) {
        setUserDetails({
          name: response.data.user.username || "",
          email: response.data.user.email || "",
          phone: response.data.user.phoneNumber || ""
        });
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      // Don't show error toast as this is just for prefilling data
    }
  };

  // When doctors change or filter changes, update filtered doctors
  useEffect(() => {
    if (filterSpecialty) {
      setFilteredDoctors(
        doctors.filter((doc) =>
          doc.specialty.toLowerCase().includes(filterSpecialty.toLowerCase())
        )
      );
    } else {
      setFilteredDoctors(doctors);
    }
  }, [doctors, filterSpecialty]);

  // Extract unique specialties for filtering
  useEffect(() => {
    if (doctors.length > 0) {
      const uniqueSpecialties = [
        ...new Set(doctors.map((doc) => doc.specialty)),
      ];
      setSpecialties(uniqueSpecialties);
    }
  }, [doctors]);

  const findDoctors = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post(
        "http://localhost:3001/api/shewell/match-doctors",
        { symptoms: initialSymptoms }
      );
      setDoctors(data.doctors);
      setFilteredDoctors(data.doctors);
      console.log("Doctors found:", data.doctors);
    } catch (error) {
      toast.error("Failed to find doctors");
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const bookAppointment = async () => {
    if (!selectedDoctor || !selectedSlot) {
      toast.error("Please select a doctor and time slot");
      return;
    }
    
    if (!userDetails.name) {
      toast.error("Unable to book: User information not available");
      return;
    }
  
    setBooking(true);
    try {
      await axios.post("http://localhost:3001/api/shewell/book-appointment", {
        doctorId: selectedDoctor._id,
        slot: selectedSlot,
        symptoms: initialSymptoms,
        patientName: userDetails.name,
        patientEmail: userDetails.email,
        patientPhone: userDetails.phone
      });
  
      toast.success("Appointment booked successfully!");
      navigate("/");
    } catch (error) {
      console.error("Booking error:", error);
      toast.error(error.response?.data?.error || "Booking failed");
    } finally {
      setBooking(false);
    }
  };

  // Format date for nicer display
  const formatDate = (dateString) => {
    const parsedDate = new Date(dateString);
    if (isNaN(parsedDate.getTime())) return dateString;

    const options = {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };

    return parsedDate.toLocaleDateString("en-US", options);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center gap-2">
          <Link to="/period-tracker">
            <Button variant="outline" size="icon">
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">
            Find Specialists For Your Symptoms
          </h1>
        </div>

        <Card className="mb-6 bg-white shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl text-pink-700">
              Recommended Doctors
            </CardTitle>
            <CardDescription className="text-gray-600 font-medium">
              Based on your symptoms:{" "}
              {initialSymptoms.map((symptom, i) => (
                <span
                  key={i}
                  className="inline-block bg-pink-100 text-pink-800 px-2 py-1 rounded-full text-xs mr-2 mb-1"
                >
                  {symptom}
                </span>
              ))}
            </CardDescription>
          </CardHeader>

          {specialties.length > 0 && (
            <CardContent className="pb-0 border-t pt-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="text-gray-500 h-4 w-4" />
                <span className="text-sm font-medium">
                  Filter by specialty:
                </span>
                <Button
                  variant={!filterSpecialty ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterSpecialty("")}
                  className="h-8"
                >
                  All
                </Button>
                {specialties.map((specialty) => (
                  <Button
                    key={specialty}
                    variant={
                      filterSpecialty === specialty ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setFilterSpecialty(specialty)}
                    className="h-8"
                  >
                    {specialty}
                  </Button>
                ))}
              </div>
            </CardContent>
          )}
        </Card>

        {loading ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-700 mx-auto"></div>
            <p className="mt-4 text-gray-600">
              Finding the best doctors for your symptoms...
            </p>
          </div>
        ) : filteredDoctors.length > 0 ? (
          <div className="space-y-4">
            {filteredDoctors.map((doctor, index) => (
              <Card
                key={doctor._id}
                className="overflow-hidden bg-white shadow-md hover:shadow-lg transition-shadow"
              >
                {doctor.matchScore > 0.7 && (
                  <div className="bg-green-100 text-green-800 py-1 px-3 text-xs font-medium flex items-center justify-center gap-1">
                    <Medal className="h-3 w-3" />
                    High match for your symptoms
                  </div>
                )}
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{doctor.name}</CardTitle>
                      <CardDescription className="text-pink-700 font-medium mt-1">
                        {doctor.specialty}
                      </CardDescription>
                    </div>
                    <div className="bg-pink-50 px-3 py-1 rounded-full flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                      <span className="text-sm font-medium">
                        {(4 + Math.random()).toFixed(1)}/5
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pb-4">
                  {doctor.matchingSymptoms &&
                    doctor.matchingSymptoms.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Specializes in treating:
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {doctor.matchingSymptoms.map((symptom, i) => (
                            <span
                              key={i}
                              className="bg-purple-50 text-purple-700 px-2 py-1 rounded-md text-xs"
                            >
                              {symptom}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  <div className="grid md:grid-cols-2 gap-4 mt-3">
                    <div>
                      <h3 className="font-medium mb-2 flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-pink-600" />
                        Available Slots
                      </h3>
                      <select
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                        value={
                          selectedDoctor?._id === doctor._id ? selectedSlot : ""
                        }
                        onChange={(e) => {
                          setSelectedDoctor(doctor);
                          setSelectedSlot(e.target.value);
                        }}
                      >
                        <option value="">Select a time slot</option>
                        {doctor.availableSlots.map((slot, index) => (
                          <option key={index} value={slot}>
                            {formatDate(slot)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2 justify-end">
                      <Button
                        onClick={() => setSelectedDoctor(doctor)}
                        disabled={selectedDoctor?._id === doctor._id}
                        className="bg-pink-600 hover:bg-pink-700"
                      >
                        {selectedDoctor?._id === doctor._id
                          ? "Selected"
                          : "Select Doctor"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <div className="text-pink-700 text-4xl mb-3">😔</div>
            <h3 className="text-xl font-medium mb-2">No doctors found</h3>
            <p className="text-gray-600 mb-4">
              We couldn't find specialists for your symptoms. Try selecting
              different symptoms or contact support.
            </p>
            <Button onClick={() => navigate("/period-tracker")}>
              Return to Symptom Selection
            </Button>
          </div>
        )}

        {/* Modified appointment confirmation card */}
        {selectedDoctor && selectedSlot && (
          <Card className="mt-8 shadow-lg bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
            <CardHeader>
              <CardTitle className="text-center text-pink-700">
                Selected Appointment
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="mb-4 text-center">
                <h3 className="text-xl font-bold">Dr. {selectedDoctor.name}</h3>
                <p className="text-gray-600 font-medium">
                  {selectedDoctor.specialty}
                </p>

                <div className="mt-4 flex items-center justify-center gap-2 text-gray-700">
                  <Clock className="h-5 w-5" />
                  <span>{formatDate(selectedSlot)}</span>
                </div>
                
                {/* Display user details instead of form fields */}
                {userDetails.name && (
                  <div className="mt-4 py-3 px-4 bg-white rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-500 mb-1">Booking as:</p>
                    <p className="font-medium">{userDetails.name}</p>
                    <p className="text-sm text-gray-600">{userDetails.email}</p>
                    {userDetails.phone && (
                      <p className="text-sm text-gray-600">{userDetails.phone}</p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-center pb-6">
              <Button
                size="lg"
                onClick={bookAppointment}
                disabled={booking || !userDetails.name}
                className="bg-gradient-to-r from-pink-600 to-purple-700 hover:from-pink-700 hover:to-purple-800"
              >
                {booking ? "Booking..." : "Confirm Appointment"}
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}
