// server.js
require("dotenv").config();
const express = require("express");
const axios = require("axios");
const app = express();
const PORT = 3000;

// Your secret API Key stored securely
const API_KEY = process.env.OPENAI_API_KEY;

app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

app.post("/api/query", async (req, res) => {
  try {
    const response = await axios({
      method: "post",
      url: "https://api.openai.com/v1/chat/completions",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      data: req.body, // ensure this is passed as data, not under headers
    });
    res.send(response.data);
  } catch (error) {
    console.error("Error making API request:", error);
    res.status(500).send({ error: "Error processing your request" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
