// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// // import Axios from "axios";  // -- (url)

// import "./Style.css"

// export const Register = () => {

//     const [user, setUser] = useState({ //setuser me jo bhi value dalege to vo update ho jayegi user me 
//         username: "",  // ye same hona chahiye name ke
//         email: "",
//         phone: "",
//         password: "",
//     });

//     const navigate = useNavigate();

//     // handling input values
//     const handleInput = (e) => {
//         console.log(e);
//         let name = e.target.name;
//         let value = e.target.value;

//         setUser({
//             ...user, //  spread operator h user ka baki data same rahe baki field ka jisko change nhi kr rhe h 
//             [name]: value,  // dynamic value updatation
//         });
//     };

//     // Handing form submission
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         //  console.log(user);

//         try {
//             // Database me data store karane wala part
//             // const response = await fetch(`http://localhost:8000/api/auth/register`)
//             const response = await fetch("http://localhost:8000/api/auth/register", {
//                 method: "POST",
//                 headers: {
//                     'Content-Type': "application/json",
//                 },
//                 body: JSON.stringify(user),
//             });

//             if (response.ok) {  // agr response.ok true h to ye wapis isko set kr dega 
//                 // #28
//                 const res_data = await response.json();
//                 console.log('response_Data', res_data);
//                 //  storetokenInLS(res_data.token);// Store the token in Local storage
//                 localStorage.setItem("token", res_data.token); // same h

//                 setUser(
//                     {
//                         username: "",
//                         email: "",
//                         phone: "",
//                         password: "",
//                     }
//                 );
//                 navigate("/login");
//             }
//             else {
//                 const res_data = await response.json();
//                 //    console.log('response_Data', res_data);

//                 alert(res_data?.msg || "Server error please try later");
//             }

//         } catch (error) {
//             alert("Server error please try later");
//         }
//     }

//     return (
//         <>
//             <section>
//                 <main>
//                     <div className="section-registration">
//                         <div className="container grid grid-two-cols">
//                             <div className="regitration-image">
//                                 <img src="https://tse2.mm.bing.net/th?id=OIP.tdTQvcCW6Pyt7e3qBTBdfwHaF6&pid=Api&P=0&h=180" alt="Registration" width="320px" height="320px" />
//                             </div>
//                             {/* let tackle registration form */}
//                             <div className="registration-form">
//                                 <h1 className="main-heading mb-3">Registration</h1>
//                                 <br /> <br />
//                                 <form onSubmit={handleSubmit}>
//                                     <div>
//                                         <label htmlFor="username">Username </label>
//                                         <input type="text" name="username" placeholder="Enter your name" id="username" required autoComplete="off" value={user.username} onChange={handleInput} />
//                                     </div><br />
//                                     <div>
//                                         <label htmlFor="email">email i'd   </label>
//                                         <input type="email" name="email" placeholder="Enter your email" id="email" required autoComplete="off" value={user.email} onChange={handleInput} />
//                                     </div><br />
//                                     <div>
//                                         <label htmlFor="Phone">Phone no. </label>
//                                         <input type="number" name="phone" placeholder="Enter your phone" id="Phone" required autoComplete="off" value={user.Phone} onChange={handleInput} />
//                                     </div> <br />
//                                     <div>
//                                         <label htmlFor="Password">Password </label>
//                                         <input type="Password" name="password" placeholder="Enter your Password" id="Password" required autoComplete="off" value={user.Password} onChange={handleInput} />
//                                     </div>
//                                     <br /> <br />
//                                     <button type="submit" className="btn btn-submit">Register Now</button>
//                                 </form>
//                             </div>
//                         </div>
//                     </div>
//                 </main>
//             </section>
//         </>
//     );
// }; 


import { useState } from "react";
import { useNavigate } from "react-router-dom";
// import Axios from "axios";  // -- (url)
import { useAuth } from "../store/auth";
import "./Style.css"

export const Register = () => {

    const [user, setUser] = useState({ //setuser me jo bhi value dalege to vo update ho jayegi user me 
        username: "",  // ye same hona chahiye name ke
        email: "",
        phone: "",
        password: "",
    });

    const navigate = useNavigate();
    const { storetokenInLS } = useAuth();
    // handling input values
    const handleInput = (e) => {
    //    console.log(e);  // har ek word likhne par console me vo print ho jata h
        let name = e.target.name;
        let value = e.target.value;

        setUser({
            ...user, //  spread operator h user ka baki data same rahe baki field ka jisko change nhi kr rhe h 
            [name]: value,  // dynamic value updatation
        });
    };

    // Handing form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        //  console.log(user);

        try {
            
            // const response = await fetch(`http://localhost:8000/api/auth/register`)
            const response = await fetch("http://localhost:5000/api/auth/register", {
                method: "POST",
                headers: {
                    'Content-Type': "application/json",
                },
                body: JSON.stringify(user),
            });

            const res_data = await response.json();
            console.log('response_Data', res_data);
            console.log('response_Data', res_data.message);
            console.log('response_Data', res_data.extraDetails);
            if (response.ok) {  // agr response.ok true h to ye wapis isko set kr dega 
                // #28
                storetokenInLS(res_data.token);// Store the token in Local storage
                // localStorage.setItem("token", res_data.token); // same h

                setUser(
                    {
                        username: "",
                        email: "",
                        phone: "",
                        password: "",
                    }
                );
                navigate("/login");
            }
            else {
                const res_data = await response.json();
                //    console.log('response_Data', res_data);
              //  alert(res_data?.msg || "Server error please try later");
              alert("not a valid registration")
            }

        } catch (error) {
            alert("Server error please try later");
            console.log("register",error);
        }
    }

    return (
        <>
            <section>
                <main>
                    <div className="section-registration">
                        <div className="container grid grid-two-cols">
                            <div className="regitration-image">
                                <img src="https://img.freepik.com/free-vector/tablet-login-concept-illustration_114360-7863.jpg" alt="Registration" width="320px" height="320px" />
                            </div>
                            {/* let tackle registration form */}
                            <div className="registration-form">
                                <h1 className="main-heading mb-3">Registration</h1>
                                <br /> <br />
                                <form onSubmit={handleSubmit}>
                                    <div>
                                        <label htmlFor="username">Username </label>
                                        <input type="text" name="username" placeholder="Enter your name" id="username" required autoComplete="off" value={user.username} onChange={handleInput} />
                                    </div><br />
                                    <div>
                                        <label htmlFor="email">email i'd   </label>
                                        <input type="email" name="email" placeholder="Enter your email" id="email" required autoComplete="off" value={user.email} onChange={handleInput} />
                                    </div><br />
                                    <div>
                                        <label htmlFor="Phone">Phone no. </label>
                                        <input type="number" name="phone" placeholder="Enter your phone" id="Phone" required autoComplete="off" value={user.Phone} onChange={handleInput} />
                                    </div> <br />
                                    <div>
                                        <label htmlFor="Password">Password </label>
                                        <input type="Password" name="password" placeholder="Enter your Password" id="Password" required autoComplete="off" value={user.Password} onChange={handleInput} />
                                    </div>
                                    <br /> <br />
                                    <button type="submit" className="btn btn-submit">Register Now</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </main>
            </section>
        </>
    );
};