import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ChevronLeft, Loader2, X } from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { toast } from "react-toastify";

// Configure axios to send credentials with requests
axios.defaults.withCredentials = true;

export default function PeriodTracker() {
  const navigate = useNavigate();
  const [nextPeriod, setNextPeriod] = useState(new Date());
  const [fertileWindow, setFertileWindow] = useState({
    start: new Date(),
    end: new Date(),
  });
  const [date, setDate] = useState(new Date());
  const [symptoms, setSymptoms] = useState([]);
  const [periodDays, setPeriodDays] = useState([]);
  const [notes, setNotes] = useState("");
  const [userId, setUserId] = useState(null);
  const [periodData, setPeriodData] = useState([]);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [helpQuery, setHelpQuery] = useState("");
  const [helpResponse, setHelpResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  // Mock data for period prediction (will be replaced with backend calculations)

  const handleShowDoctors = () => {
    if (symptoms.length === 0) {
      toast.error("Please select at least one symptom");
      return;
    }

    // Store symptoms in localStorage for persistence
    localStorage.setItem("selectedSymptoms", JSON.stringify(symptoms));

    // Navigate to doctor page with symptoms as query parameters
    navigate(`/doctor?symptoms=${encodeURIComponent(symptoms.join(","))}`);
  };

  // const fertileStart = new Date()
  // fertileStart.setDate(fertileStart.getDate() + 7)

  // const fertileEnd = new Date()
  // fertileEnd.setDate(fertileEnd.getDate() + 12)

  // Fetch user ID from authentication
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3001/api/shewell/auth"
        );
        if (response.data.user) {
          setUserId(response.data.user.id);
        } else {
          toast.error("Authentication failed");
        }
      } catch (error) {
        toast.error("Failed to authenticate user");
      }
    };

    fetchUserId();
  }, []);

  // Fetch period data when user ID is available
  useEffect(() => {
    const fetchPeriodData = async () => {
      if (!userId) return;

      try {
        const response = await axios.get(
          `http://localhost:3001/api/shewell/get-period-data/${userId}`
        );
        setPeriodData(response.data);
      } catch (error) {
        toast.error("Failed to fetch period data");
      }
    };

    fetchPeriodData();
  }, [userId]);

  useEffect(() => {
    // If we have period data, use it to update cycle insights
    if (periodData.length > 0 || periodDays.length > 0) {
      // Use the most recent data (from either periodData or periodDays)
      const mostRecentDays =
        periodDays.length > 0
          ? periodDays
          : [new Date(periodData[periodData.length - 1]?.startDate)];

      updateCycleInsights(mostRecentDays);
    }
  }, [periodData, periodDays]);

  const toggleSymptom = (symptom) => {
    if (symptoms.includes(symptom)) {
      setSymptoms(symptoms.filter((s) => s !== symptom));
    } else {
      setSymptoms([...symptoms, symptom]);
    }
  };

  const updateCycleInsights = (selectedPeriodDays) => {
    if (selectedPeriodDays.length === 0) return;

    // Sort period days to get the latest period start date
    selectedPeriodDays.sort((a, b) => new Date(a) - new Date(b));
    const lastPeriodStart = new Date(
      selectedPeriodDays[selectedPeriodDays.length - 1]
    );

    // Calculate cycle length (difference between last two periods)
    let calculatedCycleLength = 28; // Default
    if (periodData.length > 1) {
      // If we have historical data, use the average cycle length
      calculatedCycleLength = Math.round(
        periodData.reduce((sum, period) => sum + period.cycleLength, 0) /
          periodData.length
      );
    }

    // Predict next period start date
    const nextPeriodDate = new Date(lastPeriodStart);
    nextPeriodDate.setDate(nextPeriodDate.getDate() + calculatedCycleLength);

    // Predict fertile window (typically 12-16 days before next period)
    const fertileStartDate = new Date(nextPeriodDate);
    fertileStartDate.setDate(fertileStartDate.getDate() - 16);

    const fertileEndDate = new Date(nextPeriodDate);
    fertileEndDate.setDate(fertileEndDate.getDate() - 12);

    // Update state
    setNextPeriod(nextPeriodDate);
    setFertileWindow({
      start: fertileStartDate,
      end: fertileEndDate,
    });

    console.log("Updated cycle insights:", {
      nextPeriod: nextPeriodDate,
      fertileWindow: { start: fertileStartDate, end: fertileEndDate },
    });
  };

  const togglePeriodDay = (day) => {
    // Check if the selected date is already the current period start date
    const isSameDay =
      periodDays.length > 0 &&
      periodDays[0].toDateString() === day.toDateString();

    // If same date is clicked again, clear selection; otherwise, update it
    const updatedPeriodDays = isSameDay ? [] : [day];

    setPeriodDays(updatedPeriodDays);
    updateCycleInsights(updatedPeriodDays);
  };

  const handleSaveEntry = async () => {
    console.log(userId);
    console.log(date);
    console.log(symptoms);
    console.log(notes);
    if (!userId) {
      toast.error("User not authenticated");
      return;
    }

    try {
      // Assuming average cycle and period length based on typical data
      const cycleLength = 28;
      const periodLength = 5;

      await axios
        .post("http://localhost:3001/api/shewell/add-period", {
          userId,
          startDate: date,
          cycleLength,
          periodLength,
          symptoms,
          notes,
        })
        .then((res) => {
          toast.success("Period data saved successfully");
          console.log(res.data);
        })
        .catch((err) => {
          toast.error("Failed to save period data");
          console.log(err);
        });

      // Reset form after saving
      setSymptoms([]);
      setNotes("");
      setDate(new Date());
    } catch (error) {
      toast.error("Failed to save period data");
    }
  };

  // Simple calendar component for demo purposes
  const SimpleCalendar = ({ onDateSelect }) => {
    const daysInMonth = new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0
    ).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
      <div className="rounded-md border p-4">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
            <div key={i} className="text-center text-sm font-medium">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const currentDate = new Date(
              date.getFullYear(),
              date.getMonth(),
              day
            );

            const isPeriodStart =
              periodDays.length > 0 &&
              periodDays[0].toDateString() === currentDate.toDateString();
            const isPredictedPeriod =
              nextPeriod.toDateString() === currentDate.toDateString();
            const isFertileDay =
              currentDate >= new Date(fertileWindow.start) &&
              currentDate <= new Date(fertileWindow.end);

            return (
              <button
                key={day}
                className={`h-9 w-9 rounded-md flex items-center justify-center text-sm 
                  ${isPeriodStart ? "bg-red-400 text-white" : ""}
                  ${
                    isPredictedPeriod
                      ? "border border-dashed border-red-400"
                      : ""
                  }
                  ${isFertileDay ? "bg-green-300" : ""}
                  hover:bg-muted`}
                onClick={() => {
                  onDateSelect(currentDate);
                  togglePeriodDay(currentDate);
                }}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Add this function with your other handler functions
  const handleSaveCycleInsights = async () => {
    if (!userId) {
      toast.error("User not authenticated");
      return;
    }

    // Make sure we have a selected period day to use as a starting point
    if (periodDays.length === 0) {
      toast.error("Please select a period start date on the calendar first");
      return;
    }

    try {
      setLoading(true);

      // Calculate cycle length based on the difference between this period start
      // and the predicted next period
      const cycleLength = Math.round(
        (nextPeriod - periodDays[0]) / (1000 * 60 * 60 * 24)
      );

      // Use average period length if available, otherwise use default 5 days
      const periodLength =
        periodData.length > 0
          ? Math.round(
              periodData.reduce((sum, period) => sum + period.periodLength, 0) /
                periodData.length
            )
          : 5;

      // Save to backend
      await axios.post("http://localhost:3001/api/shewell/add-period", {
        userId,
        startDate: periodDays[0],
        cycleLength,
        periodLength,
        nextPeriodDate: nextPeriod,
        fertileWindowStart: fertileWindow.start,
        fertileWindowEnd: fertileWindow.end,
        symptoms,
        notes,
      });

      toast.success("Cycle predictions saved successfully");

      // Refresh period data
      const response = await axios.get(
        `http://localhost:3001/api/shewell/get-period-data/${userId}`
      );
      setPeriodData(response.data);
    } catch (error) {
      console.error("Error saving cycle insights:", error);
      toast.error("Failed to save cycle predictions");
    } finally {
      setLoading(false);
    }
  };

  const handleGetHelp = async () => {
    if (!helpQuery.trim()) {
      toast.error("Please enter your symptom or question");
      return;
    }

    setLoading(true);
    try {
      // Call the AI-powered endpoint
      const response = await axios.post(
        "http://localhost:3001/api/shewell/symptom-help",
        { query: helpQuery }
      );

      // Validate and normalize the response structure
      const data = response.data;

      // Ensure the response has all required properties with proper defaults
      const formattedResponse = {
        title: data.title || "Response",
        advice: Array.isArray(data.advice)
          ? data.advice
          : [
              {
                type: "Information",
                items: [
                  typeof data.response === "string"
                    ? data.response
                    : "Please try asking about women's health topics for more specific advice.",
                ],
              },
            ],
        videoRecommendation: data.videoRecommendation || null,
      };

      // Check if any advice section has items that aren't in array format
      formattedResponse.advice = formattedResponse.advice.map((section) => ({
        type: section.type || "Information",
        items: Array.isArray(section.items)
          ? section.items
          : [
              typeof section.items === "string"
                ? section.items
                : "No specific advice available",
            ],
      }));

      console.log("Formatted response:", formattedResponse);
      setHelpResponse(formattedResponse);
    } catch (error) {
      console.error("Error fetching help:", error);

      // Fallback in case of API error
      setHelpResponse({
        title: "Error Getting Advice",
        advice: [
          {
            type: "Temporary Issue",
            items: [
              "Sorry, we couldn't process your request at this time.",
              "Please try again later or contact support if the issue persists.",
            ],
          },
        ],
        videoRecommendation: null,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-fit mx-auto">
      <main className="flex py-8 justify-center items-center">
        <div className="container">
          <div className="flex items-center gap-2 mb-6">
            <Link to="/">
              <Button variant="outline" size="icon" asChild>
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Period Tracker</h1>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Calendar</CardTitle>
                <CardDescription>
                  Track your period and fertile days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SimpleCalendar onDateSelect={setDate} />
                <div className="mt-4 flex flex-wrap gap-2">
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-3 rounded-full bg-red-400"></div>
                    <span className="text-xs">Period</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-3 rounded-full bg-green-200"></div>
                    <span className="text-xs">Fertile Window</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-3 rounded-full border border-dashed border-red-400"></div>
                    <span className="text-xs">Predicted Period</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Cycle Insights</CardTitle>
                <CardDescription>
                  Your period and fertility predictions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Existing cycle insights content */}
                  <div className="rounded-lg bg-muted p-4">
                    <h3 className="font-medium">Next Period</h3>
                    <p className="text-sm text-muted-foreground">
                      Expected to start on {nextPeriod.toLocaleDateString()}
                    </p>
                    <div className="mt-2 h-2 w-full rounded-full bg-muted-foreground/20">
                      <div className="h-2 w-1/3 rounded-full bg-primary"></div>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {Math.max(
                        0,
                        Math.round(
                          (nextPeriod - new Date()) / (1000 * 60 * 60 * 24)
                        )
                      )}{" "}
                      days until next period
                    </p>
                  </div>

                  <div className="rounded-lg bg-muted p-4">
                    <h3 className="font-medium">Fertile Window</h3>
                    <p className="text-sm text-muted-foreground">
                      {fertileWindow.start.toLocaleDateString()} -{" "}
                      {fertileWindow.end.toLocaleDateString()}
                    </p>
                  </div>

                  <div className="rounded-lg bg-muted p-4">
                    <h3 className="font-medium">Cycle Length</h3>
                    <p className="text-sm text-muted-foreground">
                      Average:{" "}
                      {periodData.length > 0
                        ? Math.round(
                            periodData.reduce(
                              (sum, period) => sum + period.cycleLength,
                              0
                            ) / periodData.length
                          )
                        : 28}{" "}
                      days
                    </p>
                  </div>

                  <div className="rounded-lg bg-muted p-4">
                    <h3 className="font-medium">Period Length</h3>
                    <p className="text-sm text-muted-foreground">
                      Average:{" "}
                      {periodData.length > 0
                        ? Math.round(
                            periodData.reduce(
                              (sum, period) => sum + period.periodLength,
                              0
                            ) / periodData.length
                          )
                        : 5}{" "}
                      days
                    </p>
                  </div>

                  {/* Add this button at the end */}
                  <Button
                    className="w-full bg-pink-600 hover:bg-pink-700 text-white"
                    onClick={handleSaveCycleInsights}
                  >
                    Save Cycle Predictions
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 lg:col-span-1">
              <CardHeader>
                <CardTitle>Symptom Tracker</CardTitle>
                <CardDescription>
                  Record how you're feeling today
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="physical">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="physical">Physical</TabsTrigger>
                    <TabsTrigger value="mood">Mood</TabsTrigger>
                  </TabsList>
                  <TabsContent value="physical" className="mt-4">
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        "Cramps",
                        "Headache",
                        "Bloating",
                        "Fatigue",
                        "Breast Tenderness",
                        "Acne",
                      ].map((symptom) => (
                        <Button
                          key={symptom}
                          variant={
                            symptoms.includes(symptom) ? "default" : "outline"
                          }
                          onClick={() => toggleSymptom(symptom)}
                          className="justify-start"
                        >
                          {symptom}
                        </Button>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="mood" className="mt-4">
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        "Happy",
                        "Sad",
                        "Anxious",
                        "Irritable",
                        "Calm",
                        "Energetic",
                      ].map((mood) => (
                        <Button
                          key={mood}
                          variant={
                            symptoms.includes(mood) ? "default" : "outline"
                          }
                          onClick={() => toggleSymptom(mood)}
                          className="justify-start"
                        >
                          {mood}
                        </Button>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <div className="mt-6">
                <div className="flex flex-col gap-2 px-10">
                  <Button className="w-full" onClick={handleSaveEntry}>
                    Save Today's Entry
                  </Button>
                  <Button
                    className="w-full bg-blue-500 text-white"
                    onClick={() => setShowHelpModal(true)}
                  >
                    Get Symptom Help
                  </Button>
                  <Button
                    className="w-full bg-green-600 text-white"
                    onClick={handleShowDoctors}
                  >
                    Show Recommended Doctors
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Help Modal - Custom Implementation */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur">
          <Card className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto w-full bg-white rounded-lg shadow-lg">
            <CardHeader className="relative p-4 border-b">
              <CardTitle className="text-xl font-semibold">
                Period Symptom Help
              </CardTitle>
              <CardDescription className="text-sm text-gray-500">
                Describe your symptoms or ask a question to get personalized
                advice
              </CardDescription>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2"
                onClick={() => setShowHelpModal(false)}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4 mt-4">
                <div className="flex gap-2">
                  <textarea
                    placeholder="e.g., How can I relieve period cramps? or I'm feeling bloated and tired"
                    value={helpQuery}
                    onChange={(e) => setHelpQuery(e.target.value)}
                    className="flex-1 min-h-[80px] rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm"
                  />
                  <Button
                    onClick={handleGetHelp}
                    disabled={loading}
                    className="bg-blue-500 text-white"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      "Ask"
                    )}
                  </Button>
                </div>

                {loading && (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2">Finding helpful information...</span>
                  </div>
                )}

                {!loading && helpResponse && (
                  <div className="bg-gray-100 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-4">
                      {helpResponse.title}
                    </h3>

                    {helpResponse.advice && (
                      <div className="space-y-6">
                        {helpResponse.advice.map((section, index) => (
                          <div key={index} className="space-y-2">
                            <h4 className="font-medium">{section.type}</h4>
                            <ul className="list-disc pl-5 space-y-1">
                              {section.items.map((item, idx) => (
                                <li key={idx}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 text-sm text-gray-500">
                      <p>
                        Note: This information is for educational purposes only
                        and is not a substitute for professional medical advice.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
