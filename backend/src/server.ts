import express from 'express';
import cors from 'cors';
import personsRouter from './routes/persons.js';
import tasksRouter from './routes/tasks.js';
import weeksRouter from './routes/weeks.js';

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/persons', personsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/weeks', weeksRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

