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
        <form onSubmit={handleSubmit}>
            <div className={styles['input-group']}>
                <i className='bx bxs-user'></i>
                <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className={styles['input-group']}>
                <i className='bx bxs-lock-alt'></i>
                <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
            </div>
            <button>
                Sign in
            </button>
        </form>
    )
}