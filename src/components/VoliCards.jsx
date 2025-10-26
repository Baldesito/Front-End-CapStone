import "../index.css";
import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Form,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { voliAPI, preferitiAPI } from "../config/api";

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const days = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
  const months = [
    "gen",
    "feb",
    "mar",
    "apr",
    "mag",
    "giu",
    "lug",
    "ago",
    "set",
    "ott",
    "nov",
    "dic",
  ];
  return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
};

const formatDuration = (duration) => {
  if (!duration) return "";
  const matches = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  return `${matches[1] || 0}h ${matches[2] || 0}m`;
};

const VoliCards = ({
  flight,
  allFlights = [],
  filteredFlights = [],
  setFilteredFlights,
  selectedFlights = [], // Valore predefinito per evitare errori
  setSelectedFlights,
  isChecked: externalIsChecked,
}) => {
  const navigate = useNavigate();
  const [savedVoloId, setSavedVoloId] = useState(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Verifica che flight e le sue proprietà siano definite
  if (!flight || !flight.itineraries || !flight.itineraries[0]) {
    console.error("Dati del volo mancanti", flight);
    return null;
  }

  const departureSegment = flight.itineraries[0].segments[0];
  const arrivalSegment = flight.itineraries[0].segments.slice(-1)[0];

  const returnSegment = flight.itineraries[1]?.segments[0];
  const returnArrivalSegment = flight.itineraries[1]?.segments.slice(-1)[0];

  // Controlla se il checkbox è selezionato, usando la funzione esterna se disponibile
  const isChecked = (type) => {
    // Controlla se externalIsChecked è una funzione
    if (typeof externalIsChecked === "function") {
      return externalIsChecked(type);
    }

    // Controlla che selectedFlights sia definito e sia un array
    if (!Array.isArray(selectedFlights)) {
      return false;
    }

    return selectedFlights.some((f) => f.id === flight.id && f.type === type);
  };

  const handleCheckboxChange = (type) => {
    // Controlla che selectedFlights sia definito e sia un array
    if (!Array.isArray(selectedFlights)) {
      console.error("selectedFlights non è un array valido");
      return;
    }

    // Controlla che setSelectedFlights sia una funzione
    if (typeof setSelectedFlights !== "function") {
      console.error("setSelectedFlights non è una funzione");
      return;
    }

    // Ottiene il volo attuale
    const thisFlightInfo = {
      id: flight.id,
      type,
      flight,
    };

    const alreadySelected = selectedFlights.find(
      (f) => f.id === flight.id && f.type === type
    );

    let updatedSelections;

    if (alreadySelected) {
      // Deseleziona questo specifico volo
      updatedSelections = selectedFlights.filter(
        (f) => !(f.id === flight.id && f.type === type)
      );
    } else {
      // Rimuovi altri voli dello stesso tipo
      updatedSelections = selectedFlights.filter((f) => f.type !== type);

      // Aggiungi solo questo volo specifico
      updatedSelections.push(thisFlightInfo);
    }

    setSelectedFlights(updatedSelections);

    // Verifica che setFilteredFlights sia una funzione
    if (typeof setFilteredFlights !== "function") {
      console.error("setFilteredFlights non è una funzione");
      return;
    }

    // Aggiorna la visualizzazione dei voli filtrati
    if (
      updatedSelections.some((f) => f.type === "andata") &&
      updatedSelections.some((f) => f.type === "ritorno")
    ) {
      // Se sono selezionati sia andata che ritorno, nascondi tutte le altre card
      setFilteredFlights([]);
    } else {
      // Altrimenti mostra tutti i voli
      setFilteredFlights(allFlights);
    }
  };

  // Funzione per salvare il volo nel backend
  const salvaVoloSuBackend = async (datiVolo) => {
    // Ottieni l'utente dal localStorage direttamente qui per assicurarsi che sia aggiornato
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return null;

    try {
      const res = await voliAPI.create(datiVolo);
      return res.data;
    } catch (error) {
      console.error("Errore nel salvare il volo:", error);
      return null;
    }
  };

  // Funzione per aggiungere ai preferiti
  const aggiungiAiPreferiti = async (idUtente, idVolo, token) => {
    try {
      const res = await preferitiAPI.add({ utenteId: idUtente, voloId: idVolo });
      return res.data;
    } catch (error) {
      console.error("Errore nell'aggiungere ai preferiti:", error);
      return null;
    }
  };

  // Funzione per rimuovere dai preferiti
  const rimuoviDaiPreferiti = async (idUtente, idVolo, token) => {
    try {
      const res = await preferitiAPI.getByUser(idUtente);
      const preferiti = res.data;
      const match = preferiti.find((p) => p.voloId === idVolo);

      if (match) {
        await preferitiAPI.remove(match.id);
      }
    } catch (error) {
      console.error("Errore nel rimuovere dai preferiti:", error);
    }
  };

  // Gestione del toggle dei preferiti
  const gestisciTogglePreferito = async () => {
    // Ottieni l'utente dal localStorage direttamente qui per assicurarsi che sia aggiornato
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      alert("Devi essere loggato per usare i preferiti");
      return;
    }

    try {
      const voloSalvare = {
        compagnia: flight.validatingAirlineCodes[0],
        origine: departureSegment?.departure?.iataCode,
        destinazione: arrivalSegment?.arrival?.iataCode,
        dataPartenza: departureSegment?.departure?.at,
        dataArrivo: arrivalSegment?.arrival?.at,
        prezzo: parseFloat(flight.price.total),
      };

      if (isFavorite && savedVoloId) {
        await rimuoviDaiPreferiti(user.id, savedVoloId, user.token);
        setIsFavorite(false);
        setSavedVoloId(null);
        alert("Volo rimosso dai preferiti");
      } else {
        const salvato = await salvaVoloSuBackend(voloSalvare);
        if (salvato && salvato.id) {
          setSavedVoloId(salvato.id);
          await aggiungiAiPreferiti(user.id, salvato.id, user.token);
          setIsFavorite(true);
          alert("Volo aggiunto ai preferiti");
        }
      }
    } catch (error) {
      console.error("Errore nella gestione dei preferiti:", error);
      alert("Si è verificato un errore. Riprova più tardi.");
    }
  };

  useEffect(() => {
    // Controlla se il volo è già tra i preferiti quando il componente viene montato
    const verificaPreferito = async () => {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) return;

      try {
        const res = await preferitiAPI.getByUser(user.id);
        const preferiti = res.data;

        // Cerca un match basato sui dettagli del volo
        const match = preferiti.find((p) => {
          const voloDettagli = allFlights.find((f) => f.id === p.voloId);
          return (
            voloDettagli &&
            voloDettagli.itineraries[0].segments[0].departure.iataCode ===
              departureSegment.departure.iataCode &&
            voloDettagli.itineraries[0].segments.slice(-1)[0].arrival
              .iataCode === arrivalSegment.arrival.iataCode
          );
        });

        if (match) {
          setIsFavorite(true);
          setSavedVoloId(match.voloId);
        }
      } catch (error) {
        console.error("Errore nel recupero dei preferiti:", error);
      }
    };

    verificaPreferito();
  }, [
    departureSegment.departure.iataCode,
    arrivalSegment.arrival.iataCode,
    allFlights,
  ]);

  const handleContinue = () => {
    const andata = selectedFlights.find((f) => f.type === "andata");
    const ritorno = selectedFlights.find((f) => f.type === "ritorno");

    if (!andata && !ritorno) {
      alert("Seleziona almeno un volo per continuare!");
      return;
    }

    const totale = [andata, ritorno].reduce(
      (sum, f) => sum + parseFloat(f?.flight?.price?.total || 0),
      0
    );

    navigate("/booking", {
      state: {
        andata: andata?.flight?.itineraries[0],
        ritorno: ritorno?.flight?.itineraries[1] || null,
        prezzo: totale.toFixed(2),
      },
    });
  };

  return (
    <Card className="flight-card shadow-sm">
      <Card.Body>
        <Row className="m-3">
          <Col xs={10}>
            <Row className="align-items-center mb-3">
              <Col xs={2}>
                <p className="flight-date">
                  {formatDate(departureSegment.departure.at)}
                </p>
                <p className="text-success fw-bold">Andata</p>
              </Col>
              <Col xs={3} className="text-center">
                <img
                  src={`https://pics.avs.io/80/40/${flight.validatingAirlineCodes[0]}.png`}
                  alt="Compagnia"
                  className="airline-logo"
                />
                <p className="text-secondary medium">
                  {flight.validatingAirlineCodes[0]}
                </p>
              </Col>
              <Col>
                <strong>
                  {departureSegment.departure.iataCode}{" "}
                  {departureSegment.departure.at.slice(11, 16)} →{" "}
                  {arrivalSegment.arrival.iataCode}{" "}
                  {arrivalSegment.arrival.at.slice(11, 16)}
                </strong>
                <p className="duration">
                  {formatDuration(flight.itineraries[0].duration)}
                </p>
              </Col>
              <Col xs={1}>
                <Form.Check
                  type="checkbox"
                  checked={isChecked("andata")}
                  onChange={() => handleCheckboxChange("andata")}
                />
              </Col>
            </Row>

            {returnSegment && (
              <>
                <hr className="hr-cards" />
                <Row className="align-items-center">
                  <Col xs={2}>
                    <p className="flight-date">
                      {formatDate(returnSegment.departure.at)}
                    </p>
                    <p className="text-primary fw-bold">Ritorno</p>
                  </Col>
                  <Col xs={3} className="text-center">
                    <img
                      src={`https://pics.avs.io/80/40/${flight.validatingAirlineCodes[0]}.png`}
                      alt="Compagnia"
                      className="airline-logo"
                    />
                    <p className="text-secondary medium">
                      {flight.validatingAirlineCodes[0]}
                    </p>
                  </Col>
                  <Col>
                    <strong>
                      {returnSegment.departure.iataCode}{" "}
                      {returnSegment.departure.at.slice(11, 16)} →{" "}
                      {returnArrivalSegment.arrival.iataCode}{" "}
                      {returnArrivalSegment.arrival.at.slice(11, 16)}
                    </strong>
                    <p className="duration">
                      {formatDuration(flight.itineraries[1].duration)}
                    </p>
                  </Col>
                  <Col xs={1}>
                    <Form.Check
                      type="checkbox"
                      checked={isChecked("ritorno")}
                      onChange={() => handleCheckboxChange("ritorno")}
                    />
                  </Col>
                </Row>
              </>
            )}
          </Col>

          <Col className="price-section">
            <h4 className="text-success fw-bold">
              {parseFloat(flight.price.total).toFixed(2)} € <span>p.p.</span>
            </h4>
            <Button
              className="btn-continue rounded-pill"
              onClick={handleContinue}
            >
              Continua
            </Button>
            <div className="mt-3 text-center">
              <OverlayTrigger
                placement="top"
                overlay={
                  <Tooltip id="tooltip-preferiti">
                    {isFavorite
                      ? "Rimuovi dai preferiti"
                      : "Aggiungi ai preferiti"}
                  </Tooltip>
                }
              >
                <Button variant="link" onClick={gestisciTogglePreferito}>
                  {isFavorite ? (
                    <FaHeart color="red" size={24} />
                  ) : (
                    <FaRegHeart color="gray" size={24} />
                  )}
                </Button>
              </OverlayTrigger>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default VoliCards;
