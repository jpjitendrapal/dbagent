import express from 'express';
import { runDatabaseAgent } from '../agent/index.js';
import { indexDatabaseSchema } from '../rag/index.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.post('/api/ask', async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: 'Please provide a "question" field in the JSON body.' });
    }

    const result = await runDatabaseAgent(question);
    
    if (result.error) {
      return res.status(500).json(result);
    }

    return res.json(result);
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/index', async (req, res) => {
  try {
    await indexDatabaseSchema();
    return res.json({ message: 'Database schema successfully indexed and vector store updated.' });
  } catch (error: any) {
    console.error('API Index Error:', error);
    return res.status(500).json({ error: 'Failed to index schema', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Database Agent API is running on http://localhost:${PORT}`);
  console.log(`Try POST /api/ask with { "question": "your question" }`);
});
