import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import CustomDateOfBirthInput from "./CustomDateOfBirthInput";
import "../index.css";

const FormPrenota = () => {
  const location = useLocation();
  const voloSelezionato = location.state;
  const navigate = useNavigate();

  if (!voloSelezionato) {
    return <p className="text-danger">Errore: Nessun volo selezionato.</p>;
  }

  const [passeggero, setPasseggero] = useState({
    nome: "",
    cognome: "",
    nazionalita: "Italia",
    dataNascita: null,
    genere: "Sig.",
  });

  const [opzioniBagaglio, setOpzioniBagaglio] = useState({
    bagaglioManoAndata: "Incluso",
    bagaglioManoRitorno: "Incluso",
    bagaglioStivaAndata: "Nessuno",
    bagaglioStivaRitorno: "Nessuno",
  });

  const [prezziBagaglio, setPrezziBagaglio] = useState({
    prioritaMano: 17.5,
    prioritaManoRitorno: 27.17,
    bagaglio10kg: 20,
    bagaglio20kg: 35,
    bagaglio25kg: 51,
    bagaglio32kg: 66,
  });

  const gestisciModificaBagaglio = (e) => {
    setOpzioniBagaglio({ ...opzioniBagaglio, [e.target.name]: e.target.value });
  };

  const gestisciModificaPasseggero = (e) => {
    setPasseggero({ ...passeggero, [e.target.name]: e.target.value });
  };

  // Gestisci la data di nascita separatamente
  const gestisciDataNascita = (data) => {
    setPasseggero((prev) => ({
      ...prev,
      dataNascita: data.toISOString().split("T")[0],
    }));
  };

  // Nel componente FormPrenota
  const gestisciProcediPagamento = async () => {
    // Verifica che tutti i campi obbligatori siano stati compilati
    if (!passeggero.nome || !passeggero.cognome || !passeggero.dataNascita) {
      alert("Per favore compila tutti i campi obbligatori");
      return;
    }

    // Crea un oggetto con la struttura corretta per il backend
    const datiPasseggero = {
      ...passeggero,
      voloAndata: {
        iataCodePartenza: voloSelezionato.andata.segments[0].departure.iataCode,
        iataCodeArrivo:
          voloSelezionato.andata.segments[
            voloSelezionato.andata.segments.length - 1
          ].arrival.iataCode,
        dataPartenza: voloSelezionato.andata.segments[0].departure.at,
        dataArrivo:
          voloSelezionato.andata.segments[
            voloSelezionato.andata.segments.length - 1
          ].arrival.at,
      },
      voloRitorno: voloSelezionato.ritorno
        ? {
            iataCodePartenza:
              voloSelezionato.ritorno.segments[0].departure.iataCode,
            iataCodeArrivo:
              voloSelezionato.ritorno.segments[
                voloSelezionato.ritorno.segments.length - 1
              ].arrival.iataCode,
            dataPartenza: voloSelezionato.ritorno.segments[0].departure.at,
            dataArrivo:
              voloSelezionato.ritorno.segments[
                voloSelezionato.ritorno.segments.length - 1
              ].arrival.at,
          }
        : null,
      prezzo: voloSelezionato.prezzo,
      bagagli: opzioniBagaglio,
    };

    console.log("Dati passeggero da inviare:", datiPasseggero); // Debugging

    try {
      const utente = JSON.parse(localStorage.getItem("user"));
      if (!utente || !utente.token) {
        throw new Error("Devi essere loggato per completare questa operazione");
      }

      const risposta = await fetch(
        "http://localhost:8080/api/passaggeri/crea",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${utente.token}`,
          },
          body: JSON.stringify(datiPasseggero),
        }
      );

      if (!risposta.ok) {
        const erroreText = await risposta.text();
        console.error("Risposta del server:", erroreText);
        throw new Error("Errore durante salvataggio dati passeggero");
      }

      const passeggeroSalvato = await risposta.json();
      console.log("Passeggero salvato:", passeggeroSalvato);

      navigate("/payment", {
        state: {
          passeggero: datiPasseggero,
          voloAndata: voloSelezionato.andata,
          voloRitorno: voloSelezionato.ritorno,
          prezzo: voloSelezionato.prezzo,
        },
      });
    } catch (errore) {
      console.error("Errore salvataggio:", errore);
      alert("Errore nel salvataggio dati: " + errore.message);
    }
  };

  // Calcola la data minima (18 anni fa)
  const dataMinima = (() => {
    const oggi = new Date();
    oggi.setFullYear(oggi.getFullYear() - 18);
    return oggi;
  })();

  return (
    <Container className="booking-container mt-4">
      <Row>
        {/* Sidebar con dettagli del volo */}
        <Col md={4} className="sidebar">
          <Card className="flight-summary">
            <Card.Body>
              <h5 className="fw-bold">Volo Andata</h5>
              <p>
                {voloSelezionato.andata.segments[0].departure.iataCode} →{" "}
                {
                  voloSelezionato.andata.segments[
                    voloSelezionato.andata.segments.length - 1
                  ].arrival.iataCode
                }
              </p>
              <p>
                {voloSelezionato.andata.segments[0].departure.at.slice(11, 16)}{" "}
                -{" "}
                {voloSelezionato.andata.segments[
                  voloSelezionato.andata.segments.length - 1
                ].arrival.at.slice(11, 16)}
              </p>
              <hr />

              {voloSelezionato.ritorno && (
                <>
                  <h5 className="fw-bold">Volo Ritorno</h5>
                  <p>
                    {voloSelezionato.ritorno.segments[0].departure.iataCode} →{" "}
                    {
                      voloSelezionato.ritorno.segments[
                        voloSelezionato.ritorno.segments.length - 1
                      ].arrival.iataCode
                    }
                  </p>
                  <p>
                    {voloSelezionato.ritorno.segments[0].departure.at.slice(
                      11,
                      16
                    )}{" "}
                    -{" "}
                    {voloSelezionato.ritorno.segments[
                      voloSelezionato.ritorno.segments.length - 1
                    ].arrival.at.slice(11, 16)}
                  </p>
                  <hr />
                </>
              )}

              <h4 className="fw-bold text-success">
                Prezzo Totale: {voloSelezionato.prezzo} €
              </h4>
            </Card.Body>
          </Card>
        </Col>

        {/* Form per il passeggero */}
        <Col md={8}>
          <Card className="passenger-form">
            <Card.Body className="contact-form">
              <h4 className="fw-bold baggage-options">Dati del passeggero</h4>
              <Form>
                <Row className="text-white">
                  <Col md={6}>
                    <Form.Label>Nome</Form.Label>
                    <Form.Control
                      name="nome"
                      required
                      value={passeggero.nome}
                      onChange={gestisciModificaPasseggero}
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Label>Cognome</Form.Label>
                    <Form.Control
                      name="cognome"
                      required
                      value={passeggero.cognome}
                      onChange={gestisciModificaPasseggero}
                    />
                  </Col>
                </Row>
                <Row className="mt-3 text-white">
                  <Col md={4}>
                    <CustomDateOfBirthInput
                      label="Data di nascita"
                      selectedDate={
                        passeggero.dataNascita
                          ? new Date(passeggero.dataNascita)
                          : null
                      }
                      onChange={gestisciDataNascita}
                      minDate={new Date(1940, 0, 1)}
                      maxDate={dataMinima}
                    />
                  </Col>
                  <Col md={4}>
                    <Form.Label>Genere</Form.Label>
                    <Form.Select
                      name="genere"
                      value={passeggero.genere}
                      onChange={gestisciModificaPasseggero}
                    >
                      <option>Sig.</option>
                      <option>Sig.ra</option>
                    </Form.Select>
                  </Col>
                  <Col md={4}>
                    <Form.Label>Nazionalità</Form.Label>
                    <Form.Select
                      name="nazionalita"
                      value={passeggero.nazionalita}
                      onChange={gestisciModificaPasseggero}
                    >
                      <option>Italia</option>
                      <option>Francia</option>
                      <option>Germania</option>
                      <option>USA</option>
                    </Form.Select>
                  </Col>
                </Row>

                {/* Resto del codice rimane invariato */}
                <Row className="mt-4 text-white">
                  <h4 className="fw-bold baggage-options">
                    Bagaglio a mano Andata
                  </h4>
                  <Col md={12}>
                    <Form.Select
                      name="bagaglioManoAndata"
                      value={opzioniBagaglio.bagaglioManoAndata}
                      onChange={gestisciModificaBagaglio}
                    >
                      <option value="Incluso">Incluso</option>
                      <option value="Prioritario">
                        Prioritario (+{prezziBagaglio.prioritaMano}€)
                      </option>
                    </Form.Select>
                  </Col>
                </Row>

                {voloSelezionato.ritorno && (
                  <Row className="mt-3 text-white">
                    <h4 className="fw-bold baggage-options">
                      Bagaglio a mano Ritorno
                    </h4>
                    <Col md={12}>
                      <Form.Select
                        name="bagaglioManoRitorno"
                        value={opzioniBagaglio.bagaglioManoRitorno}
                        onChange={gestisciModificaBagaglio}
                      >
                        <option value="Incluso">Incluso</option>
                        <option value="Prioritario">
                          Prioritario (+{prezziBagaglio.prioritaManoRitorno}€)
                        </option>
                      </Form.Select>
                    </Col>
                  </Row>
                )}

                <Row className="mt-3 text-white">
                  <h4 className="fw-bold baggage-options">Bagaglio in Stiva</h4>
                  <Col md={12}>
                    <Form.Select
                      name="bagaglioStivaAndata"
                      value={opzioniBagaglio.bagaglioStivaAndata}
                      onChange={gestisciModificaBagaglio}
                    >
                      <option value="Nessuno">Nessuno</option>
                      <option value="10kg">
                        10kg (+{prezziBagaglio.bagaglio10kg}€)
                      </option>
                      <option value="20kg">
                        20kg (+{prezziBagaglio.bagaglio20kg}€)
                      </option>
                      <option value="25kg">
                        25kg (+{prezziBagaglio.bagaglio25kg}€)
                      </option>
                      <option value="32kg">
                        32kg (+{prezziBagaglio.bagaglio32kg}€)
                      </option>
                    </Form.Select>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>

          {/* Pulsante di conferma */}
          <div className="text-end mt-3">
            <Button
              variant="primary rounded-pill"
              size="lg"
              onClick={gestisciProcediPagamento}
            >
              Procedi al pagamento
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default FormPrenota;
