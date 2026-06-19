import React, { useState, createContext, useContext, useEffect } from 'react';
import axios from 'axios';
import { ArrowRight, ChevronDown, ChevronUp, Filter, RefreshCw, Share2, Download, ExternalLink, Info, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Search } from 'lucide-react';

// Create SchemeData Context
const SchemeDataContext = createContext();

const useSchemeData = () => {
  const context = useContext(SchemeDataContext);
  if (!context) {
    throw new Error('useSchemeData must be used within a SchemeDataProvider');
  }
  return context;
};

const SchemeDataProvider = ({ children }) => {
  const [userDetails, setUserDetails] = useState(null);
  const [schemeResults, setSchemeResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSchemes = async () => {
    if (!userDetails) return;

    setLoading(true);
    setError(null);

    try {
      // Call the server endpoint
      const response = await axios.post('http://localhost:3001/api/shewell/schemes', userDetails);
      setSchemeResults(response.data);
    } catch (err) {
      setError('Failed to fetch scheme recommendations. Please try again.');
      console.error('Error fetching schemes:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setSchemeResults([]);
  };

  return (
    <SchemeDataContext.Provider
      value={{
        userDetails,
        setUserDetails,
        schemeResults,
        loading,
        error,
        fetchSchemes,
        clearResults
      }}
    >
      {children}
    </SchemeDataContext.Provider>
  );
};

// Scheme Card Component
const SchemeCard = ({ scheme, expanded: globalExpanded }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setIsExpanded(globalExpanded);
  }, [globalExpanded]);

  return (
    <div className="border rounded-lg shadow-sm overflow-hidden bg-white hover:shadow-md transition-shadow duration-200">
      <div
        className="flex items-center p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mr-4">
          <span className="text-xs font-medium text-purple-800">
            {scheme.jurisdiction || 'All India'}
          </span>
        </div>

        <div className="flex-grow">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-medium text-gray-900">{scheme.name}</h3>
            <span className="px-2 py-1 text-xs font-medium bg-purple-50 text-purple-700 rounded-full">
              {scheme.category}
            </span>
          </div>
          <p className="text-gray-600 text-sm mt-1">{scheme.description}</p>
        </div>

        <div className="ml-4 flex items-center text-gray-400">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-1">Eligibility</h4>
              <p className="text-sm text-gray-600">{scheme.eligibility}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-1">Benefits</h4>
              <p className="text-sm text-gray-600">{scheme.benefits}</p>
            </div>
          </div>

          {/* How to Apply Section */}
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-1">How to Apply</h4>
            <p className="text-sm text-gray-600">{scheme.applicationProcess}</p>
          </div>

          {/* Official Website Link */}
          {scheme.link && (
            <div className="mt-4">
              <a
                href={scheme.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-purple-600 hover:text-purple-800 transition-colors"
              >
                Official Website <ExternalLink size={14} className="ml-1" />
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Form Section Component
const FormSection = ({ title, children }) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-3">{title}</h3>
      <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
        {children}
      </div>
    </div>
  );
};

// User Details Form Component with complete options from original project
const UserDetailsForm = () => {
  // Complete category options
  const categoryOptions = [
    { value: 'General', label: 'General' },
    { value: 'OBC', label: 'OBC' },
    { value: 'SC', label: 'SC' },
    { value: 'ST', label: 'ST' },
    { value: 'Minority', label: 'Minority' }
  ];

  // Complete education options
  const educationOptions = [
    { value: 'Illiterate', label: 'Illiterate' },
    { value: 'Primary', label: 'Primary (1-5)' },
    { value: 'Secondary', label: 'Secondary (6-10)' },
    { value: 'Higher Secondary', label: 'Higher Secondary (11-12)' },
    { value: 'Graduate', label: 'Graduate' },
    { value: 'Post-Graduate', label: 'Post-Graduate' }
  ];

  // Complete marital options
  const maritalOptions = [
    { value: 'Single', label: 'Single' },
    { value: 'Married', label: 'Married' },
    { value: 'Widow', label: 'Widow' },
    { value: 'Divorced', label: 'Divorced' },
    { value: 'Separated', label: 'Separated' }
  ];

  // Complete employment options
  const employmentOptions = [
    { value: 'Student', label: 'Student' },
    { value: 'Unemployed', label: 'Unemployed' },
    { value: 'Self-employed', label: 'Self-employed' },
    { value: 'Salaried', label: 'Salaried' },
    { value: 'Homemaker', label: 'Homemaker' },
    { value: 'Retired', label: 'Retired' }
  ];

  // Complete rural/urban options
  const ruralUrbanOptions = [
    { value: 'Rural', label: 'Rural' },
    { value: 'Urban', label: 'Urban' }
  ];

  // Complete list of India states
  const indiaStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
  ];

  // Initial form state with default values
  const initialFormState = {
    age: 25,
    income: '10000',
    category: 'General',
    education: 'Graduate',
    maritalStatus: 'Single',
    employment: 'Unemployed',
    state: 'Delhi',
    district: '',
    ruralUrban: 'Urban',
    specialNeeds: ''
  };

  const { userDetails, setUserDetails, fetchSchemes, loading } = useSchemeData();
  const [formData, setFormData] = useState(initialFormState);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setUserDetails(formData);
    fetchSchemes();
  };

  return (
    <div id="user-details-form" className="bg-white rounded-xl shadow-md p-6 sticky top-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Your Details</h2>
        <div className="flex items-center text-sm text-green-600">
          <ShieldCheck size={16} className="mr-1" />
          <span>Private & Secure</span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <FormSection title="Personal Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                Age
              </label>
              <input
                type="number"
                id="age"
                name="age"
                min="0"
                max="120"
                value={formData.age}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label htmlFor="income" className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Income (₹)
              </label>
              <input
                type="text"
                id="income"
                name="income"
                value={formData.income}
                onChange={handleChange}
                placeholder="e.g. 15000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Social Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              required
            >
              {categoryOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="education" className="block text-sm font-medium text-gray-700 mb-1">
                Education Level
              </label>
              <select
                id="education"
                name="education"
                value={formData.education}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                required
              >
                {educationOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="maritalStatus" className="block text-sm font-medium text-gray-700 mb-1">
                Marital Status
              </label>
              <select
                id="maritalStatus"
                name="maritalStatus"
                value={formData.maritalStatus}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                required
              >
                {maritalOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="employment" className="block text-sm font-medium text-gray-700 mb-1">
              Employment Status
            </label>
            <select
              id="employment"
              name="employment"
              value={formData.employment}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              required
            >
              {employmentOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </FormSection>

        <FormSection title="Location Details">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                State/UT
              </label>
              <select
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                required
              >
                <option value="">Select State</option>
                {indiaStates.map(state => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">
                District
              </label>
              <input
                type="text"
                id="district"
                name="district"
                value={formData.district}
                onChange={handleChange}
                placeholder="e.g. South Delhi"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="ruralUrban" className="block text-sm font-medium text-gray-700 mb-1">
              Rural/Urban
            </label>
            <div className="flex space-x-4">
              {ruralUrbanOptions.map(option => (
                <div key={option.value} className="flex items-center">
                  <input
                    type="radio"
                    id={option.value}
                    name="ruralUrban"
                    value={option.value}
                    checked={formData.ruralUrban === option.value}
                    onChange={handleChange}
                    className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300"
                  />
                  <label htmlFor={option.value} className="ml-2 block text-sm text-gray-700">
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </FormSection>

        <FormSection title="Additional Information (Optional)">
          <div>
            <label htmlFor="specialNeeds" className="block text-sm font-medium text-gray-700 mb-1">
              Any Special Needs or Circumstances
            </label>
            <textarea
              id="specialNeeds"
              name="specialNeeds"
              value={formData.specialNeeds}
              onChange={handleChange}
              rows={3}
              placeholder="E.g., disability, single parent, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </FormSection>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-gradient-to-r from-pink-600 to-pink-600 hover:from-pink-700 hover:to-pink-700 text-white font-medium rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200 flex items-center justify-center"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Finding Schemes...
            </>
          ) : (
            <>
              Find Eligible Schemes <ArrowRight size={18} className="ml-2" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

// Scheme Results Component
const SchemeResults = ({ setShowForm }) => {
  const { schemeResults, loading, error, clearResults, fetchSchemes } = useSchemeData();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expanded, setExpanded] = useState(false);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 h-full flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-6"></div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Finding Schemes For You</h3>
        <p className="text-gray-600">Our AI is analyzing your profile to find the best matching schemes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-red-700">{error}</p>
        </div>
        <button
          onClick={fetchSchemes}
          className="flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-200"
        >
          <RefreshCw size={16} className="mr-2" /> Try Again
        </button>
      </div>
    );
  }

  if (schemeResults.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 h-full flex flex-col items-center justify-center">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Results Will Appear Here</h3>
        <p className="text-gray-600 text-center mb-6">
          Fill out your details in the form and click "Find Eligible Schemes" to discover government programs tailored for you.
        </p>
        <img
          src="https://images.pexels.com/photos/3760529/pexels-photo-3760529.jpeg?auto=compress&cs=tinysrgb&w=600"
          alt="Woman looking at tablet"
          className="w-full max-w-md rounded-lg shadow-sm"
        />
      </div>
    );
  }

  // Get unique categories
  const categories = ['All', ...Array.from(new Set(schemeResults.map(scheme => scheme.category)))];

  // Filter schemes by category
  const filteredSchemes = selectedCategory === 'All'
    ? schemeResults
    : schemeResults.filter(scheme => scheme.category === selectedCategory);

  // Function to handle PDF download (mock functionality)
  const handleDownload = () => {
    alert('Download functionality would generate a PDF with all scheme details in a production environment.');
  };

  // Function to handle sharing (mock functionality)
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Government Schemes for Women',
        text: 'Check out these government schemes I found using SahayataSakhi!',
        url: window.location.href,
      })
        .catch((error) => console.log('Error sharing:', error));
    } else {
      alert('Share functionality would be available in a production environment.');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {filteredSchemes.length} Scheme{filteredSchemes.length !== 1 ? 's' : ''} Found
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowForm(!setShowForm)}
            className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-colors duration-200"
            title="Toggle form visibility"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
            </svg>
          </button>
          <button
            onClick={handleShare}
            className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-colors duration-200"
            title="Share results"
          >
            <Share2 size={20} />
          </button>
          <button
            onClick={handleDownload}
            className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-colors duration-200"
            title="Download as PDF"
          >
            <Download size={20} />
          </button>
        </div>
      </div>

      {/* Categories filter */}
      <div className="mb-6">
        <div className="flex items-center mb-3">
          <Filter size={16} className="text-gray-500 mr-2" />
          <h3 className="text-sm font-medium text-gray-700">Filter by Category</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 text-sm rounded-full transition-colors duration-200 ${selectedCategory === category
                  ? 'bg-purple-100 text-purple-700 font-medium'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Schemes list */}
      <div className="space-y-6">
        {filteredSchemes.map((scheme, index) => (
          <SchemeCard
            key={scheme.name}
            scheme={scheme}
            expanded={expanded}
          />
        ))}
      </div>

      {/* Expand/Collapse all button */}
      {filteredSchemes.length > 0 && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setExpanded(prev => !prev)}
            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200"
          >
            {expanded ? 'Collapse All' : 'Expand All'} Details
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <button
            onClick={clearResults}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200"
          >
            Clear Results
          </button>
          <button
            onClick={fetchSchemes}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-200 flex items-center justify-center"
          >
            <RefreshCw size={16} className="mr-2" /> Refresh Results
          </button>
        </div>
      </div>
    </div>
  );
};

// Hero Section Component (simplified)
const HeroSection = () => {
  return (
    <div className="mb-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Find Government Schemes <span className="text-pink-600">Just For You</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover government schemes and programs that you're eligible for based on your profile. No more searching through complex websites.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-3xl font-bold text-pink-600">80+</p>
          <p className="text-gray-600 mt-2">Active Schemes</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-3xl font-bold text-pink-600">5+</p>
          <p className="text-gray-600 mt-2">Categories</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-3xl font-bold text-pink-600">100%</p>
          <p className="text-gray-600 mt-2">Free Service</p>
        </div>
      </div>
    </div>
  );
};

// Main SchemesFinderPage Component
const SchemesFinderPage = () => {
  const { schemeResults, loading } = useSchemeData();
  const [showForm, setShowForm] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-6 px-4 py-8">
        {/* Show hero section only when no results are displayed */}
        

        <section className="mb-12">
          <div className="bg-gradient-to-r from-pink-600 via-pink-500 to-pink-600 rounded-2xl shadow-xl overflow-hidden">
            <div className="container mx-auto px-6 py-16 flex flex-col items-center text-center text-white">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Discover Government Schemes<br />
                <span className="text-yellow-300">Tailored for Women</span>
              </h1>

              <p className="text-lg max-w-2xl mb-8 text-white/90">
                Find the perfect government schemes and benefits designed to support women across India. Our AI-powered tool matches your profile with eligible programs.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mt-2">
                <a href="#user-details-form"
                  className="bg-white text-pink-700 hover:bg-yellow-300 transition-colors duration-300 py-3 px-8 rounded-full font-semibold flex items-center justify-center shadow-lg">
                  <Search size={18} className="mr-2" />
                  Find Schemes Now
                </a>
              </div>
            </div>
          </div>

          {/* Statistics section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <p className="text-3xl font-bold text-pink-600">80+</p>
              <p className="text-gray-600 mt-2">Active Schemes</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <p className="text-3xl font-bold text-pink-600">15+</p>
              <p className="text-gray-600 mt-2">Categories</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <p className="text-3xl font-bold text-pink-600">28</p>
              <p className="text-gray-600 mt-2">States Covered</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <p className="text-3xl font-bold text-pink-600">100K+</p>
              <p className="text-gray-600 mt-2">Women Helped</p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form section */}
          <div className={` lg:col-span-5 transition-all duration-500 ease-in-out ${!showForm && schemeResults.length > 0 ? 'lg:col-span-4' : 'lg:col-span-5'}`}>
            <UserDetailsForm />
          </div>

          {/* Results section */}
          <div className={`lg:col-span-7 transition-all duration-500 ease-in-out ${!showForm && schemeResults.length > 0 ? 'lg:col-span-8' : 'lg:col-span-7'}`}>
            <SchemeResults setShowForm={setShowForm} />
          </div>
        </div>
      </main>
    </div>
  );
};

// Main GovernmentSchemes Component
const GovernmentSchemes = () => {
  return (
    <div>

      <SchemeDataProvider>
        <SchemesFinderPage />
      </SchemeDataProvider>
    </div>
  );
};

export default GovernmentSchemes;