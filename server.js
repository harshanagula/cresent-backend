import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { createSalesforceLead } from "./services/salesforce.js";
import { saveToGooglesheet } from "./services/googlesheet.js";

dotenv.config();

const app = express();

/* =========================
   CORS
========================= */

app.use(
  cors({
    origin: [
      "http://127.0.0.1:5500",
      "http://localhost:5500",
      "https://candeurgroup.in",
      "https://crescent.candeurgroup.in",
    ],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("*", cors());

app.use(express.json());

/* =========================
   HEALTH CHECK
========================= */

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Candeur Crescent backend is running",
  });
});

/* =========================
   LEAD API
========================= */

app.post("/lead", async (req, res) => {
  try {
    const lead = req.body;

    console.log("=================================");
    console.log("[LEAD] Received");
    console.log("[LEAD] Phone:", lead.phone);
    console.log("[LEAD] Email:", lead.email);
    console.log("[LEAD] Source:", lead.source);
    console.log("=================================");

    /*
     * Respond immediately to the website.
     * This prevents the visitor from waiting for
     * Google Sheets and Salesforce.
     */

    res.status(200).json({
      success: true,
      message: "Lead received successfully",
    });

    /*
     * Run Google Sheets and Salesforce in background
     */

    Promise.allSettled([
      saveToGooglesheet(lead),
      createSalesforceLead(lead),
    ]).then((results) => {
      console.log("[LEAD] Background processing completed");

      const googleResult = results[0];
      const salesforceResult = results[1];

      /* Google Sheets */

      if (googleResult.status === "fulfilled") {
        console.log("[GOOGLE SHEETS] SUCCESS");
      } else {
        console.error(
          "[GOOGLE SHEETS] FAILED:",
          googleResult.reason?.response?.data ||
            googleResult.reason?.message ||
            googleResult.reason
        );
      }

      /* Salesforce */

      if (salesforceResult.status === "fulfilled") {
        console.log("[SALESFORCE] SUCCESS");
      } else {
        console.error(
          "[SALESFORCE] FAILED:",
          salesforceResult.reason?.response?.data ||
            salesforceResult.reason?.message ||
            salesforceResult.reason
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
        error: error.response?.data || error.message,
      });
    }
  }
});

/* =========================
   SERVER
========================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
