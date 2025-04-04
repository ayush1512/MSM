import React, { useState, useEffect, useRef } from 'react';
import axios from "axios";
import SignUp from "./SignUp";
import LogIn from "./LogIn";
import "./LoginPage.css";
import googleLogo from '../../assets/google-logo.png';

export default function LoginPage() {
  const containerRef = useRef(null);
  const [queryParams] = useState(new URLSearchParams(window.location.search));
  const [authError] = useState(queryParams.get('error'));

  const toggle = () => {
    const container = containerRef.current;
    if (container) {
      container.classList.toggle('sign-in');
      container.classList.toggle('sign-up');
    }
  };

  useEffect(() => {
    // Use setTimeout to add sign-in class after component mounts
    const timeoutId = setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.classList.add('sign-in');
      }
    }, 200);
    
    // Clean up timeout on unmount
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    // Show error message if authentication failed
    if (authError === 'auth_failed') {
      alert('Google authentication failed. Please try again or use email/password.');
    }
  }, [authError]);

  const handleGoogleAuth = () => {
    window.location.href = "http://localhost:5000/login/google";
  };

  return (
    <>
      <div id="container" className="container loginPage" ref={containerRef}>
        {/* -- FORM SECTION -- */}
        <div className="row">
          {/* -- SIGN UP -- */}
          <div className="col align-items-center flex-col sign-up">
            <div className="form-wrapper align-items-center">
              <div className="form sign-up">
                <SignUp />
                <div className="social-divider">
                  <span>OR</span>
                </div>
                <button className="google-btn" onClick={handleGoogleAuth} type="button">
                  <img src={googleLogo} alt="Google" />
                  Continue with Google
                </button>
                <p className="auth-help-text">
                  By continuing with Google, a new account will be created if you don't have one already.
                </p>
                <p>
                  <span>
                    Already have an account?
                  </span>
                  <b onClick={toggle} className="pointer">
                    Sign in here
                  </b>
                </p>
              </div>
            </div>
          </div>
          {/* -- END SIGN UP -- */}
          {/* -- SIGN IN -- */}
          <div className="col align-items-center flex-col sign-in">
            <div className="form-wrapper align-items-center">
              <div className="form sign-in">
                <LogIn />
                <div className="social-divider">
                  <span>OR</span>
                </div>
                <button className="google-btn" onClick={handleGoogleAuth} type="button">
                  <img src={googleLogo} alt="Google" />
                  Continue with Google
                </button>
                <p className="auth-help-text">
                  You can sign in with your Google account
                </p>
                <p>
                  <b>
                    Forgot password?
                  </b>
                </p>
                <p>
                  <span>
                    Don't have an account?
                  </span>
                  <b onClick={toggle} className="pointer">
                    Sign up here
                  </b>
                </p>
              </div>
            </div>
            <div className="form-wrapper">
            </div>
          </div>
          {/* -- END SIGN IN -- */}
        </div>
        {/* <!-- END FORM SECTION --> */}
        {/* <!-- CONTENT SECTION --> */}
        <div className="row content-row">
          {/* <!-- SIGN IN CONTENT --> */}
          <div className="col align-items-center flex-col">
            <div className="text sign-in">
              <h2>
                Welcome
              </h2>
            </div>
            <div className="img sign-in">
            </div>
          </div>
          {/* <!-- END SIGN IN CONTENT --> */}
          {/* <!-- SIGN UP CONTENT --> */}
          <div className="col align-items-center flex-col">
            <div className="img sign-up">
            </div>
            <div className="text sign-up">
              <h2>
                Join with us
              </h2>
            </div>
          </div>
          {/* <!-- END SIGN UP CONTENT --> */}
        </div>
        {/* <!-- END CONTENT SECTION --> */}
      </div>
    </>
  );
}