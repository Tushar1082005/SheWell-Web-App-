import React, { useState, useEffect } from "react";
import { storeFile, getIPFSGatewayURL } from "./utils/ipfs";
import { getContract } from "./utils/contract";
// Import only the specific icons you need
import {
  Shield,
  Upload,
  FileText,
  Check,
  Clock,
  Eye,
  FileImage,
} from "lucide-react";

function FileUpload() {
  const [file, setFile] = useState(null);
  const [recordType, setRecordType] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [records, setRecords] = useState([]);
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  // Connect to MetaMask
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        setMessage("Please install MetaMask to use this application");
        return;
      }

      setLoading(true);
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0]);
      setIsConnected(true);
      setMessage("Wallet connected successfully!");

      // Load records after connecting
      await loadRecords();
      setLoading(false);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      setMessage("Failed to connect wallet: " + error.message);
      setLoading(false);
    }
  };

  // Load user's records from blockchain
  const loadRecords = async () => {
    if (!account) return;

    try {
      setLoading(true);
      const contract = await getContract();
      const userRecords = await contract.getRecords(account);

      // Format records for display
      const formattedRecords = userRecords.map((record) => ({
        cid: record.cid,
        recordType: record.recordType,
        timestamp: new Date(Number(record.timestamp) * 1000).toLocaleString(),
        url: getIPFSGatewayURL(record.cid),
      }));

      setRecords(formattedRecords);
      setLoading(false);
    } catch (error) {
      console.error("Error loading records:", error);
      setMessage("Failed to load records: " + error.message);
      setLoading(false);
    }
  };

  // Check for Pinata API keys
  useEffect(() => {
    if (
      !process.env.REACT_APP_PINATA_API_KEY ||
      !process.env.REACT_APP_PINATA_SECRET_KEY
    ) {
      setError(
        "Pinata API credentials are missing. Please set the REACT_APP_PINATA_API_KEY and REACT_APP_PINATA_SECRET_KEY environment variables."
      );
    }
  }, []);

  // Handle file upload
  const handleUpload = async () => {
    if (!file || !recordType) {
      setMessage("Please select a file and enter a record type");
      return;
    }

    if (!isConnected) {
      setMessage("Please connect your wallet first");
      return;
    }

    if (
      !process.env.REACT_APP_PINATA_API_KEY ||
      !process.env.REACT_APP_PINATA_SECRET_KEY
    ) {
      setMessage(
        "Pinata API credentials are missing. Please check your environment variables."
      );
      return;
    }

    try {
      setLoading(true);
      setMessage("Uploading to IPFS via Pinata...");
      setUploadProgress(10);

      // Upload to IPFS
      const cid = await storeFile(file);
      setUploadProgress(50);
      setMessage("File uploaded to IPFS! Adding to blockchain...");

      // Store on blockchain
      const contract = await getContract();
      const tx = await contract.addRecord(cid, recordType);
      setUploadProgress(75);

      await tx.wait();
      setUploadProgress(100);

      setMessage(`Record added successfully! IPFS CID: ${cid}`);
      setFile(null);
      setRecordType("");
      setDescription("");

      // Reload records
      await loadRecords();
      setLoading(false);
      setUploadProgress(0);
    } catch (err) {
      console.error("Upload error:", err);
      setMessage("Failed to upload: " + err.message);
      setLoading(false);
      setUploadProgress(0);
    }
  };

  // Check if wallet is already connected on page load
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            setIsConnected(true);
            await loadRecords();
          }
        } catch (error) {
          console.error("Connection check error:", error);
        }
      }
    };

    checkConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-white">
      <header className="py-12 px-6 text-center relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-pink-200 rounded-full opacity-20 blur-xl"></div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-200 rounded-full opacity-20 blur-xl"></div>

        <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-600 to-purple-700 inline-block text-transparent bg-clip-text mb-3">
          Women's Health Records
        </h1>
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto text-lg">
          Securely store and manage your health records using blockchain and
          IPFS
        </p>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg mb-8 max-w-md mx-auto shadow-sm">
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              {error}
            </div>
          </div>
        )}

        {!isConnected ? (
          <button
            onClick={connectWallet}
            disabled={loading}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-700 text-white font-medium rounded-xl shadow-lg hover:from-pink-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <Shield className="w-5 h-5 mr-2" />
            {loading ? "Connecting..." : "Connect Wallet"}
          </button>
        ) : (
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-xl shadow-sm inline-block border border-purple-200">
            <p className="text-gray-700 font-medium flex items-center">
              <span className="w-3 h-3 bg-green-400 rounded-full mr-2 pulse-animation"></span>
              Connected: {account?.substring(0, 6)}...{account?.substring(38)}
            </p>
          </div>
        )}
      </header>

      <main className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-2 gap-10">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-pink-100 backdrop-blur-sm bg-opacity-80 transition-transform hover:shadow-2xl">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <Upload className="w-6 h-6 mr-2 text-pink-500" />
              Upload Health Record
            </h2>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select File
              </label>
              <div
                className={`border-3 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                  !loading && isConnected
                    ? "border-pink-300 hover:border-pink-500 bg-pink-50 hover:bg-pink-100 cursor-pointer"
                    : "border-gray-300 bg-gray-50"
                }`}
              >
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  disabled={loading || !isConnected}
                  className="hidden"
                  id="file-upload"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
                <label
                  htmlFor="file-upload"
                  className={`flex flex-col items-center ${
                    !loading && isConnected
                      ? "cursor-pointer"
                      : "cursor-not-allowed"
                  }`}
                >
                  {file ? (
                    <FileImage className="w-16 h-16 text-pink-500 mb-3" />
                  ) : (
                    <FileText className="w-16 h-16 text-gray-400 mb-3" />
                  )}
                  <span
                    className={`text-sm ${
                      file ? "text-pink-600 font-medium" : "text-gray-500"
                    }`}
                  >
                    {file ? file.name : "Drop file here or click to upload"}
                  </span>
                  {file && (
                    <span className="text-xs text-gray-500 mt-1">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  )}
                </label>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Record Type
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g., Mammogram, Pap Smear, Blood Test"
                  value={recordType}
                  onChange={(e) => setRecordType(e.target.value)}
                  disabled={loading || !isConnected}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 disabled:bg-gray-100 disabled:text-gray-500 pl-10"
                />
                <span className="absolute left-3 top-3 text-gray-400">
                  <FileText className="w-5 h-5" />
                </span>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                placeholder="Additional details about the record"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading || !isConnected}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 disabled:bg-gray-100 disabled:text-gray-500 min-h-[120px] resize-none"
              />
            </div>

            <button
              onClick={handleUpload}
              disabled={loading || !file || !recordType || !isConnected}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 px-6 rounded-xl shadow-lg hover:from-pink-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium text-lg flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Clock className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Record
                </>
              )}
            </button>

            {message && (
              <div
                className={`mt-5 overflow-hidden p-4 rounded-xl ${
                  message.includes("success")
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-yellow-50 text-yellow-700 border border-yellow-200"
                }`}
              >
                <div className="flex">
                  {message.includes("success") ? (
                    <Check className="w-5 h-5 mr-2 flex-shrink-0" />
                  ) : (
                    <Clock className="w-5 h-5 mr-2 flex-shrink-0" />
                  )}
                  {message.includes("success") ? (
                    <span>Success!</span>
                  ) : (
                    <span>Warning!</span>
                  )}
                </div>
              </div>
            )}

            {loading && (
              <div className="mt-6">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-pink-500 to-purple-600 h-3 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-2">
                  <p className="text-xs text-gray-500">Processing...</p>
                  <p className="text-xs font-medium text-purple-700">
                    {uploadProgress}% Complete
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-pink-100 backdrop-blur-sm bg-opacity-80">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <FileText className="w-6 h-6 mr-2 text-pink-500" />
              My Health Records
            </h2>

            {isConnected ? (
              records.length > 0 ? (
                <div className="space-y-5">
                  {records.map((record, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-xl p-5 transition-all hover:shadow-md hover:border-pink-200 bg-white"
                    >
                      <h3 className="text-lg font-medium text-pink-600">
                        {record.recordType}
                      </h3>
                      <p className="text-sm text-gray-500 mb-3 flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        Uploaded: {record.timestamp}
                      </p>
                      <a
                        href={record.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Document
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 px-4 border-2 border-dashed border-gray-200 rounded-xl">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-pink-100 text-pink-500 mb-4">
                    <FileText className="w-10 h-10" />
                  </div>
                  <p className="text-gray-500 mb-4">No records found yet</p>
                  <p className="text-sm text-gray-400">
                    Your uploaded health records will appear here
                  </p>
                </div>
              )
            ) : (
              <div className="text-center py-16 px-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-200 text-gray-400 mb-4">
                  <Shield className="w-10 h-10" />
                </div>
                <p className="text-gray-500 mb-2">
                  Connect your wallet to view your records
                </p>
                <p className="text-sm text-gray-400">
                  Your data remains secure and private
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-gradient-to-r from-purple-100 to-pink-100 py-10 border-t border-purple-200">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-gray-600">
            © {new Date().getFullYear()} Women's Health Records - Secured with
            Blockchain & IPFS
          </p>
          <div className="mt-2 text-sm text-gray-500">
            Your data is encrypted and securely stored on decentralized storage
          </div>
        </div>
      </footer>

      <style>{`
        .pulse-animation {
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(74, 222, 128, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(74, 222, 128, 0);
          }
        }
      `}</style>
    </div>
  );
}

export default FileUpload;
