import axios from "axios";

export async function createSalesforceLead(data) {
  const tokenBody = new URLSearchParams();

  tokenBody.append("grant_type", "client_credentials");
  tokenBody.append("client_id", process.env.SF_CLIENT_ID);
  tokenBody.append("client_secret", process.env.SF_CLIENT_SECRET);

  const tokenResponse = await axios.post(process.env.SF_TOKEN_URL, tokenBody, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  const accessToken = tokenResponse.data.access_token;

  const payload = {
    FirstName: data.firstName || "",
    LastName: data.lastName || "",
    Phone: data.phone || "",
    Email: data.email || "",
    whatsAppNo: data.phone || "",

    project: "Crescent",

    source: data.utm_source || "Website",
    subSource: "Website",
    firstEnquirySource: data.utm_source || "Website",

    channel: "In House",

    campaign: data.utm_campaign || "",
    medium: data.utm_medium || "",
    term: data.utm_term || "",
    keyWord: data.utm_term || "",

    adSet: data.adset || "",
    adName: data.adname || "",

    BudgetRange: data.budget || "",
  };

  const response = await axios.post(process.env.SF_LEAD_URL, payload, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  return response.data;
}
