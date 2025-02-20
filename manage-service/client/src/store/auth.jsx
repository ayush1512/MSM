import { children, createContext, useContext, useEffect, useState } from "react";

// Context
export const AuthContext = createContext();
// const AuthcontextProvider = AuthContext.Provider();

// provider
export const AuthProvider = ({ children }) => {

    const [token, setToken] = useState(localStorage.getItem("token"));
    const [user, setUser] = useState("");
    const [services, setServices] = useState("");

    const storetokenInLS = (serverToken) => {
        return localStorage.setItem("token", serverToken);
    }
    let isLoggedIn = !!token; // agr token ki value h to true ya token me koi value nhi h to false
    console.log(isLoggedIn);

    // Logout Functionality
    const LogoutUser = () => {
        setToken("");
        return localStorage.removeItem("token"); 
    }
     // # 31
    const userAuthentication = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/auth/user",{
                method: "GET",
                headers:{
                    Authorization: `Bearer ${token}`,
                }
            });
            if(response.ok){
                const data = await response.json();
                console.log("user data", data.userData);
                setUser(data.userData);
            }
        } catch (error) {
            console.log("Error fetching user data")
        }
    }

    useEffect(() => {
        userAuthentication();
    },[]);

    // Services
    const getServices = async() => {
        try {
            const response = await fetch(`http://localhost:5000/api/data/services`, {
                method: "GET",
            });
            if (response.ok) {
                const data = await response.json();
                console.log(data.msg); // .msg ka use kiya console me dekh ke 
                setServices(data.msg);
            }
        } catch (error) {
            console.log(`Services error from frontend ${error}`);
        }
    }
    useEffect(()=> {
        getServices();
    },[]);

    return (
        <AuthContext.Provider value={{ isLoggedIn, storetokenInLS, LogoutUser, user, services}}>
            {children}
        </AuthContext.Provider>
    )
};

// Consumer
export const useAuth = () => {
    const authContextvalue = useContext(AuthContext);
    if (!authContextvalue) {
        throw new Error("useAuth used outsideof the Provider");
    }
    return authContextvalue;
}


