import React, { useState, useEffect, useRef } from 'react';
import axios from "axios";
import SignUp from "./SignUp";
import LogIn from "./LogIn";
import styles from "./LoginPage.module.css";
import googleLogo from '../../assets/google-logo.png';

export default function LoginPage() {
  const containerRef = useRef(null);
  const [queryParams] = useState(new URLSearchParams(window.location.search));
  const [authError] = useState(queryParams.get('error'));

  const toggle = () => {
    const container = containerRef.current;
    if (container) {
      container.classList.toggle(styles['sign-in']);
      container.classList.toggle(styles['sign-up']);
    }
  };

  useEffect(() => {
    // Use setTimeout to add sign-in class after component mounts
    const timeoutId = setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.classList.add(styles['sign-in']);
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
      <div id="container" className={`${styles.container} ${styles.loginPage}`} ref={containerRef}>
        {/* -- FORM SECTION -- */}
        <div className={styles.row}>
          {/* -- SIGN UP -- */}
          <div className={`${styles.col} ${styles['align-items-center']} ${styles['flex-col']} ${styles['sign-up']}`}>
            <div className={`${styles['form-wrapper']} ${styles['align-items-center']}`}>
              <div className={`${styles.form} ${styles['sign-up']}`}>
                <SignUp />
                <div className={styles['social-divider']}>
                  <span>OR</span>
                </div>
                <button className={styles['google-btn']} onClick={handleGoogleAuth} type="button">
                  <img src={googleLogo} alt="Google" />
                  Continue with Google
                </button>
                <p className={styles['auth-help-text']}>
                  By continuing with Google, a new account will be created if you don't have one already.
                </p>
                <p>
                  <span>
                    Already have an account?
                  </span>
                  <b onClick={toggle} className={styles.pointer}>
                    Sign in here
                  </b>
                </p>
              </div>
            </div>
          </div>
          {/* -- END SIGN UP -- */}
          {/* -- SIGN IN -- */}
          <div className={`${styles.col} ${styles['align-items-center']} ${styles['flex-col']} ${styles['sign-in']}`}>
            <div className={`${styles['form-wrapper']} ${styles['align-items-center']}`}>
              <div className={`${styles.form} ${styles['sign-in']}`}>
                <LogIn />
                <div className={styles['social-divider']}>
                  <span>OR</span>
                </div>
                <button className={styles['google-btn']} onClick={handleGoogleAuth} type="button">
                  <img src={googleLogo} alt="Google" />
                  Continue with Google
                </button>
                <p className={styles['auth-help-text']}>
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
                  <b onClick={toggle} className={styles.pointer}>
                    Sign up here
                  </b>
                </p>
              </div>
            </div>
            <div className={styles['form-wrapper']}>
            </div>
          </div>
          {/* -- END SIGN IN -- */}
        </div>
        {/* <!-- END FORM SECTION --> */}
        {/* <!-- CONTENT SECTION --> */}
        <div className={`${styles.row} ${styles['content-row']}`}>
          {/* <!-- SIGN IN CONTENT --> */}
          <div className={`${styles.col} ${styles['align-items-center']} ${styles['flex-col']}`}>
            <div className={`${styles.text} ${styles['sign-in']}`}>
              <h2>
                Welcome
              </h2>
            </div>
            <div className={`${styles.img} ${styles['sign-in']}`}>
            </div>
          </div>
          {/* <!-- END SIGN IN CONTENT --> */}
          {/* <!-- SIGN UP CONTENT --> */}
          <div className={`${styles.col} ${styles['align-items-center']} ${styles['flex-col']}`}>
            <div className={`${styles.img} ${styles['sign-up']}`}>
            </div>
            <div className={`${styles.text} ${styles['sign-up']}`}>
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