import { useAuth } from "../store/auth";

export const Service = () => {

    const { services } = useAuth();

    return (
        <section className="section-services">
            <div className="container">
                <h1 className="main-heading">Services</h1>
            </div>

            <div className="container grid grid-three-cols">
                {
                    services.map((curElem, index) => {
                        const { brand, model, color, transmission } = curElem;
                        return (
                            <div className="card" key={index}>
                                <div className="class-img">
                                    <img src="" alt="our services" width={500} />
                                </div>

                                <div className="card-details">
                                    <div className="grid grid-two cols">
                                        <p>{brand}</p>
                                        <p>{model}</p>
                                    </div>
                                    <h2>{color}</h2>
                                    <p>{transmission}</p>
                                </div>
                            </div>
                        );
                    })
                }
            </div>
        </section>
    );
}