import React, { useState } from 'react';

const LoginPage = () => {
  // Toggle between login and registration forms
  const [isLogin, setIsLogin] = useState(true);

  // State for login form
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // State for registration form
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Handle form toggling
  const handleToggle = () => {
    setIsLogin(!isLogin);
  };

  // Handle changes for login form
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
  };

  // Handle changes for registration form
  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData({ ...registerData, [name]: value });
  };

  // Handle login form submission
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    // Add your login logic here
    console.log("Login Data:", loginData);
  };

  // Handle registration form submission
  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    // Simple check for matching passwords
    if (registerData.password !== registerData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    // Add your registration logic here
    console.log("Registration Data:", registerData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded shadow">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isLogin ? "Login" : "Register"}
        </h2>

        {isLogin ? (
          <form onSubmit={handleLoginSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={loginData.email}
                onChange={handleLoginChange}
                className="w-full border p-2 rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="block text-gray-700">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={loginData.password}
                onChange={handleLoginChange}
                className="w-full border p-2 rounded"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            >
              Login
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit}>
            <div className="mb-4">
              <label htmlFor="username" className="block text-gray-700">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={registerData.username}
                onChange={handleRegisterChange}
                className="w-full border p-2 rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={registerData.email}
                onChange={handleRegisterChange}
                className="w-full border p-2 rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="block text-gray-700">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={registerData.password}
                onChange={handleRegisterChange}
                className="w-full border p-2 rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="confirmPassword" className="block text-gray-700">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={registerData.confirmPassword}
                onChange={handleRegisterChange}
                className="w-full border p-2 rounded"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
            >
              Register
            </button>
          </form>
        )}

        <div className="mt-4 text-center">
          <button onClick={handleToggle} className="text-blue-600 hover:underline">
            {isLogin ? "Don't have an account? Register here." : "Already have an account? Login here."}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
