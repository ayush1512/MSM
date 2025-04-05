import React, { useState, useEffect, useRef } from 'react';
import axios from "axios";
import "./LoginPage.css";

export default function LoginPage() {
  const containerRef = useRef(null);
  
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

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/signup", formData);
      alert(response.data.message);
    } catch (error) {
      alert(error.response?.data?.error || "Signup failed");
    }
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
                <form onSubmit={handleSubmit}>
                  <div className="input-group">
                    <i className='bx bxs-user'></i>
                    <input name="username" type="text" placeholder="Username"/>
                  </div>
                  <div className="input-group">
                    <i className='bx bx-mail-send'></i>
                    <input name="email" type="email" placeholder="Email"/>
                  </div>
                  <div className="input-group">
                    <i className='bx bxs-lock-alt'></i>
                    <input type="password" name="password" placeholder="Password"/>
                  </div>
                  <div className="input-group">
                    <i className='bx bxs-lock-alt'></i>
                    <input type="password" placeholder="Confirm password"/>
                  </div>
                  <button type="submit">
                    Sign up
                  </button>
                </form>
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
                <div className="input-group">
                  <i className='bx bxs-user'></i>
                  <input type="text" placeholder="Username"/>
                </div>
                <div className="input-group">
                  <i className='bx bxs-lock-alt'></i>
                  <input type="password" placeholder="Password"/>
                </div>
                <button>
                  Sign in
                </button>
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