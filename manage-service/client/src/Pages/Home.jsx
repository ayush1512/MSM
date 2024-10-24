export const Home = () => {
    return (
        <>
            <main>
                <section className="section-hero">
                    <div className="container grid grid-two-cols">
                        <div className="hero-content">
                            <p></p>
                            <h1>Pharmacy Management System with Pharmacy Billing and Inventory

</h1>
                            <p>
                            Get complete control of your retail pharmacy and increase your brand reputation with profitable purchase management, an automated reorder process, accurate expiry management, super-fast billing, rewarding loyalty programs, and targeted promotions with Gofrugals pharmacy software.

 </p>
                            <div className="btn btn-group">
                                <a href="/contact">
                                    <button className="btn">Explore</button>
                                </a>
                                <a href="/services">
                                    <button className="btn secondary-btn">know more</button>
                                </a>
                            </div>
                        </div>

                        {/* hero images */}
                        <div className="hero-image">
                            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR2luJZwn0lF6QPJ_CP2Z8rVICGKT1UVkKNwQ&s" alt="" width={320} height={320} />
                        </div>
                    </div>
                </section>
            </main>

            {/* <div className="section-analytics">
                <div className="container grid grid-four-cols">
                    <div className="div1">
                        <h2></h2>
                        <p>Bardode generation </p>
                    </div>
                    <div className="div1">
                        <h2></h2>
                        <p>Prescription Reader</p>
                    </div>
                    <div className="div1">
                        <h2></h2>
                        <p>Super Fast Billing</p>
                    </div> 
                    <div className="div1">
                        <h2>24/7</h2>
                        <p>Services</p>
                    </div>
                </div>
            </div>  */}

            <main>
                <h1>What is Medical Store Management ?

</h1>
                <section className="section-hero">
                    <div className="container grid grid-three-cols">
                        {/* hero images */}
                        <div className="hero-image">
                            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQqmoj4VJCwd8pWE_hma-YWNP8Hdx1onx87AA&s" alt="" width={320} height={320} />
                        </div>

                        {/* Details */}
                        <div className="hero-content">
                            <h1>Welcome to Medical Store Management Website</h1>
                            <p>
                            Pharmacy software is POS software that helps pharmacies manage their entire business operations, starting from purchase management to building a loyal consumer base. A pharmacy management system gives users complete control over important aspects of a pharmacy business, such as supplier management, the automated reorder process, and inventory control, expiry management, and servicing customers in the pharmacy store with super-fast billing.

 <br />
 User-friendly interface with shortcuts and quick searches facilitates faster checkouts and improves the billing experience along with mobile billing app

 <br /><br />
 Get complete control of your retail pharmacy and increase your brand reputation with profitable purchase management, an automated reorder process, accurate expiry management, super-fast billing, rewarding loyalty programs, and targeted promotions with Gofrugals pharmacy software.

 </p>
                            <div className="btn btn-group">
                                {/* <a href="/contact">
                                    <button className="btn">connect now</button>
                                </a> */}
                                <a href="/services">
                                    <button className="btn secondary-btn">know more</button>
                                </a>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}
// export default Home;