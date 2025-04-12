import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LogIn from 'pages/Login/LogIn';
import SignUp from 'pages/Login/SignUp';
import googleLogo from 'assets/google-logo.png';
import styles from 'pages/Login/LoginPage.module.css';
import { useUser } from 'context/UserContext';

export default function LoginPopup({ isOpen, onClose }) {
  const containerRef = useRef(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const { user } = useUser();

  // Close popup when user logs in
  useEffect(() => {
    if (user && isOpen) {
      onClose();
    }
  }, [user, isOpen, onClose]);

  // Set initial form state after component mounts
  useEffect(() => {
    if (isOpen && containerRef.current) {
      // Reset to sign-in view when popup opens
      containerRef.current.classList.remove(styles['sign-up']);
      containerRef.current.classList.add(styles['sign-in']);
    }
  }, [isOpen]);

  // Handle Google auth
  const handleGoogleAuth = () => {
    window.location.href = "http://localhost:5000/login/google";
  };

  // Toggle between sign-in and sign-up forms
  const toggle = () => {
    if (containerRef.current) {
      containerRef.current.classList.toggle(styles['sign-in']);
      containerRef.current.classList.toggle(styles['sign-up']);
      setIsSignUp(!isSignUp);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => {
            // Close only if clicking the backdrop
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div 
            className={`${styles.loginPage} bg-white dark:bg-navy-800 rounded-xl shadow-2xl w-[90%] h-[90%] max-w-screen-xl overflow-hidden`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 15 }}
            onClick={(e) => e.stopPropagation()} // Prevent clicks from closing
          >
            {/* Close button */}
            <div className="absolute right-44 top-11 z-10">
              <motion.button 
                onClick={onClose}
                className="text-gray-900 dark:text-white dark:hover:text-gray-200 focus:outline-none"
                whileHover={{ rotate: 90 }}
                transition={{ duration: 0.2 }}
              >
                <X size={24} />
              </motion.button>
            </div>

            {/* Login container with animations */}
            <div id="container" className={`${styles.container}`} ref={containerRef}>
              {/* FORM SECTION */}
              <div className={styles.row}>
                {/* SIGN UP */}
                <div className={`${styles.col} ${styles['align-items-center']} ${styles['flex-col']} ${styles['sign-up']}`}>
                  <div className={`${styles['form-wrapper']} ${styles['align-items-center']}`}>
                    <div className={`${styles.form} ${styles['sign-up']} dark:bg-navy-800 dark:text-white dark:border-navy-700`}>
                      <button className="mb-6 flex h-[50px] w-full items-center justify-center gap-2 rounded-xl bg-lightPrimary hover:cursor-pointer dark:bg-navy-700 transition-colors" onClick={handleGoogleAuth} type="button">
                        <img className='rounded-full text-xl w-[18px] h-[18px] mr-[8px]' src={googleLogo} alt="Google" />
                        <h5 className="text-sm font-medium text-navy-700 dark:text-white">Sign In with Google</h5>
                      </button>
                      <div className={`${styles['social-divider']} dark:text-gray-400 before:dark:border-gray-700 after:dark:border-gray-700`}>
                        <span>OR</span>
                      </div>
                      <SignUp />
                      <p className="dark:text-gray-400">
                        <span>
                          Already have an account?
                        </span>
                        <b onClick={toggle} className={`${styles.pointer} text-brand-500 dark:text-brand-400 ml-1 hover:underline`}>
                          Sign in here
                        </b>
                      </p>
                    </div>
                  </div>
                </div>
                {/* END SIGN UP */}
                
                {/* SIGN IN */}
                <div className={`${styles.col} ${styles['align-items-center']} ${styles['flex-col']} ${styles['sign-in']}`}>
                  <div className={`${styles['form-wrapper']} ${styles['align-items-center']}`}>
                    <div className={`${styles.form} ${styles['sign-in']} dark:bg-navy-800 dark:text-white dark:border-navy-700`}>
                      <button className="mb-6 flex h-[50px] w-full items-center justify-center gap-2 rounded-xl bg-lightPrimary hover:cursor-pointer dark:bg-navy-700 transition-colors" onClick={handleGoogleAuth} type="button">
                        <img className='rounded-full text-xl w-[18px] h-[18px] mr-[8px]' src={googleLogo} alt="Google" />
                        <h5 className="text-sm font-medium text-navy-700 dark:text-white">Sign In with Google</h5>
                      </button>
                      <div className={`${styles['social-divider']} dark:text-gray-400 before:dark:border-gray-700 after:dark:border-gray-700`}>
                        <span>OR</span>
                      </div>
                      <LogIn />
                      <p className="dark:text-gray-400">
                        <b className="text-brand-500 dark:text-brand-400 hover:underline cursor-pointer">
                          Forgot password?
                        </b>
                      </p>
                      <p className="dark:text-gray-400">
                        <span>
                          Don't have an account?
                        </span>
                        <b onClick={toggle} className={`${styles.pointer} text-brand-500 dark:text-brand-400 ml-1 hover:underline`}>
                          Sign up here
                        </b>
                      </p>
                    </div>
                  </div>
                </div>
                {/* END SIGN IN */}
              </div>
              {/* END FORM SECTION */}
              
              {/* CONTENT SECTION */}
              <div className={`${styles.row} ${styles['content-row']}`}>
                {/* SIGN IN CONTENT */}
                <div className={`${styles.col} ${styles['align-items-center']} ${styles['flex-col']}`}>
                  <div className={`${styles.text} ${styles['sign-in']}`}>
                    <h2 className="dark:text-white">
                      Welcome Back
                    </h2>
                  </div>
                  <div className={`${styles.img} ${styles['sign-in']}`}>
                  </div>
                </div>
                {/* END SIGN IN CONTENT */}
                
                {/* SIGN UP CONTENT */}
                <div className={`${styles.col} ${styles['align-items-center']} ${styles['flex-col']}`}>
                  <div className={`${styles.img} ${styles['sign-up']}`}>
                  </div>
                  <div className={`${styles.text} ${styles['sign-up']}`}>
                    <h2 className="dark:text-white">
                      Join with us
                    </h2>
                  </div>
                </div>
                {/* END SIGN UP CONTENT */}
              </div>
              {/* END CONTENT SECTION */}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
