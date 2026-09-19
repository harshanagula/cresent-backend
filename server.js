import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { createSalesforceLead } from "./services/salesforce.js";
import { saveToGooglesheet } from "./services/googlesheet.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: [
    "http://127.0.0.1:5500",
    "http://localhost:5500"
  ],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Candeur Crescent backend is running"
  });
});

app.options("/lead", cors());

app.post("/lead", async (req, res) => {
  try {
    const lead = req.body;

    console.log("[LEAD] Received:", lead);

    // Respond immediately
    res.status(200).json({
      success: true,
      message: "Lead received successfully"
    });

    // Process integrations in background
    Promise.allSettled([
      saveToGooglesheet(lead),
      createSalesforceLead(lead)
    ]).then((results) => {

      const google = results[0];
      const salesforce = results[1];

      if (google.status === "fulfilled") {
        console.log("[GOOGLE SHEETS] SUCCESS");
      } else {
        console.error(
          "[GOOGLE SHEETS] FAILED:",
          google.reason?.response?.data ||
          google.reason?.message ||
          google.reason
        );
      }

      if (salesforce.status === "fulfilled") {
        console.log("[SALESFORCE] SUCCESS");
      } else {
        console.error(
          "[SALESFORCE] FAILED:",
          salesforce.reason?.response?.data ||
          salesforce.reason?.message ||
          salesforce.reason
        );
      }

    });

  } catch (error) {

    console.error(
      "[LEAD] ERROR:",
      error.response?.data || error.message
    );

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: error.response?.data || error.message
      });
    }
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
