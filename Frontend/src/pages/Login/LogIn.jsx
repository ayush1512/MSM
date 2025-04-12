import React, { useState } from 'react';
import axios from "axios";

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
                className="linear mt-2 w-full rounded-xl bg-brand-900 py-[12px] text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200"
                type="submit"
            >
                Sign in
            </button>
        </form>
    )
}