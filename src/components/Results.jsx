import "../index.css";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Container,
  Spinner,
  Alert,
  Button,
  Card,
  Row,
  Col,
  OverlayTrigger,
  Tooltip,
  Form,
} from "react-bootstrap";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { searchFlights } from "../services/amadeus";
import FlightCard from "../components/VoliCards";

const formatDate = (dateString) => {
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
  const matches = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  return `${matches[1] || 0}h ${matches[2] || 0}m`;
};

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = location.state;

  const [flights, setFlights] = useState([]);
  const [filteredFlights, setFilteredFlights] = useState([]);
  const [selectedFlights, setSelectedFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [savedVoloId, setSavedVoloId] = useState(null);

  useEffect(() => {
    const fetchFlights = async () => {
      if (!searchParams) {
        setError("Nessun parametro di ricerca trovato. Ritorna alla home.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        let data = await searchFlights(
          searchParams.partenza,
          searchParams.arrivo,
          searchParams.dataAndata,
          searchParams.dataRitorno,
          searchParams.adulti
        );

        const uniqueFlights = Array.from(
          new Map(data.map((flight) => [flight.id, flight])).values()
        )
          .sort((a, b) => parseFloat(a.price.total) - parseFloat(b.price.total))
          .slice(0, 20);

        setFlights(uniqueFlights);
        setFilteredFlights(uniqueFlights);
      } catch (err) {
        setError("Errore nel recupero dei voli. Riprova più tardi.");
      } finally {
        setLoading(false);
      }
    };

    fetchFlights();
  }, [searchParams]);

  useEffect(() => {
    const andata = selectedFlights.find((f) => f.type === "andata");
    const ritorno = selectedFlights.find((f) => f.type === "ritorno");

    // Se ci sono sia andata che ritorno selezionati
    if (andata && ritorno) {
      // Non mostrare più le card di selezione, ma solo la card finale riassuntiva
      setFilteredFlights([]);
    } else {
      // Altrimenti mostra tutti i voli disponibili
      setFilteredFlights(flights);
    }
  }, [selectedFlights, flights]);

  const totale = selectedFlights
    .reduce((sum, f) => sum + parseFloat(f.flight.price.total), 0)
    .toFixed(2);

  const handleContinue = () => {
    const andata = selectedFlights.find((f) => f.type === "andata");
    const ritorno = selectedFlights.find((f) => f.type === "ritorno");

    navigate("/booking", {
      state: {
        andata: andata.flight.itineraries[0],
        ritorno: ritorno?.flight?.itineraries[1] || null,
        prezzo: totale,
      },
    });
  };

  // Funzione per salvare il volo nel backend
  const salvaVoloSuBackend = async (datiVolo) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return null;

    try {
      const res = await fetch("http://localhost:8080/api/voli/crea", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(datiVolo),
      });

      if (!res.ok) throw new Error("Errore salvataggio volo");
      return await res.json();
    } catch (error) {
      console.error("Errore nel salvare il volo:", error);
      return null;
    }
  };

  // Funzione per aggiungere ai preferiti
  const aggiungiAiPreferiti = async (idUtente, idVolo, token) => {
    try {
      const res = await fetch("http://localhost:8080/api/preferiti/aggiungi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ utenteId: idUtente, voloId: idVolo }),
      });

      if (!res.ok) throw new Error("Errore nell'aggiunta ai preferiti");
      return await res.json();
    } catch (error) {
      console.error("Errore nell'aggiungere ai preferiti:", error);
      return null;
    }
  };

  // Gestione dell'aggiunta di voli ai preferiti
  const aggiungiVoliAiPreferiti = async () => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      alert("Devi essere loggato per usare i preferiti");
      return;
    }

    // Verifica che ci siano voli selezionati
    if (!Array.isArray(selectedFlights) || selectedFlights.length === 0) {
      alert("Seleziona almeno un volo per aggiungere ai preferiti");
      return;
    }

    try {
      // Controlliamo se abbiamo sia andata che ritorno
      const andata = selectedFlights.find((f) => f.type === "andata");
      const ritorno = selectedFlights.find((f) => f.type === "ritorno");

      if (andata && ritorno) {
        // Salva come unico volo combinato andata-ritorno
        const voloCombinatoSalvare = {
          compagnia: andata.flight.validatingAirlineCodes[0],
          origine: andata.flight.itineraries[0].segments[0].departure.iataCode,
          destinazione:
            andata.flight.itineraries[0].segments.slice(-1)[0].arrival.iataCode,
          dataPartenza: andata.flight.itineraries[0].segments[0].departure.at,
          dataArrivo:
            andata.flight.itineraries[0].segments.slice(-1)[0].arrival.at,
          tipoVolo: "andata-ritorno", // Aggiungiamo un campo per identificare il tipo
          origineRitorno:
            ritorno.flight.itineraries[1].segments[0].departure.iataCode,
          destinazioneRitorno:
            ritorno.flight.itineraries[1].segments.slice(-1)[0].arrival
              .iataCode,
          dataPartenzaRitorno:
            ritorno.flight.itineraries[1].segments[0].departure.at,
          dataArrivoRitorno:
            ritorno.flight.itineraries[1].segments.slice(-1)[0].arrival.at,
          prezzo: parseFloat(totale), // Usa il prezzo totale combinato
        };

        const salvato = await salvaVoloSuBackend(voloCombinatoSalvare);
        if (salvato && salvato.id) {
          await aggiungiAiPreferiti(user.id, salvato.id, user.token);
        }
      } else {
        // Salva come volo singolo (solo andata o solo ritorno)
        for (const selected of selectedFlights) {
          if (!selected || !selected.flight) {
            console.error("Dati volo mancanti", selected);
            continue;
          }

          const voloSalvare = {
            compagnia: selected.flight.validatingAirlineCodes[0],
            origine:
              selected.flight.itineraries[selected.type === "andata" ? 0 : 1]
                .segments[0].departure.iataCode,
            destinazione:
              selected.flight.itineraries[
                selected.type === "andata" ? 0 : 1
              ].segments.slice(-1)[0].arrival.iataCode,
            dataPartenza:
              selected.flight.itineraries[selected.type === "andata" ? 0 : 1]
                .segments[0].departure.at,
            dataArrivo:
              selected.flight.itineraries[
                selected.type === "andata" ? 0 : 1
              ].segments.slice(-1)[0].arrival.at,
            tipoVolo: selected.type, // "andata" o "ritorno"
            prezzo: parseFloat(selected.flight.price.total),
          };

          const salvato = await salvaVoloSuBackend(voloSalvare);
          if (salvato && salvato.id) {
            await aggiungiAiPreferiti(user.id, salvato.id, user.token);
          }
        }
      }

      setIsFavorite(true);
      alert("Voli aggiunti ai preferiti");
    } catch (error) {
      console.error("Errore nell'aggiungere i voli ai preferiti:", error);
      alert("Si è verificato un errore. Riprova più tardi.");
    }
  };

  // Funzione per rimuovere dai preferiti
  const rimuoviDaiPreferiti = async (idUtente, idVolo, token) => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/preferiti/utente/${idUtente}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Errore nel recupero dei preferiti");

      const preferiti = await res.json();
      const match = preferiti.find((p) => p.voloId === idVolo);

      if (match) {
        const deleteRes = await fetch(
          `http://localhost:8080/api/preferiti/${match.id}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!deleteRes.ok)
          throw new Error("Errore nella rimozione dai preferiti");
      }
    } catch (error) {
      console.error("Errore nel rimuovere dai preferiti:", error);
    }
  };
  // Controlla quale checkbox è selezionata
  const isChecked = (flightId, type) => {
    // Verifica che selectedFlights sia un array
    if (!Array.isArray(selectedFlights)) {
      return false;
    }

    return selectedFlights.some((f) => f.id === flightId && f.type === type);
  };

  return (
    <Container className="mt-4">
      <h1 className="text-center testo-risultati mb-4">
        Risultati della ricerca ✈
      </h1>

      {loading && (
        <div className="text-center mt-3">
          <Spinner animation="border" variant="primary" />
          <p className="testo-risultati mt-2">Caricamento in corso...</p>
        </div>
      )}

      {error && (
        <Alert variant="danger" className="mt-3">
          {error}
        </Alert>
      )}

      {!loading &&
        !error &&
        filteredFlights.length === 0 &&
        selectedFlights.length !== 2 && (
          <p className="text-secondary text-center">
            Nessun volo trovato. Prova a cambiare date o destinazioni.
          </p>
        )}

      {!loading &&
        !error &&
        filteredFlights.map((flight) => (
          <FlightCard
            key={flight.id}
            flight={flight}
            allFlights={flights}
            filteredFlights={filteredFlights}
            setFilteredFlights={setFilteredFlights}
            selectedFlights={selectedFlights}
            setSelectedFlights={setSelectedFlights}
            isChecked={(type) => isChecked(flight.id, type)}
          />
        ))}

      {!loading && !error && selectedFlights.length > 0 && (
        <Card className="flight-card shadow-sm my-4">
          <Card.Body>
            <Row className="m-3">
              <Col xs={10}>
                {selectedFlights.map((f, idx) => (
                  <>
                    <Row key={idx} className="align-items-center mb-3">
                      <Col xs={2}>
                        {" "}
                        <p className="flight-date">
                          {formatDate(
                            f.flight.itineraries[f.type === "andata" ? 0 : 1]
                              .segments[0].departure.at
                          )}
                        </p>
                        <p
                          className={`fw-bold ${
                            f.type === "andata"
                              ? "text-success"
                              : "text-primary"
                          }`}
                        >
                          {f.type === "andata" ? "Andata" : "Ritorno"}
                        </p>
                      </Col>
                      <Col xs={3} className="text-center">
                        <img
                          src={`https://pics.avs.io/80/40/${f.flight.validatingAirlineCodes[0]}.png`}
                          alt="Compagnia"
                          className="airline-logo"
                        />
                        <p className="text-secondary medium">
                          {f.flight.validatingAirlineCodes[0]}
                        </p>
                      </Col>
                      <Col>
                        <strong>
                          {
                            f.flight.itineraries[f.type === "andata" ? 0 : 1]
                              .segments[0].departure.iataCode
                          }{" "}
                          {f.flight.itineraries[
                            f.type === "andata" ? 0 : 1
                          ].segments[0].departure.at.slice(11, 16)}{" "}
                          →{" "}
                          {
                            f.flight.itineraries[
                              f.type === "andata" ? 0 : 1
                            ].segments.slice(-1)[0].arrival.iataCode
                          }{" "}
                          {f.flight.itineraries[
                            f.type === "andata" ? 0 : 1
                          ].segments
                            .slice(-1)[0]
                            .arrival.at.slice(11, 16)}
                        </strong>
                        <p className="duration">
                          {formatDuration(
                            f.flight.itineraries[f.type === "andata" ? 0 : 1]
                              .duration
                          )}
                        </p>
                      </Col>

                      <Col xs={1}>
                        <Form.Check
                          type="checkbox"
                          checked={true}
                          onChange={() => {
                            // Quando si deseleziona, rimuove il volo dai selezionati
                            const updatedSelections = selectedFlights.filter(
                              (sf) => !(sf.id === f.id && sf.type === f.type)
                            );
                            setSelectedFlights(updatedSelections);
                            setFilteredFlights(flights);
                          }}
                        />
                      </Col>
                    </Row>
                    {idx === 0 && selectedFlights.length > 1 && (
                      <hr className="hr-cards" />
                    )}
                  </>
                ))}
              </Col>

              <Col className="price-section">
                <h4 className="text-success fw-bold">
                  {totale} € <span>p.p.</span>
                </h4>
                <Button
                  className="btn-continue rounded-pill"
                  onClick={handleContinue}
                  disabled={selectedFlights.length === 0}
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
                    <Button variant="link" onClick={aggiungiVoliAiPreferiti}>
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
      )}
    </Container>
  );
};

export default Results;
