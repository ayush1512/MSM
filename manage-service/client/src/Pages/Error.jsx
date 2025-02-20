import { NavLink } from "react-router-dom"
export const Error =() => {
    return(
        <>
        <section id="error-page">
            <div className="container">
                {/* <h2 className="header">404</h2> */}
                {/* <h4>Sorry! Page not found</h4> */}
                <p>

                   </p>
                <div className="btns">
                    <NavLink to="/">return home</NavLink><br></br><br></br>
                    <NavLink to="/contact">report problem</NavLink>
                </div>
                <p>Using the Medical Shop Management System has completely transformed the way we run our store. Inventory management is a breeze, and our customers appreciate the quick and accurate service we can now provide</p>
            </div>
        </section>
        </>
    )
}