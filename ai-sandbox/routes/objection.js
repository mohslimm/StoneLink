const express = require("express");
const router = express.Router();
const { askAI } = require("../services/openai");

router.post("/simulate-objection", async (req, res) => {
  const { objection } = req.body;

  const prompt = `
You are a potential customer.

Objection: "${objection}"

Roleplay a realistic conversation:

1. Customer objection
2. Sales reply
3. Customer reaction
4. Final outcome
`;

  const result = await askAI(prompt);

  res.json({ simulation: result });
});

module.exports = router;