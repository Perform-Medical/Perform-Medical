import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

app.post('/api/claude-chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body || {};

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ reply: 'Missing message.' });
    }

    const systemPrompt =
      'You are the Perform Medical website assistant. ' +
      'Speak warmly, clearly, and professionally. ' +
      'Help users understand services, booking, contact info, and what the website offers. ' +
      'Do not diagnose, do not give emergency instructions beyond advising urgent medical help when appropriate. ' +
      'Keep answers short and helpful.';

    const messages = [
      ...history,
      { role: 'user', content: message }
    ];

    const reply = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 350,
      system: systemPrompt,
      messages
    });

    const text = reply.content
      .filter((part) => part.type === 'text')
      .map((part) => part.text)
      .join('\n')
      .trim();

    return res.json({ reply: text || 'Thanks for reaching out.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      reply: 'The assistant is temporarily unavailable.'
    });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Perform Medical AI server running on port ${port}`);
});
