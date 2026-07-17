import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lazy-loaded Gemini API Client
let aiInstance: GoogleGenAI | null = null;
function getAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error('GEMINI_API_KEY_MISSING');
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

async function startServer() {
  const app = express();
  
  // Increase payload size limit for base64 room uploads
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ limit: '15mb', extended: true }));

  // API Route: Analyze room photo
  app.post('/api/analyze', async (req, res) => {
    try {
      const { image, roomName } = req.body;
      if (!image) {
        return res.status(400).json({ error: 'No image provided' });
      }

      // Check API Key
      let ai;
      try {
        ai = getAI();
      } catch (err: any) {
        if (err.message === 'GEMINI_API_KEY_MISSING') {
          return res.status(400).json({
            error: 'GEMINI_API_KEY_MISSING',
            message: 'To analyze your rooms with real AI, please configure your GEMINI_API_KEY in the Secrets / Settings panel in the AI Studio UI.'
          });
        }
        throw err;
      }

      // Extract raw base64 data and mime type from data URI
      const matches = image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      let mimeType = 'image/jpeg';
      let base64Data = image;

      if (matches && matches.length === 3) {
        mimeType = matches[1];
        base64Data = matches[2];
      }

      const prompt = `Analyze this photo of a room named "${roomName || 'My Room'}" for visual decluttering, structural flow, and layout organization.
Identify exact specific coordinates in the image where there is high clutter, bad storage, or an opportunity for visual balancing.
Provide the final output as a valid JSON object with EXACTLY this structure:
{
  "flowScore": number (a score between 1.0 and 10.0, e.g. 7.2),
  "itemCount": number (estimated total count of items in view, e.g. 35),
  "visualNoise": "Low" | "Medium" | "High",
  "markers": Array<{
    "x": number (percentage from left of the image, between 5 and 95),
    "y": number (percentage from top of the image, between 5 and 95),
    "type": "clutter" | "suggestion" | "tip",
    "title": string (very short title, e.g. "Surface Clutter", "Storage Gap", "Focal Point"),
    "description": string (exactly one friendly, helpful sentence explaining the issue or tip at this spot)
  }>,
  "suggestions": Array<{
    "category": "Urgent" | "Balance" | "Storage",
    "scoreBenefit": string (e.g. "+15 Flow", "+5 Aesthetic", "+8 Order"),
    "title": string (actionable heading, e.g. "Declutter Sideboard", "Verticality Opportunity", "Textile Containment"),
    "description": string (one short paragraph explaining why and how to do it)
  }>
}
Return only the raw JSON object. Do not wrap it in markdown code blocks or add any other text.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: [
          {
            inlineData: {
              data: base64Data,
              mimeType,
            },
          },
          prompt,
        ],
        config: {
          responseMimeType: 'application/json',
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('Empty response from Gemini API');
      }

      const analysis = JSON.parse(responseText.trim());
      res.json(analysis);

    } catch (error: any) {
      console.error('Room analysis error:', error);
      res.status(500).json({
        error: 'ANALYSIS_ERROR',
        message: error.message || 'An error occurred during room analysis. Please try again.'
      });
    }
  });

  // API Route: Multi-turn Chat
  app.post('/api/chat', async (req, res) => {
    try {
      const { messages, roomContext } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Invalid or missing messages array' });
      }

      // Check API Key
      let ai;
      try {
        ai = getAI();
      } catch (err: any) {
        if (err.message === 'GEMINI_API_KEY_MISSING') {
          return res.status(400).json({
            error: 'GEMINI_API_KEY_MISSING',
            message: 'To chat with Vesta, please configure your GEMINI_API_KEY in the Secrets / Settings panel in the AI Studio UI.'
          });
        }
        throw err;
      }

      const systemPrompt = `You are Vesta, a warm, professional, and highly insightful decluttering and space-organization consultant. 
Your goal is to guide users to create peaceful, balanced, and functional living environments. 
You give practical, encouraging, and highly actionable advice. Avoid vague suggestions; instead, suggest exact, concrete steps.
You are currently discussing the user's room named "${roomContext?.name || 'My Room'}".

Current Room Analysis Details:
- Room Type/Name: ${roomContext?.name}
- Flow Score: ${roomContext?.stats?.flowScore || 'Not yet scanned'} / 10
- Estimated Item Count: ${roomContext?.stats?.itemCount || 'Not yet scanned'}
- Visual Noise: ${roomContext?.stats?.visualNoise || 'Not yet scanned'}

Active Suggestions from Last Scan:
${roomContext?.suggestions ? roomContext.suggestions.map((s: any) => `- [${s.category}] ${s.title}: ${s.description}`).join('\n') : 'No image scan conducted yet.'}

Instructions:
- Be highly supportive and friendly.
- Keep your answers relatively concise, readable, and structured using lists or short paragraphs.
- Keep the tone grounded, homey, elegant, and mindful of visual styling. Reference the "Natural Tones" philosophy: organic materials, negative spaces, and balanced weights.`;

      // Format messages for @google/genai
      const formattedContents = messages.map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: formattedContents,
        config: {
          systemInstruction: systemPrompt,
        }
      });

      const reply = response.text || '';
      res.json({ text: reply });

    } catch (error: any) {
      console.error('Chat error:', error);
      res.status(500).json({
        error: 'CHAT_ERROR',
        message: error.message || 'Vesta encountered an error. Please try sending your message again.'
      });
    }
  });

  // Setup Vite dev server or serve production dist
  if (process.env.NODE_ENV === 'production' || fs.existsSync(path.resolve(__dirname, 'dist'))) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);
    app.get('*', async (req, res, next) => {
      try {
        const url = req.originalUrl;
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  }

  const port = 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Vesta AI Server running at http://localhost:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start Vesta AI server:', err);
});
