import React, { useState, useEffect } from 'react';
import { auth } from '../services/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { BsFillShieldLockFill, BsTelephoneFill } from 'react-icons/bs';
import { CgSpinner } from 'react-icons/cg';
import OtpInput from 'otp-input-react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { toast, Toaster } from 'react-hot-toast';
import CompanyIcon from '../assets/CompanyIcon.png';

function LoginModal({ onClose }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Setup reCAPTCHA only once
  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      });
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      // Ensure the phone number has the correct length and format
      if (!phoneNumber || phoneNumber.length < 10) {
        toast.error("Please enter a valid phone number.");
        setLoading(false);
        return;
      }
  
      // Ensure the phone number is in the correct format
      const formattedNumber = `+${phoneNumber.trim()}`;  // Ensure there are no extra spaces
  
      // Check if the number exceeds Firebase's length limit for valid phone numbers
      if (formattedNumber.length > 15) {
        toast.error("Phone number is too long. Please check the number.");
        setLoading(false);
        return;
      }
  
      setupRecaptcha(); // Initialize reCAPTCHA before sending OTP
  
      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, formattedNumber, appVerifier);
  
      setConfirmationResult(confirmation);
      setShowOtp(true);
      setLoading(false);
      toast.success("OTP sent successfully!");
  
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast.error('Error sending OTP. Please try again.');
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await confirmationResult.confirm(otp);
      console.log(userCredential);
      const user = userCredential.user;
  
      // Simulate user role fetching (fetch from backend in production)
      const fetchedUser = {
        id: user.uid,
        phone: user.phoneNumber,
        role: user.phoneNumber === "+918788171162" ? "admin" : "user", // Example logic
      };
  
      localStorage.setItem("user", JSON.stringify(fetchedUser));
  
      toast.success("Login successful!");
      onClose();
      setLoading(false);
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error("Error verifying OTP. Please try again.");
      setLoading(false);
    }
  };
  

  // Cleanup reCAPTCHA when logging out
  const cleanupRecaptcha = () => {
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear(); // Clear the reCAPTCHA instance
      window.recaptchaVerifier = null; // Remove the instance
    }
  };

  // Initialize reCAPTCHA when the component is mounted and on login
  useEffect(() => {
    if (!window.recaptchaVerifier) {
      setupRecaptcha();
    }

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);

    return () => {
      cleanupRecaptcha(); // Cleanup reCAPTCHA on unmount or logout
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]); // Cleanup when the component unmounts

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
        <div className="bg-white p-6 rounded-lg w-96 shadow-lg flex flex-col items-center space-y-4">
          <button
            className="absolute top-2 right-2 text-gray-700 text-2xl"
            onClick={onClose}
          >
            &times;
          </button>

          <div className="flex flex-col space-y-2">
            <img
              src={CompanyIcon}
              alt="Company Logo"
              className="w-32 h-12 mx-auto block"
            />

            {!showOtp ? (
              <>
                <div className="bg-white text-emerald-500 w-fit mx-auto p-4 rounded-full">
                  <BsTelephoneFill size={30} />
                </div>
                <label htmlFor="phone" className="font-bold text-xl text-center">
                  Verify your phone number
                </label>
                <PhoneInput
                  country="in"
                  value={phoneNumber}
                  onChange={setPhoneNumber}
                  inputProps={{
                    name: 'phone',
                    required: true,
                    autoFocus: true,
                  }}
                />
                <button
                  onClick={handleSendOtp}
                  className={`bg-emerald-600 w-full flex gap-1 items-center justify-center py-2.5 text-white rounded ${
                    !phoneNumber ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={!phoneNumber}
                >
                  {loading && (
                    <CgSpinner size={20} className="mt-1 animate-spin" />
                  )}
                  <span>Send OTP</span>
                </button>
              </>
            ) : (
              <>
                <div className="bg-white text-emerald-500 w-fit mx-auto p-4 rounded-full">
                  <BsFillShieldLockFill size={30} />
                </div>
                <label htmlFor="otp" className="font-bold text-xl text-center">
                  Enter your OTP
                </label>
                <OtpInput
                  value={otp}
                  onChange={setOtp}
                  OTPLength={6}
                  otpType="number"
                  autoFocus
                  className="opt-container"
                />
                <button
                  onClick={handleVerifyOtp}
                  className="bg-emerald-600 w-full flex gap-1 items-center justify-center py-2.5 text-white rounded"
                  disabled={otp.length !== 6 || loading}
                >
                  {loading && <CgSpinner size={20} className="mt-1 animate-spin" />}
                  <span>Verify OTP</span>
                </button>
              </>
            )}
          </div>

          <div className="pl-6 text-sm text-gray-500 mt-2">
            By clicking, I accept the{" "}
            <span className="text-blue-600 hover:underline cursor-pointer">
              Terms of Service
            </span>{" "}
            &{" "}
            <span className="text-blue-600 hover:underline cursor-pointer">
              Privacy Policy
            </span>
          </div>
        </div>
      </div>
      <div id="recaptcha-container"></div> {/* This ensures reCAPTCHA is rendered */}
      <Toaster toastOptions={{ duration: 4000 }} />
    </>
  );
}

export default LoginModal;
