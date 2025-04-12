import React, { useState, useContext } from 'react';
import axios from "axios";
import styles from "./LoginPage.module.css";
import { UserContext } from "context/UserContext";

export default function LogIn(){
    const { setUser } = useContext(UserContext);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Clear errors when user starts typing
        if (error) setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Basic validation
        if (!formData.email || !formData.password) {
            setError("All fields are required");
            return;
        }

        setLoading(true);
        setError("");
        setSuccess("");
        
        try {
            const response = await axios.post(
                "http://localhost:5000/user/login", 
                {
                    email: formData.email,
                    password: formData.password,
                },
                { withCredentials: true } // Important for session cookies
            );
            
            setSuccess(response.data.message || "Login successful!");
            setUser(response.data.user);
            
            // Reload page after successful login
            setTimeout(() => {
                window.location.reload();
            }, 1000);
            
        } catch (error) {
            console.error("Login error:", error.response?.data);
            setError(error.response?.data?.error || "Login failed. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {error && <div className={styles['error-message']}>{error}</div>}
            {success && <div className={styles['success-message']}>{success}</div>}
            
            <div className={styles['input-group']}>
                <i className='bx bx-mail-send'></i>
                <input 
                    name="email" 
                    type="email" 
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className={styles['input-group']}>
                <i className='bx bxs-lock-alt'></i>
                <input 
                    type="password" 
                    name="password" 
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
            </div>
            <button 
                type="submit"
                disabled={loading}
                className="linear mt-2 w-full rounded-xl bg-brand-900 py-[12px] text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200"
            >
                {loading ? "Processing..." : "Sign in"}
            </button>
        </form>
    );
}