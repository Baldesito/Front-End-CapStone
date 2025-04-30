import axios from "axios";

// Variabili API
const AMADEUS_CLIENT_ID = import.meta.env.VITE_AMADEUS_CLIENT_ID;
const AMADEUS_CLIENT_SECRET = import.meta.env.VITE_AMADEUS_CLIENT_SECRET;

const AMADEUS_AUTH_URL =
  "https://test.api.amadeus.com/v1/security/oauth2/token";
const AMADEUS_API_URL =
  "https://test.api.amadeus.com/v2/shopping/flight-offers";

let cachedToken = null;
let tokenExpiry = null;

// Funzione per ottenere il token
const getToken = async () => {
  // Verifica che le variabili d'ambiente siano definite
  if (!AMADEUS_CLIENT_ID || !AMADEUS_CLIENT_SECRET) {
    console.error("Credenziali Amadeus mancanti nelle variabili d'ambiente");
    throw new Error(
      "Configurazione API incompleta. Contatta l'amministratore."
    );
  }
  try {
    if (cachedToken && tokenExpiry && new Date() < tokenExpiry) {
      console.log("Token ancora valido, utilizzo quello in cache.");
      return cachedToken;
    }

    console.log("Richiesta nuovo token...");
    const response = await axios.post(
      AMADEUS_AUTH_URL,
      new URLSearchParams({
        grant_type: "client_credentials",
        client_id: AMADEUS_CLIENT_ID,
        client_secret: AMADEUS_CLIENT_SECRET,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    cachedToken = response.data.access_token;
    tokenExpiry = new Date(
      Date.now() + response.data.expires_in * 1000 - 300000
    );

    console.log("Token ottenuto con successo:", cachedToken);
    return cachedToken;
  } catch (error) {
    console.error(
      "Errore autenticazione Amadeus:",
      error.response?.data || error
    );
    throw new Error("Impossibile ottenere il token di accesso.");
  }
};

// Funzione per validare i codici IATA
const validateIATACode = (code) => {
  return (
    typeof code === "string" && code.length === 3 && /^[A-Z]{3}$/.test(code)
  );
};

// Funzione per validare le date
const validateDate = (date) => {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
};

// Funzione per cercare i voli
export const searchFlights = async (
  origin,
  destination,
  departureDate,
  returnDate,
  adults
) => {
  try {
    // Validazione codici IATA
    if (!validateIATACode(origin) || !validateIATACode(destination)) {
      throw new Error(
        "Origin e Destination devono essere codici IATA validi (es. FCO, MXP)."
      );
    }
    // Validazione date
    if (!validateDate(departureDate)) {
      throw new Error("Data di partenza non valida, usa formato YYYY-MM-DD.");
    }
    if (returnDate && !validateDate(returnDate)) {
      throw new Error("Data di ritorno non valida, usa formato YYYY-MM-DD.");
    }
    //  Validazione passeggeri
    if (adults < 1 || adults > 9) {
      throw new Error("Il numero di adulti deve essere tra 1 e 9.");
    }

    // Ottieni il token di accesso
    const token = await getToken();

    // Parametri della richiesta
    const params = {
      originLocationCode: origin.toUpperCase(),
      destinationLocationCode: destination.toUpperCase(),
      departureDate: departureDate,
      adults: adults,
      currencyCode: "EUR",
      max: 20,
    };

    if (returnDate) {
      params.returnDate = returnDate;
    }

    console.log(" Parametri richiesta API:", params);

    //  Richiesta all'API
    const response = await axios.get(
      "https://test.api.amadeus.com/v2/shopping/flight-offers",
      {
        params,
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log("Risposta API ricevuta:", response.data);
    return response.data.data || [];
  } catch (error) {
    console.error(" Errore nella ricerca voli:", error.response?.data || error);
    return [];
  }
};
