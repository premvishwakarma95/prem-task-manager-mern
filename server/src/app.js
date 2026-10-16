import express from 'express';
import cors from 'cors';
import tasks from './routes/tasks.js';

export const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '10kb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/tasks', tasks);

app.use((_req, res) => res.status(404).json({ errors: ['not found'] }));
// Central error handler: no stack traces leak to clients.
app.use((err, _req, res, _next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ errors: ['invalid JSON'] });
  console.error(err);
  res.status(500).json({ errors: ['internal server error'] });
});
