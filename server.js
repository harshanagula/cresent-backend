import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { createSalesforceLead } from "./services/salesforce.js";
import { saveToGoogleSheet } from "./services/googleSheet.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.post("/lead", async (req, res) => {
  try {
    const lead = req.body;

    console.log("Lead Received:", lead);

    await saveToGoogleSheet(lead);

    const sfResult = await createSalesforceLead(lead);

    return res.status(200).json({
      success: true,
      salesforce: sfResult,
    });
  } catch (error) {
    console.error(error.response?.data || error.message);

    return res.status(500).json({
      success: false,
      error: error.response?.data || error.message,
    });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
