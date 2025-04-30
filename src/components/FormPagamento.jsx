import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
} from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import "../index.css";

const FormPagamento = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { passeggero, voloAndata, voloRitorno, prezzo } = location.state || {};
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  // Recupera il token e l'utente completo all'avvio del componente
  useEffect(() => {
    // Controlla sia localStorage che sessionStorage
    const userData = JSON.parse(
      localStorage.getItem("user") || sessionStorage.getItem("user") || "{}"
    );
    const storedToken =
      userData.token ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("token");

    console.log("User trovato:", userData);
    console.log("Token trovato:", storedToken);

    if (!storedToken) {
      setError(
        "Sessione scaduta o login non effettuato. Effettua il login per procedere."
      );
      return;
    }

    setToken(storedToken);
    setUser(userData);
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

  // Funzione per inviare i dati con gestione migliorata del token
  const gestisciInvio = async (event) => {
    event.preventDefault();
    setError("");

    // Debug dell'oggetto voloAndata
    console.log(
      "Struttura completa di voloAndata:",
      JSON.stringify(voloAndata, null, 2)
    );

    // Recupera il token più aggiornato
    const userData = JSON.parse(
      localStorage.getItem("user") || sessionStorage.getItem("user") || "{}"
    );
    const currentToken =
      userData.token ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("token");

    // Verifica se il token è disponibile
    if (!currentToken) {
      setError("Sessione scaduta. Effettua nuovamente il login.");
      return;
    }

    // Validazione campi
    if (
      !contatto.nome ||
      !contatto.cognome ||
      !contatto.email ||
      !contatto.telefono
    ) {
      setError("Per favore compila tutti i campi del contatto");
      return;
    }

    if (
      !pagamento.numeroCarta ||
      !pagamento.titolareCarta ||
      !pagamento.dataScadenzaMese ||
      !pagamento.dataScadenzaAnno ||
      !pagamento.cvv
    ) {
      setError("Per favore compila tutti i campi di pagamento");
      return;
    }

    // Valida il formato della carta di credito (esempio base)
    if (!/^\d{16}$/.test(pagamento.numeroCarta.replace(/\s/g, ""))) {
      setError("Il numero della carta deve contenere 16 cifre");
      return;
    }

    // Valida il CVV (esempio base)
    if (!/^\d{3}$/.test(pagamento.cvv)) {
      setError("Il CVV deve contenere 3 cifre");
      return;
    }

    // Prepara l'oggetto di pagamento con la data scadenza unita
    const datiPagamento = {
      ...pagamento,
      dataScadenza: `${pagamento.dataScadenzaMese}/${pagamento.dataScadenzaAnno}`,
    };

    setIsLoading(true);

    try {
      console.log("Token utilizzato per la richiesta:", currentToken);
      console.log("Dati contatto da inviare:", contatto);
      console.log("Dati volo andata:", voloAndata);
      console.log("Dati utente:", userData);

      // Prima richiesta: salva il contatto
      const rispostaContatto = await fetch(
        "http://localhost:8080/api/contatti/salva",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentToken}`,
          },
          body: JSON.stringify(contatto),
          credentials: "include",
        }
      );

      console.log("Status risposta contatto:", rispostaContatto.status);

      if (!rispostaContatto.ok) {
        const errorText = await rispostaContatto.text();
        console.error("Errore dal server (contatto):", errorText);

        if (rispostaContatto.status === 403) {
          throw new Error(
            "Non hai l'autorizzazione per effettuare questa operazione. Prova a effettuare nuovamente il login."
          );
        }

        throw new Error(`Errore ${rispostaContatto.status}: ${errorText}`);
      }

      // Seconda richiesta: salva i dati di pagamento
      console.log("Invio dati pagamento:", datiPagamento);

      const rispostaPagamento = await fetch(
        "http://localhost:8080/api/pagamenti/salva",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentToken}`,
          },
          body: JSON.stringify(datiPagamento),
          credentials: "include",
        }
      );

      console.log("Status risposta pagamento:", rispostaPagamento.status);

      if (!rispostaPagamento.ok) {
        const errorText = await rispostaPagamento.text();
        console.error("Errore dal server (pagamento):", errorText);
        throw new Error(
          `Errore nel salvataggio del pagamento: ${rispostaPagamento.status}`
        );
      }

      // Se il pagamento è stato completato con successo, procedi alla creazione della prenotazione
      if (rispostaPagamento.ok) {
        // Determina l'ID del volo correttamente in base alla struttura del dato
        let voloId;

        if (voloAndata.id) {
          voloId = voloAndata.id;
        } else if (
          voloAndata.segments &&
          voloAndata.segments[0] &&
          voloAndata.segments[0].id
        ) {
          voloId = voloAndata.segments[0].id;
        } else if (voloAndata.voloId) {
          voloId = voloAndata.voloId;
        } else {
          // Se non troviamo un ID standard, guardiamo nei parametri del location state
          voloId =
            location.state && location.state.idVolo
              ? location.state.idVolo
              : null;

          if (!voloId) {
            console.error(
              "ID volo non trovato nella struttura disponibile:",
              voloAndata
            );
            throw new Error(
              "Impossibile determinare l'ID del volo dalla struttura disponibile"
            );
          }
        }

        // Log del valore di voloId trovato
        console.log("Valore di voloId prima della conversione:", voloId);
        const voloIdNumerico = Number(voloId);
        console.log("Valore di voloId dopo la conversione:", voloIdNumerico);

        // Verifica che l'ID sia valido
        if (!voloIdNumerico || isNaN(voloIdNumerico)) {
          throw new Error(
            "ID del volo non valido o non trovato nella struttura dati"
          );
        }

        // Determina l'ID dell'utente
        let utenteId;

        if (userData.id) {
          utenteId = userData.id;
        } else if (userData.userId) {
          utenteId = userData.userId;
        } else if (userData.data && userData.data.id) {
          utenteId = userData.data.id;
        } else {
          console.error("Struttura dell'utente non riconosciuta:", userData);
          throw new Error(
            "Impossibile determinare l'ID dell'utente dalla struttura disponibile"
          );
        }

        // Ottieni la data corrente
        const now = new Date();
        // Aggiunge un minuto per assicurarsi che la data sia nel futuro
        now.setMinutes(now.getMinutes() + 1);
        const dataPrenotazioneFormatted = new Date()
          .toISOString()
          .split("T")[0];

        const prenotazioneRequest = {
          utenteId: Number(utenteId),
          voloId: voloIdNumerico, // Usa il valore già convertito e validato
          dataPrenotazione: dataPrenotazioneFormatted,
        };

        console.log("Invio richiesta prenotazione:", prenotazioneRequest);

        const rispostaPrenotazione = await fetch(
          "http://localhost:8080/api/prenotazioni/crea",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${currentToken}`,
            },
            body: JSON.stringify(prenotazioneRequest),
            credentials: "include",
          }
        );

        console.log(
          "Status risposta prenotazione:",
          rispostaPrenotazione.status
        );

        if (!rispostaPrenotazione.ok) {
          const errorText = await rispostaPrenotazione.text();
          console.error("Errore dal server (prenotazione):", errorText);

          // Verifica se l'errore è relativo all'invio dell'email
          if (
            errorText.includes("Mail server") ||
            errorText.includes("MessagingException") ||
            errorText.includes("SSLHandshakeException")
          ) {
            // La prenotazione è stata creata ma c'è stato un errore con l'email
            alert(
              "Prenotazione completata con successo! C'è stato un problema con l'invio dell'email di conferma, ma la tua prenotazione è stata registrata."
            );

            // Redireziona alla home page
            navigate("/", {
              state: {
                message: "Prenotazione completata con successo!",
              },
            });

            return;
          }

          throw new Error(
            `Errore nella creazione della prenotazione: ${errorText}`
          );
        }

        const prenotazioneData = await rispostaPrenotazione.json();
        console.log("Prenotazione creata con successo:", prenotazioneData);

        // Successo
        alert("Pagamento e prenotazione completati con successo!");
        // Redireziona alla home page
        navigate("/", {
          state: {
            message: "Prenotazione completata con successo!",
          },
        });
      }
    } catch (error) {
      console.error("Errore completo:", error);

      // Gestione speciale per errori relativi al server di posta
      if (
        error.message.includes("Mail server") ||
        error.message.includes("MessagingException") ||
        error.message.includes("SSLHandshakeException") ||
        error.message.includes("PKIX path building failed")
      ) {
        setError(
          "Prenotazione registrata ma impossibile inviare l'email di conferma. La tua prenotazione è comunque valida."
        );

        // Dopo 3 secondi, redireziona alla home page
        setTimeout(() => {
          navigate("/", {
            state: {
              message: "Prenotazione completata con successo!",
            },
          });
        }, 3000);

        return;
      }

      setError(`Si è verificato un errore: ${error.message}`);

      // Se l'errore è di autorizzazione, suggeriamo di fare logout e login di nuovo
      if (
        error.message.includes("autorizzazione") ||
        error.message.includes("403")
      ) {
        // Pulisci il token e reindirizza al login
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");

        setTimeout(() => {
          navigate("/login", {
            state: {
              returnTo: "/booking",
              message: "Sessione scaduta. Effettua nuovamente il login.",
            },
          });
        }, 2000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Funzione per estrarre informazioni di volo in modo sicuro
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

  // Effettua il reindirizzamento al login se non c'è token e vogliamo che l'utente faccia login
  const gestisciLogin = () => {
    navigate("/login", {
      state: { returnTo: "/booking" },
    });
  };

  const infoVoloAndata = estraiInfoVolo(voloAndata);
  const infoVoloRitorno = voloRitorno ? estraiInfoVolo(voloRitorno) : null;

  return (
    <Container className="payment-container mt-4">
      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
          {error.includes("Sessione scaduta") && (
            <Button variant="link" onClick={gestisciLogin} className="p-0 ms-2">
              Vai al login
            </Button>
          )}
        </Alert>
      )}

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
                      disabled={isLoading}
                    >
                      {isLoading ? "Elaborazione in corso..." : "Paga Ora"}
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
