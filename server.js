const express = require("express");
const axios = require("axios");
const https = require("https");
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = 3000;

const API_URL = process.env.API_URL;
const API_KEY = process.env.API_KEY;

// Ignore SSL verification
const agent = new https.Agent({ rejectUnauthorized: false });

app.use(express.static("public"));

app.get("/events", async (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    console.log("Client connected to /events");

    try {
        console.log("Connecting to SSE API...");

        const apiStream = await axios.get(API_URL, {
            headers: { "x-api-key": API_KEY },
            responseType: "stream",
            httpsAgent: agent,
        });

        console.log("Connected to API, waiting for events...");

        apiStream.data.on("data", (chunk) => {
            const message = chunk.toString();
            console.log("Received event chunk:", message);
        
            // Extract the data part
            const match = message.match(/data:\s*(\{.*\})/);
            if (match) {
                const eventData = match[1];
                res.write(`data: ${eventData}\n\n`);
            }
        });        

        apiStream.data.on("error", (err) => {
            console.error("API Stream Error:", err);
        });

        req.on("close", () => {
            console.log("Client disconnected");
            apiStream.data.destroy();
        });

    } catch (error) {
        console.error("Error connecting to SSE API:", error);
        res.status(500).json({ error: "Unable to connect to the event stream" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
