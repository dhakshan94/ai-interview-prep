const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Serve the frontend (index.html)
app.use(express.static(path.resolve(__dirname, "..")));
app.get("/", (req, res) => {
    res.sendFile(path.resolve(__dirname, "..", "index.html"));
});
app.post("/api/ask", async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({
                error: "Prompt is required"
            });
        }

        const response = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
                },
                body: JSON.stringify({
                    model: "openai/gpt-oss-120b",
                    messages: [
                        {
                            role: "user",
                            content: prompt
                        }
                    ]
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
             console.log("GROQ RESPONSE:", data);
            return res.status(response.status).json({
                error: data.error?.message || "Groq API error"
            });
        }

        res.json({
            answer: data.choices[0].message.content
        });

    } catch (error) {
        console.error("Server Error:", error);

        res.status(500).json({
            error: "Internal server error"
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`PrepAI running on port ${PORT}`);
});