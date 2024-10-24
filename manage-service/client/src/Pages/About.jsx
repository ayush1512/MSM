import "./About.css"
import { useAuth } from "../store/auth";

export const About = () => {

    const { user } = useAuth();

    return (
        <>
            <section>
                <main className="main">
                    <div className="section-registration">
                        <div className="container grid grid-temp-cols">
                            <div className="regitration-image">
                                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcThMch_xqgKXY-bdva_DlnwvAU8v5jdtoq7ZMuot3K6AkihaKVDo2uiKflcAzVdl6bobLE&usqp=CAU" alt="Registration" width="390px" height="320px" />

                            </div>
                            {/* let tackle registration form */}
                            <div className="registration-form">

                                <p className="welcome">Welcome {user ? `${user.username} to our website`: `to our website`}</p>  
                                
                                <p> Our goal is to ensure that every individual has access to high-quality, affordable medicines and healthcare products.</p>
                                <br />
                                <h1 className="main-heading mb-3">Why Use Medical Shop Management</h1>
                                <br />
                                {/* <h1 >Product Scanner</h1> */}
                                <p>With our Product Scanner feature, you can simply scan the barcode or QR code of any medicine or health product. The scanner will immediately fetch product details, availability, and pricing. This is especially helpful for quick reorders or checking product information at your convenience.

</p>
<br /> 
                            </div>
                        </div>
                        <p>
                            <p>Our platform connects you with certified pharmacists and healthcare professionals, who can offer guidance on medication usage, dosage, and any other health-related queries you may have.

</p>
                            <br />
                            <p>Our platform connects you with certified pharmacists and healthcare professionals, who can offer guidance on medication usage, dosage, and any other health-related queries you may have.

</p>
                            <br />
                            <p>Our platform connects you with certified pharmacists and healthcare professionals, who can offer guidance on medication usage, dosage, and any other health-related queries you may have.

</p> <br />
                            <p>Our platform connects you with certified pharmacists and healthcare professionals, who can offer guidance on medication usage, dosage, and any other health-related queries you may have.

</p>
                    </p></div>
                </main>
            </section><br></br>
            <div className="btn btn-group">
                               
                                <a href="/services">
                                    <button className="btn secondary-btn">know more</button>
                                </a>
                            </div>
            
            
        </>
    );
}
