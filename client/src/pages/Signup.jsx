import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setAuth } from '../redux/slices/loginSlice';

function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success' // 'success', 'error'
  });

  const formRef = useRef(null);
  const titleRef = useRef(null);
  const toastRef = useRef(null);

  useEffect(() => {
    // Enhanced GSAP animations
    gsap.fromTo(
      formRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'back.out(1.2)' }
    );
    
    gsap.fromTo(
      titleRef.current,
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 0.6, delay: 0.3, ease: 'elastic.out(1, 0.8)' }
    );
  }, []);

  useEffect(() => {
    if (toast.show) {
      // Animate toast in
      gsap.fromTo(
        toastRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
      );
      
      // Auto-hide toast after 4 seconds
      const timer = setTimeout(() => {
        hideToast();
      }, 4000);
      
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const showToast = (message, type = 'success') => {
    setToast({
      show: true,
      message,
      type
    });
  };

  const hideToast = () => {
    gsap.to(toastRef.current, {
      opacity: 0,
      y: -20,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        setToast({ show: false, message: '', type: 'success' });
      }
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    // Add signup logic here
    // sending the form data to the server:
    fetch('http://localhost:3001/api/shewell/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      if (data.msg === 'User created successfully') {
        showToast('Account created successfully!', 'success');
        dispatch(setAuth(true));
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        showToast(data.msg, 'error');
      }
    })
    .catch(err => {
      console.error(err);
      showToast(err.message, 'error');
    });
    console.log('Signup submitted:', formData);
  };

  const handleHoverAnimation = (element) => {
    gsap.to(element, {
      scale: 1.05,
      duration: 0.2,
      ease: 'power1.inOut'
    });
  };

  const handleMouseLeave = (element) => {
    gsap.to(element, {
      scale: 1,
      duration: 0.2,
      ease: 'power1.inOut'
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-pink-50 to-pink-100">
      {/* Toast notification */}
      {toast.show && (
        <div
          ref={toastRef}
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg max-w-xs flex items-center space-x-2 ${
            toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white`}
        >
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
            onClick={hideToast}
            className="ml-auto text-white hover:text-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      <div 
        ref={formRef} 
        className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8 border border-pink-200 my-4"
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>
        
        <h2 
          ref={titleRef}
          className="text-3xl font-bold text-center mb-8 text-pink-600"
          onMouseEnter={(e) => handleHoverAnimation(e.target)}
          onMouseLeave={(e) => handleMouseLeave(e.target)}
        >
          Join Us Today
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label 
              htmlFor="username" 
              className="block text-sm font-medium text-pink-700 mb-2"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition duration-300 bg-pink-50 placeholder-pink-300"
              placeholder="Enter your username"
              onMouseEnter={(e) => handleHoverAnimation(e.target)}
              onMouseLeave={(e) => handleMouseLeave(e.target)}
            />
          </div>
          
          <div>
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
              onMouseEnter={(e) => handleHoverAnimation(e.target)}
              onMouseLeave={(e) => handleMouseLeave(e.target)}
            />
          </div>
          
          <div>
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
              placeholder="Create a strong password"
              onMouseEnter={(e) => handleHoverAnimation(e.target)}
              onMouseLeave={(e) => handleMouseLeave(e.target)}
            />
          </div>
          
          <div>
            <label 
              htmlFor="confirmPassword" 
              className="block text-sm font-medium text-pink-700 mb-2"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition duration-300 bg-pink-50 placeholder-pink-300"
              placeholder="Confirm your password"
              onMouseEnter={(e) => handleHoverAnimation(e.target)}
              onMouseLeave={(e) => handleMouseLeave(e.target)}
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-pink-600 text-white py-3 rounded-lg hover:bg-pink-700 transition duration-300 transform active:scale-95 font-semibold shadow-md hover:shadow-lg mt-4"
            onMouseEnter={(e) => handleHoverAnimation(e.target)}
            onMouseLeave={(e) => handleMouseLeave(e.target)}
          >
            Create Account
          </button>
        </form>
        
        <div className="text-center mt-6 border-t border-pink-100 pt-4">
          <p className="text-sm text-pink-500">
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="text-pink-700 font-medium hover:text-pink-800 hover:underline transition duration-300"
              onMouseEnter={(e) => handleHoverAnimation(e.target)}
              onMouseLeave={(e) => handleMouseLeave(e.target)}
            >
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;