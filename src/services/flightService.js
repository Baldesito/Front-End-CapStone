import axios from "axios";

// Funzione per ottenere il token
const getToken = async () => {
  const response = await axios.post(
    "https://test.api.amadeus.com/v1/security/oauth2/token",
    new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.REACT_APP_AMADEUS_API_KEY,
      client_secret: process.env.REACT_APP_AMADEUS_API_SECRET,
    }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
  return response.data.access_token;
};

// Funzione per cercare i voli
export const searchFlights = async (
  origin,
  destination,
  departureDate,
  returnDate,
  adults
) => {
  const token = await getToken();
  const response = await axios.get(
    "https://test.api.amadeus.com/v2/shopping/flight-offers",
    {
      params: {
        originLocationCode: origin,
        destinationLocationCode: destination,
        departureDate: departureDate,
        returnDate: returnDate,
        adults: adults,
        currencyCode: "EUR",
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data.data;
};
