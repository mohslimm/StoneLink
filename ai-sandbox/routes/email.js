const express = require("express");
const router = express.Router();
const { askAI } = require("../services/openai");

router.post("/generate-email", async (req, res) => {
  const { company, goal } = req.body;

  const prompt = `
Write a high-converting cold email.

Company type: ${company}
Goal: ${goal}

Make it persuasive, short, and human.
`;

  const result = await askAI(prompt);

  res.json({ email: result });
});

module.exports = router;