import { useState } from "react";
import axios from "axios";

export default function SOSButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const sendSOS = () => {
    if (!navigator.geolocation) {
      setMessage("Geolocation is not supported by your browser.");
      return;
    }

    setLoading(true);
    setMessage("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const phoneNumber = "+1234567890"; // Replace with recipient number

          const response = await axios.post("http://localhost:3001/api/send-sos", {
            phone: phoneNumber,
            latitude,
            longitude,
          });

          if (response.data.success) {
            setMessage("🚨 SOS Alert sent successfully!");
          }
        } catch (error) {
          setMessage("Error sending SOS. Try again.");
        } finally {
          setLoading(false);
        }
      },
      () => {
        setMessage("Failed to get location. Enable GPS.");
        setLoading(false);
      }
    );
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={sendSOS}
        disabled={loading}
        className="bg-red-600 text-white px-3 py-3 rounded-lg text-xs font-bold"
      >
        {loading ? "Sending..." : "🚨 Send SOS Alert"}
      </button>
      {/* {message && <p className="mt-4 text-gray-700">{message}</p>} */}
    </div>
  );
}