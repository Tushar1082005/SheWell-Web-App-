import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';

function ForgotPassword() {
  const [formData, setFormData] = useState({
    email: ''
  });
  const [step, setStep] = useState('email');
  const [otp, setOtp] = useState(new Array(6).fill(''));

  const formRef = useRef(null);

  useEffect(() => {
    // GSAP Animation for form entrance
    gsap.fromTo(
      formRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }
    );
  }, [step]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Move to next input
    if (element.nextSibling && element.value) {
      element.nextSibling.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
      
      // Move to previous input
      if (e.target.previousSibling) {
        e.target.previousSibling.focus();
      }
    }
  };

  const handleSendOTP = (e) => {
    e.preventDefault();
    // Simulate OTP sending logic
    console.log('Sending OTP to:', formData.email);
    setStep('otp');
  };

  const handleVerifyOTP = (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    
    // Verify OTP logic
    console.log('Verifying OTP:', otpCode);
    setStep('reset');
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    // Reset password logic
    console.log('Resetting password for:', formData.email);
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

  const renderEmailStep = () => (
    <form onSubmit={handleSendOTP} className="space-y-6">
      <div>
        <label 
          htmlFor="email" 
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Enter your email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
          onMouseEnter={(e) => handleHoverAnimation(e.target)}
          onMouseLeave={(e) => handleMouseLeave(e.target)}
        />
      </div>
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300 transform active:scale-95"
        onMouseEnter={(e) => handleHoverAnimation(e.target)}
        onMouseLeave={(e) => handleMouseLeave(e.target)}
      >
        Send OTP
      </button>
    </form>
  );

  const renderOTPStep = () => (
    <form onSubmit={handleVerifyOTP} className="space-y-6">
      <div className="text-center mb-4">
        <p className="text-gray-600">
          Enter the 6-digit OTP sent to {formData.email}
        </p>
      </div>
      <div className="flex justify-center space-x-2">
        {otp.map((data, index) => (
          <input
            key={index}
            type="text"
            maxLength="1"
            value={data}
            onChange={(e) => handleOtpChange(e.target, index)}
            onKeyDown={(e) => handleOtpKeyDown(e, index)}
            className="w-12 h-12 text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        ))}
      </div>
      <button
        type="submit"
        className="w-full mt-6 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition duration-300 transform active:scale-95"
        onMouseEnter={(e) => handleHoverAnimation(e.target)}
        onMouseLeave={(e) => handleMouseLeave(e.target)}
      >
        Verify OTP
      </button>
      <div className="text-center mt-4">
        <button 
          type="button"
          onClick={() => setStep('email')}
          className="text-blue-600 hover:underline"
        >
          Change Email
        </button>
      </div>
    </form>
  );

  const renderResetPasswordStep = () => (
    <form onSubmit={handleResetPassword} className="space-y-6">
      <div>
        <label 
          htmlFor="password" 
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          New Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
          onMouseEnter={(e) => handleHoverAnimation(e.target)}
          onMouseLeave={(e) => handleMouseLeave(e.target)}
        />
      </div>
      <div>
        <label 
          htmlFor="confirmPassword" 
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Confirm New Password
        </label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
          onMouseEnter={(e) => handleHoverAnimation(e.target)}
          onMouseLeave={(e) => handleMouseLeave(e.target)}
        />
      </div>
      <button
        type="submit"
        className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition duration-300 transform active:scale-95"
        onMouseEnter={(e) => handleHoverAnimation(e.target)}
        onMouseLeave={(e) => handleMouseLeave(e.target)}
      >
        Reset Password
      </button>
    </form>
  );

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div 
        ref={formRef} 
        className="w-full max-w-md bg-white shadow-2xl rounded-xl p-8 border border-gray-200"
      >
        <h2 
          className="text-3xl font-bold text-center mb-8 text-gray-800"
          onMouseEnter={(e) => handleHoverAnimation(e.target)}
          onMouseLeave={(e) => handleMouseLeave(e.target)}
        >
          {step === 'email' ? 'Forgot Password' : 
           step === 'otp' ? 'Verify OTP' : 
           'Reset Password'}
        </h2>
        
        {step === 'email' && renderEmailStep()}
        {step === 'otp' && renderOTPStep()}
        {step === 'reset' && renderResetPasswordStep()}
      </div>
    </div>
  );
}

export default ForgotPassword;