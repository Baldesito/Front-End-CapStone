import React, { useState, useEffect } from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import FormAccedi from "./FormAccedi";
import "../index.css";
import ProfileDropdown from "./Profilo";
import { Dropdown } from "react-bootstrap";
import { Link } from "react-router-dom";

const Navigation = () => {
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

  return (
    <div className="gradient-bg mb-1">
      <Navbar expand="lg" variant="dark" className="custom-navbar">
        <Container>
          <Navbar.Brand href="/">
            <span className="nome-sito">Baldesito-Fly</span>
            <img src="/src/assets/Logo3.png" alt="Logo" className="logo" />
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link href="/">Home</Nav.Link>
              <Nav.Link href="/search">Cerca Auto</Nav.Link>
              {user && (
                <Nav.Link as={Link} to="/preferiti">
                  Preferiti
                </Nav.Link>
              )}

              {user ? (
                <Dropdown align="end">
                  <ProfileDropdown user={user} onLogout={handleLogout} />
                </Dropdown>
              ) : (
                <Button
                  variant="outline-light rounded-pill"
                  onClick={() => setShowModal(true)}
                >
                  Accedi
                </Button>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <FormAccedi
        show={showModal}
        onHide={() => setShowModal(false)}
        onLogin={handleLogin}
      />
    </div>
  );
};

export default Navigation;
