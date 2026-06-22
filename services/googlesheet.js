import axios from "axios";

export async function saveToGooglesheet(data) {
  try {
    const response = await axios.post(process.env.GOOGLE_SHEET_WEB_APP_URL, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Google Sheet Error:", error.message);
    return null;
  }
}
