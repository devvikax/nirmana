import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Syllabus Parsing & Structuring API endpoint
app.post('/api/parse-syllabus', async (req, res) => {
  const { text } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Text is required', topics: [] });
  }

  if (!ai) {
    return res.json({ topics: [], source: 'fallback' });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `You are an academic curriculum parser. Extract individual syllabus topics/modules from the following course text into a clean list of topic strings. Keep each topic name concise, academic, and directly study-able (e.g., "Arrays & Binary Search", "Linked Lists", "Enzyme Kinetics"). Do not hallucinate topics not mentioned.\n\nSyllabus:\n${text}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
          },
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '[]');
    if (Array.isArray(parsed) && parsed.length > 0) {
      return res.json({ topics: parsed, source: 'gemini' });
    }
    return res.json({ topics: [], source: 'fallback' });
  } catch (error) {
    console.error('Error in /api/parse-syllabus:', error);
    return res.json({ topics: [], source: 'fallback' });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
