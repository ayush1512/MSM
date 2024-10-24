import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./Pages/Home";
import { About } from "./Pages/About";
import { Service } from "./Pages/Service";
import { Contact } from "./Pages/Contact";
import { Register } from "./Pages/Register";
import { Login } from "./Pages/Login";
import { Logout } from "./Pages/Logout";
import { Error } from "./Pages/Error";
import { Navbar } from "./components/Navbar";
import MedicineSection from "./Pages/MedicineSection";
// import { Register_Local } from "./Pages/Register_localStorage";
const App = () => {
  return (
    <BrowserRouter>
      <Navbar />
      < Routes>
        <Route path='/' element={<Home />} />  {/* void element */}
        <Route path='/about' element={<About />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/service' element={<Service />} />
        <Route path='/register' element={<Register />} />
        <Route path='/login' element={<Login />} />
        <Route path='/logout' element={<Logout />} />
        <Route path='/medicinsection' element={<MedicineSection/>}/>
        <Route path="*" element={<Error />} />
      </ Routes>
    </BrowserRouter>
  )
}
export default App;