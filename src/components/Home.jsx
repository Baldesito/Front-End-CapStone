import React, { useState, useEffect } from "react";
import Carousel from "react-bootstrap/Carousel";
import { useNavigate, useLocation } from "react-router-dom";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";
import "../App.css";
import { searchFlights } from "../services/amadeus";
import CustomDateInput from "./CustomDateInput";
import Footer from "./Footer";

const Home = () => {
  const images = [
    "https://cdn.pixabay.com/photo/2018/09/04/11/52/disneyland-3653617_1280.jpg",
    "https://cdn.pixabay.com/photo/2019/10/06/08/57/tiber-river-4529605_1280.jpg",
    "https://cdn.pixabay.com/photo/2017/06/24/00/54/milan-cathedral-2436458_1280.jpg",
    "https://cdn.pixabay.com/photo/2016/11/05/08/31/rome-1799670_1280.jpg",
    "https://cdn.pixabay.com/photo/2020/03/10/17/33/paris-4919653_1280.jpg",
    "https://cdn.pixabay.com/photo/2017/05/08/16/25/paris-2295794_960_720.jpg",
    "https://cdn.pixabay.com/photo/2020/02/01/02/36/london-eye-4809387_1280.jpg",
    "https://cdn.pixabay.com/photo/2018/02/27/06/30/skyscrapers-3184798_1280.jpg",
    "https://cdn.pixabay.com/photo/2019/04/02/20/45/landscape-4098802_1280.jpg",
    "https://cdn.pixabay.com/photo/2022/04/03/22/05/buildings-7109918_1280.jpg",
  ];

  const navigate = useNavigate();
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState("");
  const [tripType, setTripType] = useState("roundTrip");
  const [partenza, setPartenza] = useState("");
  const [arrivo, setArrivo] = useState("");

  // Funzioni per generare date predefinite
  const getDefaultDepartureDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 2); // 2 giorni dopo oggi
    return date;
  };

  const getDefaultReturnDate = (departureDate) => {
    const date = departureDate ? new Date(departureDate) : new Date();
    date.setDate(date.getDate() + 5); // 5 giorni dopo la data di andata
    return date;
  };

  const [dataAndata, setDataAndata] = useState(getDefaultDepartureDate());
  const [dataRitorno, setDataRitorno] = useState(
    getDefaultReturnDate(getDefaultDepartureDate())
  );
  const [adulti, setAdulti] = useState(1);
  const [bambini, setBambini] = useState(0);
  const [neonati, setNeonati] = useState(0);

  // Aggiorna la data di ritorno quando cambia la data di andata
  useEffect(() => {
    if (tripType === "roundTrip") {
      // Se la data di ritorno è prima della data di andata o è la stessa
      if (dataRitorno <= dataAndata) {
        // Imposta la data di ritorno a 5 giorni dopo l'andata
        const newRitornoDate = new Date(dataAndata);
        newRitornoDate.setDate(dataAndata.getDate() + 5);
        setDataRitorno(newRitornoDate);
      }
    }
  }, [dataAndata, dataRitorno, tripType]);

  // Quando cambia il tipo di viaggio
  useEffect(() => {
    if (tripType === "oneWay") {
      // Se è solo andata, svuota la data di ritorno
      setDataRitorno(null);
    } else {
      // Se è andata e ritorno, imposta la data di ritorno predefinita
      if (!dataRitorno) {
        setDataRitorno(getDefaultReturnDate(dataAndata));
      }
    }
  }, [tripType]);

  // Controlla se c'è un messaggio di successo quando si carica la home
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Rimuovi il messaggio dopo 5 secondi
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  const handleSearch = async () => {
    // Validazione dei campi
    if (
      !partenza ||
      !arrivo ||
      !dataAndata ||
      (tripType === "roundTrip" && !dataRitorno)
    ) {
      alert("Per favore, compila tutti i campi obbligatori");
      return;
    }

    try {
      // Formatta le date per l'API
      const formatDateForAPI = (date) => {
        return date ? date.toISOString().split("T")[0] : null;
      };

      const results = await searchFlights(
        partenza,
        arrivo,
        formatDateForAPI(dataAndata),
        tripType === "roundTrip" ? formatDateForAPI(dataRitorno) : null,
        adulti
      );

      navigate("/results", {
        state: {
          flights: results,
          tripType,
          partenza,
          arrivo,
          dataAndata: formatDateForAPI(dataAndata),
          dataRitorno:
            tripType === "roundTrip" ? formatDateForAPI(dataRitorno) : null,
          adulti,
          bambini,
          neonati,
        },
      });
    } catch (error) {
      console.error("Errore nella ricerca voli:", error);
      alert("Si è verificato un errore durante la ricerca. Riprova più tardi.");
    }
  };

  return (
    <div
      className="home-container position-relative"
      style={{ minHeight: "100vh", paddingBottom: "0" }}
    >
      {successMessage && (
        <Alert
          variant="success"
          className="text-center"
          onClose={() => setSuccessMessage("")}
          dismissible
        >
          {successMessage}
        </Alert>
      )}

      <Carousel
        fade
        indicators={false}
        controls={false}
        interval={4000}
        className="mb-4"
      >
        {images.map((img, index) => (
          <Carousel.Item key={index}>
            <img src={img} alt="Città" className="carousel-image" />
          </Carousel.Item>
        ))}
      </Carousel>

      <div className="search-container">
        <Container fluid="lg">
          <h2 className="text-center vola-con mb-4">
            Vola con le migliori tariffe!
          </h2>
          <Row className="justify-content-center">
            <Col xs={12} md={10} lg={8} className="search-box p-3">
              <Form className="form-home">
                <Row className="form-home">
                  <Col xs={6} className="mb-3">
                    <Form.Check
                      type="radio"
                      label="Andata e ritorno"
                      name="tripType"
                      id="roundTrip"
                      checked={tripType === "roundTrip"}
                      onChange={() => setTripType("roundTrip")}
                      className="form-check-inline"
                    />
                  </Col>
                  <Col xs={6}>
                    <Form.Check
                      type="radio"
                      label="Solo andata"
                      name="tripType"
                      id="oneWay"
                      checked={tripType === "oneWay"}
                      onChange={() => setTripType("oneWay")}
                      className="form-check-inline"
                    />
                  </Col>
                </Row>

                <Row>
                  <Col xs={12} md={6} className="mb-3">
                    <Form.Label className="partenza">Partenza da</Form.Label>
                    <Form.Control
                      type="text"
                      value={partenza}
                      onChange={(e) => setPartenza(e.target.value)}
                      placeholder="Inserisci città o aeroporto"
                    />
                  </Col>
                  <Col xs={12} md={6} className="mb-3">
                    <Form.Label className="arrivo">Arrivo a</Form.Label>
                    <Form.Control
                      type="text"
                      value={arrivo}
                      onChange={(e) => setArrivo(e.target.value)}
                      placeholder="Inserisci città o aeroporto"
                    />
                  </Col>
                </Row>

                <Row className="mt-3">
                  <Col xs={12} sm={6} md={3} className="mb-3">
                    <CustomDateInput
                      label="Andata il"
                      selectedDate={dataAndata}
                      onChange={setDataAndata}
                      minDate={new Date()}
                      placeholder="GG/MM/AAAA"
                    />
                  </Col>
                  {tripType === "roundTrip" && (
                    <Col xs={12} sm={6} md={3} className="mb-3">
                      <CustomDateInput
                        label="Ritorno il"
                        selectedDate={dataRitorno}
                        onChange={setDataRitorno}
                        minDate={dataAndata}
                        placeholder="GG/MM/AAAA"
                      />
                    </Col>
                  )}
                  <Col xs={4} sm={4} md={2} className="mb-3">
                    <Form.Label>Adulti</Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      value={adulti}
                      onChange={(e) => setAdulti(parseInt(e.target.value) || 1)}
                    />
                  </Col>
                  <Col xs={4} sm={4} md={2} className="mb-3">
                    <Form.Label>Bambini</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      value={bambini}
                      onChange={(e) =>
                        setBambini(parseInt(e.target.value) || 0)
                      }
                    />
                  </Col>
                  <Col xs={4} sm={4} md={2} className="mb-3">
                    <Form.Label>Neonati</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      value={neonati}
                      onChange={(e) =>
                        setNeonati(parseInt(e.target.value) || 0)
                      }
                    />
                  </Col>
                </Row>

                <Row className="mt-3 p-2">
                  <Button
                    className="mt-2 cerca rounded-pill"
                    onClick={handleSearch}
                  >
                    Cerca
                  </Button>
                </Row>
              </Form>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default Home;
