const express = require("express");
const app = express();

app.use(express.json());

// endpoints
app.post("/generate-email", (req, res) => {
  res.json({ message: "generate email here" });
});

app.post("/critique-email", (req, res) => {
  res.json({ message: "critique email here" });
});

app.post("/simulate-objection", (req, res) => {
  res.json({ message: "simulate objection here" });
});

const server = app.listen(4000, () => {
  console.log("Server running on http://localhost:4000");
});

server.on('error', (err) => {
  console.error("Server error:", err);
});

process.on('exit', (code) => {
  console.log(`Process exiting with code: ${code}`);
});

process.on('uncaughtException', (err) => {
  console.error("Uncaught exception:", err);
});