const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Trasy (Routes)
const eventsRouter = require('./routes/events');
const authRouter = require('./routes/auth');
const meRouter = require('./routes/me');

app.use('/api/events', eventsRouter);
app.use('/api/auth', authRouter);
app.use('/api/me', meRouter);

// Obsługa 404
app.use((req, res) => {
  res.status(404).json({ message: 'Podany zasób nie istnieje (404).' });
});

app.listen(PORT, () => {
  console.log(`Serwer działa na adresie: http://localhost:${PORT}`);
});