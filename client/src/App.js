import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import PeriodTracker from "./pages/PeriodTracker";
import PadLocator from "./pages/PadLocator";
import {HealthAdvice} from "./pages/HealthAdvice";
import Chatbot from "./pages/Chatbot";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setAuth } from "./redux/slices/loginSlice";
import { LanguageProvider } from "./LanguageContext"; 
import Communty from "./pages/Communty"
import Doctor from "./pages/Doctor";
import {ArticleDetail} from "./pages/HealthAdvice";
import FileUpload from "./FileUpload";
import GovernmentSchemes from "./pages/GovernmentSchemes";

function App() {
  const dispatch = useDispatch();
  const location = useLocation();
  
  const {isAuth} = useSelector(loginSlice => loginSlice.login);


  useEffect(() => {
    fetch('http://localhost:3001/api/shewell/auth', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include' // Include credentials (cookies)
    })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      if (data.msg === 'User exists') {
        dispatch(setAuth(true));
      }
    })
    .catch(err => console.error(err));
  }, [dispatch]);
  
  return (
    <LanguageProvider>
      <div>
        {
          location.pathname === '/login' || 
          location.pathname === '/signup' || 
          location.pathname === '/forgot-password' ? null : <Navbar/>
        }
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/period-tracker" element={isAuth ? <PeriodTracker /> : <Navigate to="/login" />} />
          <Route path="/pad-locator" element={isAuth ? <PadLocator /> : <Navigate to="/login" />} />
          <Route path="/health-advice" element={isAuth ? <HealthAdvice /> : <Navigate to="/login" />} />
          <Route path="/chatbot" element={isAuth ? <Chatbot /> : <Navigate to="/login" />} />
          <Route path="/login" element={isAuth ? <Navigate to='/'/> : <Login />} />
          <Route path="/signup" element={isAuth ? <Navigate to='/'/> : <Signup />} />
          <Route path="/forgot-password" element={isAuth ? <Navigate to='/'/> : <ForgotPassword />} />
          <Route path="/community" element={isAuth ? <Communty /> : <Navigate to="/login" />} />
          <Route path="/doctor" element={isAuth ? <Doctor/> : <Navigate to="/login" />} />
          <Route path="/health-advice/:category/:id" element={isAuth ? <ArticleDetail /> : <Navigate to="/login" />} />
          <Route path="/file-upload" element={<FileUpload />} />
          <Route path="/government-schemes" element={isAuth ? <GovernmentSchemes /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </LanguageProvider>
  );
}

export default App;