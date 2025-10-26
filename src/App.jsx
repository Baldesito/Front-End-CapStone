import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import Footer from "./components/Footer";
import Navigation from "./components/NavBar";
import Home from "./components/Home";
import Results from "./components/Results";
import FormPrenota from "./components/FormPrenota";
import FormPagamento from "./components/FormPagamento";
import Profilo from "./components/Profilo";
import Preferiti from "./components/Preferiti";
import NotFound from "./components/NotFound";

const App = () => {
  return (
    <ErrorBoundary>
      <Router>
        <Navigation />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/results" element={<Results />} />

          {/* Protected routes - require authentication */}
          <Route
            path="/preferiti"
            element={
              <ProtectedRoute>
                <Preferiti />
              </ProtectedRoute>
            }
          />
          <Route
            path="/booking"
            element={
              <ProtectedRoute>
                <FormPrenota />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment"
            element={
              <ProtectedRoute>
                <FormPagamento />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profilo />
              </ProtectedRoute>
            }
          />

          {/* 404 catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </Router>
    </ErrorBoundary>
  );
};

export default App;
