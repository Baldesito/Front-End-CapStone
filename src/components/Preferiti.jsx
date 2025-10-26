import "../index.css";
import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Spinner,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { FaHeart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { preferitiAPI } from "../config/api";

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

const formatTime = (datetime) => datetime?.slice(11, 16) || "";

const formatDuration = (departure, arrival) => {
  const start = new Date(departure);
  const end = new Date(arrival);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return "-";

  const diffMs = end - start;
  const h = Math.floor(diffMs / (1000 * 60 * 60));
  const m = Math.floor((diffMs / (1000 * 60)) % 60);
  return `${h}h ${m}m`;
};

const Preferiti = () => {
  const navigate = useNavigate();
  const [caricamento, setCaricamento] = useState(true);
  const [preferiti, setPreferiti] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const recuperaPreferiti = async () => {
      if (!user) return;
      try {
        const risposta = await preferitiAPI.getByUser(user.id);
        const dati = risposta.data;
        const ordinati = dati.sort(
          (a, b) => new Date(a.dataPartenza) - new Date(b.dataPartenza)
        );
        setPreferiti(ordinati);
      } catch (errore) {
        console.error("Errore nel recupero dei preferiti:", errore);
      } finally {
        setCaricamento(false);
      }
    };
    recuperaPreferiti();
  }, [user]);

  const rimuoviPreferito = async (id) => {
    try {
      await preferitiAPI.remove(id);
      setPreferiti(preferiti.filter((f) => f.id !== id));
    } catch (errore) {
      console.error("Errore rimozione preferito:", errore);
    }
  };

  if (caricamento)
    return (
      <div className="text-center text-white mt-5">
        <Spinner animation="border" />
      </div>
    );
  if (preferiti.length === 0)
    return (
      <p className="text-center text-secondary mt-5">
        Nessun volo nei preferiti.
      </p>
    );

  return (
    <div className="container text-white mt-4">
      <h1 className="mb-4 text-center testo-risultati">
        I tuoi voli preferiti ✈
      </h1>
      {preferiti.map((fav) => {
        const oraPartenza = formatTime(fav.dataPartenza);
        const oraArrivo = formatTime(fav.dataArrivo);
        const durata = formatDuration(fav.dataPartenza, fav.dataArrivo);
        const data = formatDate(fav.dataPartenza);

        // Verifica se è un volo combinato basandosi sul prezzo
        const isAndataRitorno =
          fav.tipoVolo === "andata-ritorno" || fav.prezzo > 400;

        // Se non abbiamo i dati del ritorno ma è un volo andata-ritorno, imposta valori di default
        const origineRitorno = fav.origineRitorno || "ORY";
        const destinazioneRitorno = fav.destinazioneRitorno || "MXP";
        const dataRitorno = fav.dataPartenzaRitorno
          ? formatDate(fav.dataPartenzaRitorno)
          : formatDate(fav.dataPartenza);

        // Per gli orari, se non abbiamo i dati, prendiamo orari generici
        const oraPartenzaRitorno =
          formatTime(fav.dataPartenzaRitorno) || "07:25";
        const oraArrivoRitorno = formatTime(fav.dataArrivoRitorno) || "08:55";

        const scalo =
          fav.origine === fav.destinazione ? "1 scalo" : "Volo diretto";

        return (
          <Card className="flight-card shadow-sm mb-4 " key={fav.id}>
            <Card.Body>
              <Row className="m-3">
                <Col xs={10} className="flight-info">
                  {/* Sezione Andata */}
                  <Row className="align-items-center mb-3">
                    <Col xs={2}>
                      <p className="flight-date">{data}</p>
                      <p className="text-success fw-bold">Andata</p>
                    </Col>
                    <Col xs={3} className="text-center">
                      <img
                        src={`https://pics.avs.io/80/40/${fav.compagnia}.png`}
                        alt="Compagnia"
                        className="airline-logo"
                      />
                      <p className="text-secondary medium">{fav.compagnia}</p>
                    </Col>
                    <Col>
                      <strong className="testo-risultati">
                        {fav.origine} {oraPartenza} → {fav.destinazione}{" "}
                        {oraArrivo}
                      </strong>
                      <p className="duration">{durata}</p>{" "}
                      <p className="text-primary small">{scalo}</p>
                    </Col>
                  </Row>

                  {/* Sezione Ritorno - mostrata solo per voli combinati */}
                  {isAndataRitorno && (
                    <>
                      <hr className="hr-cards" />
                      <Row className="align-items-center">
                        <Col xs={2}>
                          <p className="flight-date">{dataRitorno}</p>
                          <p className="text-primary fw-bold">Ritorno</p>
                        </Col>
                        <Col xs={3} className="text-center">
                          <img
                            src={`https://pics.avs.io/80/40/${fav.compagnia}.png`}
                            alt="Compagnia"
                            className="airline-logo"
                          />
                          <p className="text-secondary medium">
                            {fav.compagnia}
                          </p>
                        </Col>
                        <Col>
                          <strong className="testo-risultati">
                            {origineRitorno} {oraPartenzaRitorno} →{" "}
                            {destinazioneRitorno} {oraArrivoRitorno}
                          </strong>
                          <p className="duration">1h 30m</p>{" "}
                          <p className="text-primary small">Volo diretto</p>
                        </Col>
                      </Row>
                    </>
                  )}
                </Col>
                {/* Prezzo + Continua + rimuovi */}
                <Col className="price-section">
                  <h4 className="text-success fw-bold">
                    {fav.prezzo?.toFixed(2)} € <span>p.p.</span>
                  </h4>
                  <Button
                    className="btn-continue rounded-pill"
                    onClick={() => {
                      navigate("/booking", {
                        state: {
                          andata: {
                            segments: [
                              {
                                departure: {
                                  iataCode: fav.origine,
                                  at: fav.dataPartenza,
                                },
                                arrival: {
                                  iataCode: fav.destinazione,
                                  at: fav.dataArrivo,
                                },
                              },
                            ],
                          },
                          ritorno: isAndataRitorno
                            ? {
                                segments: [
                                  {
                                    departure: {
                                      iataCode: origineRitorno,
                                      at:
                                        fav.dataPartenzaRitorno ||
                                        new Date().toISOString(),
                                    },
                                    arrival: {
                                      iataCode: destinazioneRitorno,
                                      at:
                                        fav.dataArrivoRitorno ||
                                        new Date().toISOString(),
                                    },
                                  },
                                ],
                              }
                            : null,
                          prezzo: fav.prezzo.toFixed(2),
                        },
                      });
                    }}
                  >
                    Continua
                  </Button>
                  <div className="mt-3 text-center">
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip>Rimuovi dai preferiti</Tooltip>}
                    >
                      <Button
                        variant="link"
                        onClick={() => rimuoviPreferito(fav.id)}
                      >
                        <FaHeart color="red" size={24} />
                      </Button>
                    </OverlayTrigger>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        );
      })}
    </div>
  );
};

export default Preferiti;
