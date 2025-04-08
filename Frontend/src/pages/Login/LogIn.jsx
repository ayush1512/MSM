import React, { useState } from 'react';
import axios from "axios";
import styles from "./LoginPage.module.css";

export default function LogIn(){
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:5000/user/login",{
                    email: formData.email,
                    password: formData.password,
                }
                , { withCredentials: true });
            alert(response.data.message);
        } catch (error) {
            alert(error.response?.data?.error || "Login failed");
        }
    };

    return(
        <form className="flex flex-col" onSubmit={handleSubmit}>
            <input className='h-12 border rounded-xl bg-white border-gray-300 p-3 mb-3 flex items-center justify-center text-sm outline-none dark:!border-white/10 dark:text-white' name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
            <input className='h-12 border rounded-xl bg-white border-gray-300 p-3 mb-3 flex items-center justify-center text-sm outline-none dark:!border-white/10 dark:text-white' type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
            <button 
                className="w-full py-2.5 px-4 bg-gray-800 text-white font-medium rounded-lg transition duration-200 ease-in-out"
                type="submit"
            >
                Sign in
            </button>
        </form>
    )
}