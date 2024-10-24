import { useState } from "react";
import { useAuth } from "../store/auth";

const defaultContactFormData = {  // setuser me jo bhi value dalege to vo update ho jayegi user me 
    // ye same hona chahiye name ke
    username: "",
    email: "",
    message: "",
}

export const Contact = () => {

    const [contact, setcontact] = useState(defaultContactFormData);

    const [userData, setUserData] = useState(true);
    const { user } = useAuth();

    if (userData && user) { // agr userData true h aur user ki value hume milti h
        setcontact({
            username: user.username,
            email: user.email,
            message: "",

        });
        setUserData(false);
    }

    // handling input values
    const handleInput = (e) => {
        console.log(e);
        let name = e.target.name;
        let value = e.target.value;

        setcontact({
            ...contact, //  spread operator h user ka baki data same rahe baki field ka jisko change nhi kr rhe h 
            [name]: value,  // dynamic value updatation
        });
    };

    // Handing form submission
    const handleSubmit = async(e) => {
        e.preventDefault();
        console.log(contact);
        alert("contact")
        try {
            const response = await fetch("http://localhost:5000/api/form/contact", {
                method: "POST",
                headers:{
                    'Content-Type':"application/json"
                },
                body:JSON.stringify(contact),
            })
            if(response.ok){
                setcontact(defaultContactFormData);
                const data = await response.json();
                console.log(data);
                alert("Msg sent successfully");
            }
        } catch (error) {
            alert("Msg not sent");
            console.log(error);
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
                                <h1 className="main-heading mb-3">Contact us</h1>
                                <br /> <br />
                                <form onSubmit={handleSubmit}>
                                    <div>
                                        <label htmlFor="username">username </label>
                                        <input type="text" name="username" placeholder="Enter your username" id="username" required autoComplete="off" value={contact.username} onChange={handleInput} />
                                    </div> <br />
                                    <div>
                                        <label htmlFor="email">Email i'd </label>
                                        <input type="email" name="email" placeholder="Enter your email" id="email" required autoComplete="off" value={contact.email} onChange={handleInput} />
                                    </div> <br />
                                    <div>
                                        <label htmlFor="message">Message </label>
                                        <input type="message" name="message" placeholder="Enter your message" id="message" required autoComplete="off" value={contact.message} onChange={handleInput} />
                                    </div>
                                    <br /> <br />
                                    <button type="submit" className="btn btn-submit">Submit</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </main>
            </section>
        </>
    );
}
