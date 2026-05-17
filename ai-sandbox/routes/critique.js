const express = require("express");
const router = express.Router();
const { askAI } = require("../services/openai");

router.post("/critique-email", async (req, res) => {
  const { email } = req.body;

  const prompt = `
You are a strict sales expert.

Evaluate this email:

${email}

Give:
- score /10
- problems
- improvements
- improved version
`;

  const result = await askAI(prompt);

  res.json({ critique: result });
});

module.exports = router;