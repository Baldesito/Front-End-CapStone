import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Footer from "./components/Footer";
import Navigation from "./components/NavBar";
import Home from "./components/Home";
import Results from "./components/Results";
import FormPrenota from "./components/FormPrenota";
import FormPagamento from "./components/FormPagamento";
import Profilo from "./components/Profilo";
import Preferiti from "./components/Preferiti";

const App = () => {
  return (
    <Router>
      <Navigation />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/results" element={<Results />} />
        <Route path="/preferiti" element={<Preferiti />} />
        <Route path="/booking" element={<FormPrenota />} />
        <Route path="/payment" element={<FormPagamento />} />
        <Route path="/profile" element={<Profilo />} />
      </Routes>
      <Footer />
    </Router>
  );
};

export default App;
