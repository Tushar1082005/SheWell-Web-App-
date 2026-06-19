import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setAuth } from '../redux/slices/loginSlice';
import gsap from 'gsap';

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Refs for GSAP animations
  const formRef = useRef(null);
  const logoRef = useRef(null);
  const titleRef = useRef(null);
  const inputsRef = useRef([]);
  const buttonRef = useRef(null);
  const footerRef = useRef(null);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success' // 'success', 'error'
  });

  // Initialize GSAP animations on component mount
  useEffect(() => {
    // Initial animation timeline
    const tl = gsap.timeline();
    
    // Fade in and slight slide up for the form container
    tl.from(formRef.current, { 
      duration: 0.8, 
      y: 40, 
      opacity: 0, 
      ease: "power3.out" 
    });
    
    // Logo animation with bounce effect
    tl.from(logoRef.current, { 
      duration: 0.6, 
      scale: 0.5, 
      opacity: 0, 
      ease: "back.out(1.7)",
    }, "-=0.4");
    
    // Title animation
    tl.from(titleRef.current, { 
      duration: 0.5, 
      y: 20, 
      opacity: 0, 
      ease: "power2.out" 
    }, "-=0.2");
    
    // Staggered animation for input fields
    tl.from(inputsRef.current, { 
      duration: 0.5, 
      y: 20, 
      opacity: 0, 
      stagger: 0.1, 
      ease: "power2.out" 
    }, "-=0.2");
    
    // Button animation
    tl.from(buttonRef.current, { 
      duration: 0.5, 
      scale: 0.9,
      opacity: 0, 
      ease: "power2.out",
    }, "-=0.1").set(buttonRef.current, { scale: 1, opacity: 1 });
    
    // Footer animation
    tl.from(footerRef.current, { 
      duration: 0.5, 
      y: 10, 
      opacity: 0, 
      ease: "power2.out" 
    }, "-=0.3");
    
    return () => {
      // Clean up animations when component unmounts
      tl.kill();
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    
    // Animate toast notification
    if (toast.show) {
      gsap.to(".toast-notification", {
        duration: 0.3,
        opacity: 0,
        y: -10,
        onComplete: () => {
          setToast({ show: true, message, type });
          animateToastIn();
        }
      });
    } else {
      setToast({ show: true, message, type });
      animateToastIn();
    }
    
    // Auto-hide toast after 3 seconds
    setTimeout(() => {
      gsap.to(".toast-notification", {
        duration: 0.5,
        opacity: 0,
        y: -20,
        onComplete: () => setToast({ show: false, message: '', type: 'success' })
      });
    }, 3000);
  };
  
  const animateToastIn = () => {
    gsap.fromTo(".toast-notification", 
      { opacity: 0, y: -20 },
      { duration: 0.5, opacity: 1, y: 0, ease: "power3.out" }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Add button click animation
    gsap.to(buttonRef.current, {
      duration: 0.1,
      scale: 0.95,
      yoyo: true,
      repeat: 1
    });
    
    fetch('http://localhost:3001/api/shewell/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
      if (data.message === 'User logged in successfully') {
        showToast('Login successful!', 'success');
        dispatch(setAuth(true));
        
        // Success animation and redirect
        gsap.to(formRef.current, {
          duration: 0.8,
          y: -20,
          opacity: 0,
          delay: 0.7,
          onComplete: () => navigate('/')
        });
      } else {
        showToast(data.message || 'Login failed', 'error');
        
        // Error shake animation for form
        gsap.to(formRef.current, {
          duration: 0.1,
          x: 10,
          yoyo: true,
          repeat: 5
        });
      }
    })
    .catch(err => {
      showToast(err.message || 'An error occurred', 'error');
      
      // Error shake animation for form
      gsap.to(formRef.current, {
        duration: 0.1,
        x: 10,
        yoyo: true,
        repeat: 5
      });
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-pink-50 to-pink-100">
      {/* Toast notification */}
      {toast.show && (
        <div className={`toast-notification fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg max-w-xs flex items-center space-x-2 ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {toast.type === 'success' ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )}
          <p>{toast.message}</p>
          <button 
            onClick={() => {
              gsap.to(".toast-notification", {
                duration: 0.3,
                opacity: 0,
                y: -20,
                onComplete: () => setToast({...toast, show: false})
              });
            }}
            className="ml-auto text-white hover:text-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      <div ref={formRef} className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8 border border-pink-200 my-4">
        <div className="flex justify-center mb-6">
          <div ref={logoRef} className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
          </div>
        </div>
        
        <h2 ref={titleRef} className="text-3xl font-bold text-center mb-8 text-pink-600">
          Welcome Back
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div ref={el => inputsRef.current[0] = el}>
            <label 
              htmlFor="email" 
              className="block text-sm font-medium text-pink-700 mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition duration-300 bg-pink-50 placeholder-pink-300"
              placeholder="your.email@example.com"
            />
          </div>
          
          <div ref={el => inputsRef.current[1] = el}>
            <label 
              htmlFor="password" 
              className="block text-sm font-medium text-pink-700 mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition duration-300 bg-pink-50 placeholder-pink-300"
              placeholder="Enter your password"
            />
          </div>
          
          <div ref={el => inputsRef.current[2] = el} className="flex justify-end">
            <Link 
              to="/forgot-password" 
              className="text-sm text-pink-600 hover:text-pink-800 hover:underline transition duration-300"
              onMouseEnter={(e) => {
                gsap.to(e.currentTarget, {
                  duration: 0.3,
                  color: "#9d174d", // pink-800
                  y: -2
                });
              }}
              onMouseLeave={(e) => {
                gsap.to(e.currentTarget, {
                  duration: 0.3,
                  color: "#db2777", // pink-600
                  y: 0
                });
              }}
            >
              Forgot Password?
            </Link>
          </div>
          
          <button
            ref={buttonRef}
            type="submit"
            className="w-full bg-pink-600 text-white py-3 rounded-lg hover:bg-pink-700 transition duration-300 transform active:scale-95 font-semibold shadow-md hover:shadow-lg mt-4"
            onMouseEnter={(e) => {
              gsap.to(e.currentTarget, {
                duration: 0.3,
                backgroundColor: "#be185d", // pink-700
                scale: 1.02,
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
              });
            }}
            onMouseLeave={(e) => {
              gsap.to(e.currentTarget, {
                duration: 0.3,
                backgroundColor: "#db2777", // pink-600
                scale: 1,
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
              });
            }}
          >
            Sign In
          </button>
        </form>
        
        <div ref={footerRef} className="text-center mt-6 border-t border-pink-100 pt-4">
          <p className="text-sm text-pink-500">
            Don't have an account?{' '}
            <Link 
              to="/signup" 
              className="text-pink-700 font-medium hover:text-pink-800 hover:underline transition duration-300"
              onMouseEnter={(e) => {
                gsap.to(e.currentTarget, {
                  duration: 0.3,
                  color: "#9d174d", // pink-800
                  y: -2
                });
              }}
              onMouseLeave={(e) => {
                gsap.to(e.currentTarget, {
                  duration: 0.3,
                  color: "#be185d", // pink-700
                  y: 0
                });
              }}
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;