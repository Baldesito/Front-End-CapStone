import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import "../index.css";

const FormPagamento = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { passeggero, voloAndata, voloRitorno, prezzo } = location.state || {};
  const [token, setToken] = useState("");

  // Recupera il token all'avvio del componente
  useEffect(() => {
    const storedToken =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    setToken(storedToken);
  }, []);

  // Verifica che i dati necessari siano presenti
  if (!location.state || !voloAndata) {
    return (
      <Container className="mt-5 text-center">
        <p className="text-danger">Errore: Dati del volo non disponibili.</p>
        <Button
          variant="primary"
          onClick={() => navigate("/")}
          className="mt-3"
        >
          Torna alla homepage
        </Button>
      </Container>
    );
  }

  // Stato per il modulo di contatto
  const [contatto, setContatto] = useState({
    nome: passeggero?.nome || "",
    cognome: passeggero?.cognome || "",
    nazione: "Italia",
    prefisso: "+39",
    telefono: "",
    email: "",
  });

  // Stato per il modulo di pagamento
  const [pagamento, setPagamento] = useState({
    numeroCarta: "",
    titolareCarta: "",
    dataScadenzaMese: "",
    dataScadenzaAnno: "",
    cvv: "",
    importo: prezzo || 0,
    stato: "IN_ATTESA",
    dataPagamento: new Date().toISOString().split("T")[0],
  });

  // Funzione per aggiornare lo stato dei form
  const gestisciCambio = (event) => {
    const { name, value, type, checked } = event.target;

    if (type === "checkbox") {
      setContatto((prev) => ({ ...prev, [name]: checked }));
    } else {
      if (
        [
          "numeroCarta",
          "titolareCarta",
          "dataScadenzaMese",
          "dataScadenzaAnno",
          "cvv",
        ].includes(name)
      ) {
        setPagamento((prev) => ({ ...prev, [name]: value }));
      } else {
        setContatto((prev) => ({ ...prev, [name]: value }));
      }
    }
  };

  // Funzione per inviare i dati
  const gestisciInvio = async (event) => {
    event.preventDefault();

    // Validazione campi
    if (
      !contatto.nome ||
      !contatto.cognome ||
      !contatto.email ||
      !contatto.telefono
    ) {
      alert("Per favore compila tutti i campi del contatto");
      return;
    }

    if (
      !pagamento.numeroCarta ||
      !pagamento.titolareCarta ||
      !pagamento.dataScadenzaMese ||
      !pagamento.dataScadenzaAnno ||
      !pagamento.cvv
    ) {
      alert("Per favore compila tutti i campi di pagamento");
      return;
    }

    // Valida il formato della carta di credito (esempio base)
    if (!/^\d{16}$/.test(pagamento.numeroCarta.replace(/\s/g, ""))) {
      alert("Il numero della carta deve contenere 16 cifre");
      return;
    }

    // Valida il CVV (esempio base)
    if (!/^\d{3}$/.test(pagamento.cvv)) {
      alert("Il CVV deve contenere 3 cifre");
      return;
    }

    // Verifica se il token è disponibile
    if (!token) {
      alert("Sessione scaduta. Effettua nuovamente il login.");
      navigate("/login");
      return;
    }

    // Prepara l'oggetto di pagamento con la data scadenza unita
    const datiPagamento = {
      ...pagamento,
      dataScadenza: `${pagamento.dataScadenzaMese}/${pagamento.dataScadenzaAnno}`,
    };

    try {
      console.log("Dati contatto da inviare:", contatto);

      const rispostaContatto = await fetch(
        "http://localhost:8080/api/contatti/salva",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(contatto),
        }
      );

      if (!rispostaContatto.ok) {
        const errorText = await rispostaContatto.text();
        console.error("Errore dal server:", errorText);
        throw new Error(`Errore ${rispostaContatto.status}: ${errorText}`);
      }

      // Salviamo i dati di pagamento
      const rispostaPagamento = await fetch(
        "http://localhost:8080/api/pagamenti/salva",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(datiPagamento),
        }
      );

      if (!rispostaPagamento.ok) {
        throw new Error("Errore nel salvataggio del pagamento.");
      }

      alert("Pagamento completato con successo!");
      // Redireziona alla home page
      navigate("/", {
        state: {
          message: "Prenotazione completata con successo!",
        },
      });
    } catch (error) {
      console.error("Errore:", error);
      alert("Si è verificato un errore durante il pagamento. " + error.message);
    }
  };

  // Funzione per estrarre informationi di volo in modo sicuro
  const estraiInfoVolo = (volo) => {
    if (!volo || !volo.segments || volo.segments.length === 0) {
      return {
        codicePartenza: "---",
        codiceArrivo: "---",
        oraPartenza: "--:--",
        oraArrivo: "--:--",
      };
    }

    const segmentoPartenza = volo.segments[0];
    const segmentoArrivo = volo.segments[volo.segments.length - 1];

    return {
      codicePartenza: segmentoPartenza.departure?.iataCode || "---",
      codiceArrivo: segmentoArrivo.arrival?.iataCode || "---",
      oraPartenza: segmentoPartenza.departure?.at
        ? segmentoPartenza.departure.at.slice(11, 16)
        : "--:--",
      oraArrivo: segmentoArrivo.arrival?.at
        ? segmentoArrivo.arrival.at.slice(11, 16)
        : "--:--",
    };
  };

  const infoVoloAndata = estraiInfoVolo(voloAndata);
  const infoVoloRitorno = voloRitorno ? estraiInfoVolo(voloRitorno) : null;

  return (
    <Container className="payment-container mt-4">
      <Row>
        {/* Sidebar con il riepilogo */}
        <Col md={4} className="sidebar">
          <Card className="flight-summary">
            <Card.Body>
              <h5 className="fw-bold">Volo Andata</h5>
              <p>
                {infoVoloAndata.codicePartenza} → {infoVoloAndata.codiceArrivo}
              </p>
              <p>
                {infoVoloAndata.oraPartenza} - {infoVoloAndata.oraArrivo}
              </p>
              <hr />

              {infoVoloRitorno && (
                <>
                  <h5 className="fw-bold">Volo Ritorno</h5>
                  <p>
                    {infoVoloRitorno.codicePartenza} →{" "}
                    {infoVoloRitorno.codiceArrivo}
                  </p>
                  <p>
                    {infoVoloRitorno.oraPartenza} - {infoVoloRitorno.oraArrivo}
                  </p>
                  <hr />
                </>
              )}

              <h4 className="fw-bold text-primary">
                Prezzo Totale: {prezzo} €
              </h4>
            </Card.Body>
          </Card>
        </Col>

        {/* Form di contatto e pagamento */}
        <Col md={8}>
          <Card className="contact-form shadow-sm">
            <Card.Body>
              <h4 className="fw-bold baggage-options">Contatto</h4>
              <Form onSubmit={gestisciInvio}>
                <Row>
                  <Col md={6}>
                    <Form.Label>Nome</Form.Label>
                    <Form.Control
                      type="text"
                      name="nome"
                      value={contatto.nome}
                      onChange={gestisciCambio}
                      required
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Label>Cognome</Form.Label>
                    <Form.Control
                      type="text"
                      name="cognome"
                      value={contatto.cognome}
                      onChange={gestisciCambio}
                      required
                    />
                  </Col>
                </Row>

                <Row className="mt-3">
                  <Col md={6}>
                    <Form.Label>Nazione</Form.Label>
                    <Form.Control
                      type="text"
                      name="nazione"
                      value={contatto.nazione}
                      onChange={gestisciCambio}
                      required
                    />
                  </Col>
                  <Col md={3}>
                    <Form.Label>Prefisso</Form.Label>
                    <Form.Control
                      className="prefisso"
                      type="text"
                      name="prefisso"
                      value={contatto.prefisso}
                      onChange={gestisciCambio}
                      required
                    />
                  </Col>
                  <Col md={3}>
                    <Form.Label>Telefono</Form.Label>
                    <Form.Control
                      type="text"
                      name="telefono"
                      value={contatto.telefono}
                      onChange={gestisciCambio}
                      required
                    />
                  </Col>
                </Row>

                <Row className="mt-3">
                  <Col md={12}>
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={contatto.email}
                      onChange={gestisciCambio}
                      required
                    />
                  </Col>
                </Row>

                {/* Sezione Pagamento */}
                <Card className="payment-form shadow-sm mt-3">
                  <Card.Body>
                    <h4 className="fw-bold baggage-options">
                      Dati di pagamento
                    </h4>
                    <Row>
                      <Col md={12}>
                        <Form.Label>Numero della carta</Form.Label>
                        <Form.Control
                          type="text"
                          name="numeroCarta"
                          value={pagamento.numeroCarta}
                          onChange={gestisciCambio}
                          required
                          placeholder="1234 5678 9012 3456"
                        />
                      </Col>
                    </Row>
                    <Row className="mt-3">
                      <Col md={12}>
                        <Form.Label>Titolare della carta</Form.Label>
                        <Form.Control
                          type="text"
                          name="titolareCarta"
                          value={pagamento.titolareCarta}
                          onChange={gestisciCambio}
                          required
                          placeholder="Nome e Cognome"
                        />
                      </Col>
                    </Row>
                    <Row className="mt-3">
                      <Col md={6}>
                        <Form.Label>Data di scadenza</Form.Label>
                        <Row>
                          <Col md={6}>
                            <Form.Control
                              type="text"
                              name="dataScadenzaMese"
                              value={pagamento.dataScadenzaMese}
                              onChange={gestisciCambio}
                              required
                              placeholder="MM"
                              maxLength={2}
                            />
                          </Col>
                          <Col md={6}>
                            <Form.Control
                              type="text"
                              name="dataScadenzaAnno"
                              value={pagamento.dataScadenzaAnno}
                              onChange={gestisciCambio}
                              required
                              placeholder="YY"
                              maxLength={2}
                            />
                          </Col>
                        </Row>
                      </Col>
                      <Col md={6}>
                        <Form.Label>CVV</Form.Label>
                        <Form.Control
                          type="text"
                          name="cvv"
                          value={pagamento.cvv}
                          onChange={gestisciCambio}
                          required
                          placeholder="123"
                          maxLength={3}
                        />
                      </Col>
                    </Row>
                    <Button
                      variant="success"
                      type="submit"
                      className="mt-4 rounded-pill"
                    >
                      Paga Ora
                    </Button>
                  </Card.Body>
                </Card>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default FormPagamento;
