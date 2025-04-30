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
    "https://cdn.pixabay.com/photo/2020/02/01/02/36/london-eye-4809387_1280.jpg",
    "https://cdn.pixabay.com/photo/2018/02/27/06/30/skyscrapers-3184798_1280.jpg",
    "https://cdn.pixabay.com/photo/2019/04/02/20/45/landscape-4098802_1280.jpg",
    "https://cdn.pixabay.com/photo/2022/04/03/22/05/buildings-7109918_1280.jpg",
    "https://cdn.pixabay.com/photo/2017/06/05/11/01/airport-2373727_1280.jpg",
    "https://cdn.pixabay.com/photo/2021/10/02/09/18/airplane-6674689_1280.jpg",
    "https://cdn.pixabay.com/photo/2023/03/11/11/34/travelling-7844283_1280.jpg",
    "https://cdn.pixabay.com/photo/2020/09/01/15/05/aircraft-cabin-5535467_1280.jpg",
    "https://cdn.pixabay.com/photo/2018/09/25/17/14/airplane-3702676_1280.jpg",
  ];

  const navigate = useNavigate();
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState("");
  const [tripType, setTripType] = useState("roundTrip");
  const [partenza, setPartenza] = useState("");
  const [arrivo, setArrivo] = useState("");

  const [partenzaCode, setPartenzaCode] = useState("");
  const [arrivoCode, setArrivoCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const convertToAirportCode = async (query) => {
    try {
      // Implementazione della chiamata API per ottenere il codice aeroportuale
      const response = await fetch(
        `/api/airports/search?query=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        throw new Error("Errore nella ricerca dell'aeroporto");
      }

      const data = await response.json();

      // Verifica se abbiamo risultati
      if (data && data.length > 0) {
        // Restituisce il codice IATA del primo risultato
        return data[0].iataCode;
      } else {
        throw new Error(`Nessun aeroporto trovato per "${query}"`);
      }
    } catch (error) {
      console.error("Errore nella conversione aeroporto:", error);
      throw error;
    }
  };

  const getAirportCodeFromMap = (query) => {
    // Mappa espansa di città/aeroporti e relativi codici IATA
    const airportMap = {
      // Italia
      roma: "FCO",
      fiumicino: "FCO",
      rome: "FCO",
      milano: "MXP",
      milan: "MXP",
      malpensa: "MXP",
      linate: "LIN",
      "milano linate": "LIN",
      bergamo: "BGY",
      "orio al serio": "BGY",
      napoli: "NAP",
      naples: "NAP",
      venezia: "VCE",
      venice: "VCE",
      firenze: "FLR",
      florence: "FLR",
      torino: "TRN",
      turin: "TRN",
      bologna: "BLQ",
      palermo: "PMO",
      catania: "CTA",
      bari: "BRI",
      cagliari: "CAG",
      pisa: "PSA",
      brindisi: "BDS",
      lamezia: "SUF",
      "lamezia terme": "SUF",
      pescara: "PSR",
      alghero: "AHO",
      treviso: "TSF",

      // Europa
      londra: "LHR",
      london: "LHR",
      heathrow: "LHR",
      gatwick: "LGW",
      "london gatwick": "LGW",
      stansted: "STN",
      "london stansted": "STN",
      parigi: "CDG",
      paris: "CDG",
      "charles de gaulle": "CDG",
      orly: "ORY",
      "paris orly": "ORY",
      madrid: "MAD",
      barcellona: "BCN",
      barcelona: "BCN",
      berlino: "BER",
      berlin: "BER",
      amsterdam: "AMS",
      schiphol: "AMS",
      francoforte: "FRA",
      frankfurt: "FRA",
      monaco: "MUC",
      munich: "MUC",
      vienna: "VIE",
      "vienna airport": "VIE",
      zurigo: "ZRH",
      zurich: "ZRH",
      ginevra: "GVA",
      geneva: "GVA",
      bruxelles: "BRU",
      brussels: "BRU",
      lisbona: "LIS",
      lisbon: "LIS",
      atene: "ATH",
      athens: "ATH",
      dublino: "DUB",
      dublin: "DUB",
      praga: "PRG",
      prague: "PRG",
      budapest: "BUD",
      varsavia: "WAW",
      warsaw: "WAW",
      copenaghen: "CPH",
      copenhagen: "CPH",
      stoccolma: "ARN",
      stockholm: "ARN",
      oslo: "OSL",
      helsinki: "HEL",

      // Nord America
      "new york": "JFK",
      newyork: "JFK",
      newark: "EWR",
      "los angeles": "LAX",
      la: "LAX",
      chicago: "ORD",
      miami: "MIA",
      toronto: "YYZ",
      "san francisco": "SFO",
      boston: "BOS",
      washington: "IAD",
      atlanta: "ATL",
      dallas: "DFW",
      houston: "IAH",
      denver: "DEN",
      seattle: "SEA",
      vancouver: "YVR",
      montreal: "YUL",

      // Resto del mondo
      tokyo: "HND",
      "tokyo haneda": "HND",
      narita: "NRT",
      "tokyo narita": "NRT",
      dubai: "DXB",
      "hong kong": "HKG",
      singapore: "SIN",
      bangkok: "BKK",
      pechino: "PEK",
      beijing: "PEK",
      shanghai: "PVG",
      seoul: "ICN",
      incheon: "ICN",
      sydney: "SYD",
      melbourne: "MEL",
      auckland: "AKL",
      johannesburg: "JNB",
      "cape town": "CPT",
      delhi: "DEL",
      "new delhi": "DEL",
      mumbai: "BOM",
      bombay: "BOM",
      "rio de janeiro": "GIG",
      "sao paulo": "GRU",
    };

    // Normalizza la query (minuscolo e rimuovi spazi extra)
    const normalizedQuery = query.toLowerCase().trim();

    // Controllo diretto della mappa
    if (airportMap[normalizedQuery]) {
      return airportMap[normalizedQuery];
    }

    // Cerca corrispondenze parziali
    for (const [key, code] of Object.entries(airportMap)) {
      if (normalizedQuery.includes(key) || key.includes(normalizedQuery)) {
        return code;
      }
    }

    // Se non troviamo corrispondenze, restituiamo null
    return "FCO";
  };
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

    setIsLoading(true);
    setErrorMessage("");

    try {
      // Ottieni i codici IATA
      let partenzaIATA = getAirportCodeFromMap(partenza);
      let arrivoIATA = getAirportCodeFromMap(arrivo);

      // Assicurati che i codici siano validi (3 lettere maiuscole)
      if (!partenzaIATA || partenzaIATA.length !== 3) {
        partenzaIATA = "FCO"; // Default a Roma se non valido
      } else {
        partenzaIATA = partenzaIATA.toUpperCase();
      }

      if (!arrivoIATA || arrivoIATA.length !== 3) {
        arrivoIATA = "LHR"; // Default a Londra se non valido
      } else {
        arrivoIATA = arrivoIATA.toUpperCase();
      }

      // Evita codici identici
      if (partenzaIATA === arrivoIATA) {
        arrivoIATA = partenzaIATA === "FCO" ? "LHR" : "FCO";
      }

      const formatDateForAPI = (date) => {
        return date ? date.toISOString().split("T")[0] : null;
      };

      console.log(
        `Ricerca voli: da ${partenza} (${partenzaIATA}) a ${arrivo} (${arrivoIATA})`
      );

      const results = await searchFlights(
        partenzaIATA,
        arrivoIATA,
        formatDateForAPI(dataAndata),
        tripType === "roundTrip" ? formatDateForAPI(dataRitorno) : null,
        adulti
      );

      navigate("/results", {
        state: {
          flights: results,
          tripType,
          partenza,
          partenzaCode: partenzaIATA,
          arrivo,
          arrivoCode: arrivoIATA,
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
      setErrorMessage(
        "Si è verificato un errore durante la ricerca. Riprova più tardi."
      );
    } finally {
      setIsLoading(false);
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
