// eslint-disable-next-line no-unused-vars
import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import "../index.css";

function Footer() {
  return (
    <footer className="ft text-light py-4">
      <Container>
        <Row className="row-cols-1 row-cols-sm-2 row-cols-md-4 row-cols-lg-4 mb-4">
          <Col className="footer-links">
            <p>
              <a href="#" className="text-light" alt="footer link">
                Privacy
              </a>
            </p>
            <p>
              <a href="#" className="text-light" alt="footer link">
                Contattaci
              </a>
            </p>
          </Col>
          <Col className="footer-links">
            <p>
              <a href="#" className="text-light" alt="footer link">
                Relazioni con gli investitori
              </a>
            </p>
            <p>
              <a href="#" className="text-light" alt="footer link">
                Note legali
              </a>
            </p>
          </Col>
          <Col className="footer-links">
            <p>
              <a href="#" className="text-light" alt="footer link">
                Centro assistenza
              </a>
            </p>
            <p>
              <a href="#" className="text-light" alt="footer link">
                Lavora con noi
              </a>
            </p>
            <p>
              <a href="#" className="text-light" alt="footer link">
                Preferenze cookie
              </a>
            </p>
          </Col>
          <Col className="footer-links">
            <p>
              <a href="#" className="text-light" alt="footer link">
                Carte regalo
              </a>
            </p>
            <p>
              <a href="#" className="text-light" alt="footer link">
                Termini di utilizzo
              </a>
            </p>
            <p>
              <a href="#" className="text-light" alt="footer link">
                Informazioni aziendali
              </a>
            </p>
          </Col>
        </Row>
        <Row>
          <Col className="mb-2">
            <Button
              type="button"
              className="btn-sm footer-button rounded-pill mt-3"
            >
              <a href="https://7vzefn.mimo.run/index.html">Codice Servizio</a>
            </Button>
          </Col>
        </Row>
        <Row>
          <Col className="mb-2 mt-2 copyright">© 2025 Baldesito</Col>
        </Row>
      </Container>
    </footer>
  );
}

export default Footer;
