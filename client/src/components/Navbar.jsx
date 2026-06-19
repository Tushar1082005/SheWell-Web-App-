import React, { useState, useRef, useEffect } from 'react';
import { Link } from "react-router-dom";
import { Shield, ChevronDown, Globe, User, LogOut, Bell, File } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { setAuth, setUser } from "../redux/slices/loginSlice";
import axios from "axios";
import SOSButton from "./SOSButton";
import { useLanguage } from "../LanguageContext";

function Navbar() {
  const isloggedin = useSelector(state => state.login.isAuth);
  const dispatch = useDispatch();
  const { language, setLanguage, t } = useLanguage();
  
  const [isPeriodCareDropdownOpen, setIsPeriodCareDropdownOpen] = useState(false);
  const [isAIHealthDropdownOpen, setIsAIHealthDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  
  const periodCareDropdownRef = useRef(null);
  const aiHealthDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:3001/api/shewell/logout");
      dispatch(setAuth(false));
      dispatch(setUser({}));
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (periodCareDropdownRef.current && !periodCareDropdownRef.current.contains(event.target)) {
        setIsPeriodCareDropdownOpen(false);
      }
      if (aiHealthDropdownRef.current && !aiHealthDropdownRef.current.contains(event.target)) {
        setIsAIHealthDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center w-[95%] mx-auto">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <Shield className="h-6 w-6 text-primary" />
          <span>SheWell</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 justify-center items-center">
          {isloggedin && (
            <>
              {/* Period Care Dropdown */}
              <div className="relative" ref={periodCareDropdownRef}>
                <button 
                  onClick={() => setIsPeriodCareDropdownOpen(!isPeriodCareDropdownOpen)}
                  className="flex items-center text-sm font-medium"
                >
                  {t('periodCare')}
                  <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-200 ${isPeriodCareDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isPeriodCareDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white border rounded-md shadow-lg">
                    <Link 
                      to="/period-tracker" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsPeriodCareDropdownOpen(false)}
                    >
                      {t('periodTracker')}
                    </Link>
                    <Link 
                      to="/pad-locator" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsPeriodCareDropdownOpen(false)}
                    >
                      {t('padLocator')}
                    </Link>
                    <Link 
                      to="/health-advice" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsAIHealthDropdownOpen(false)}
                    >
                      {t('healthAdvice')}
                    </Link>
                  </div>
                )}
              </div>

              {/* AI & Health Dropdown */}
              <div className="relative" ref={aiHealthDropdownRef}>
                <button 
                  onClick={() => setIsAIHealthDropdownOpen(!isAIHealthDropdownOpen)}
                  className="flex items-center text-sm font-medium"
                >
                  <Link 
                      to="/chatbot" 
                      className="block px-4 py-2 text-sm text-black hover:bg-pink-400/20 rounded-md"
                      onClick={() => setIsAIHealthDropdownOpen(false)}
                    >
                      {t('aiChatbot')}
                    </Link>
                    <Link 
                      to="/community" 
                      className="block px-4 py-2 text-sm text-black hover:bg-pink-400/20 rounded-md"
                      onClick={() => setIsAIHealthDropdownOpen(false)}
                    >
                      {t('community')}
                    </Link>
                </button>
                
              </div>

              <Link to="/government-schemes" className="text-sm font-medium rounded-md hover:bg-pink-400/20 p-2" title="Government Schemes">
                {t('governmentSchemes')}
              </Link>

              {/* User Dropdown Menu */}
              <div className="relative" ref={userDropdownRef}>
                <button 
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center text-sm font-medium text-black px-3 py-2 rounded hover:bg-pink-400/30 active:scale-95 transition duration-200"
                >
                  <User className="h-4 w-4 mr-1" />
                  {t('profile')}
                  <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isUserDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white border rounded-md shadow-lg">
                    {/* Language Options */}
                    <div className="px-4 py-2 border-b">
                      <div className="text-xs text-gray-500 mb-1">{t('language')}</div>
                      <div className="flex gap-2">
                        <button 
                          className={`px-2 py-1 text-xs rounded ${language === 'english' ? 'bg-pink-100 text-pink-500' : 'text-gray-700 hover:bg-gray-100'}`}
                          onClick={() => setLanguage('english')}
                        >
                          English
                        </button>
                        <button 
                          className={`px-2 py-1 text-xs rounded ${language === 'hindi' ? 'bg-pink-100 text-pink-500' : 'text-gray-700 hover:bg-gray-100'}`}
                          onClick={() => setLanguage('hindi')}
                        >
                          हिंदी
                        </button>
                      </div>
                    </div>
                    
                    {/* SOS Button */}
                    <Link 
                      className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      to="/file-upload"
                      onClick={() => setIsUserDropdownOpen(false)}
                    >
                      <File className="h-4 w-4 mr-[4px]" />
                      Upload Documents
                    </Link>

                    {/* OS Button */}
                    <button 
                      className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        // Trigger SOS functionality
                        document.getElementById('sos-button').click();
                      }}
                    >
                      <Bell className="h-4 w-4 mr-2" />
                      {t('sendSOS')}
                    </button>
                    
                    {/* Logout Button */}
                    <button 
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        handleLogout();
                        setIsUserDropdownOpen(false);
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      {t('logout')}
                    </button>
                  </div>
                )}
              </div>
              
              {/* Hidden SOS button that can be triggered programmatically */}
              <div className="hidden">
                <SOSButton id="sos-button" />
              </div>
            </>
          )}
          {!isloggedin && (
            <>
              <Link to="/signup" className="text-sm font-medium bg-pink-500 text-white px-4 py-2 rounded" title="Sign Up">
                {t('signUp')}
              </Link>
              <Link to="/login" className="text-sm font-medium bg-pink-500 text-white px-4 py-2 rounded" title="Login">
                {t('login')}
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;