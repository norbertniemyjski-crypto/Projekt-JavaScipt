require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger');

const eventsRouter = require('./routes/events');
const authRouter = require('./routes/auth');
const meRouter = require('./routes/me');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Dokumentacja Swagger UI (musi być przed obsługą błędu 404)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Główne trasy API
app.use('/api/events', eventsRouter);
app.use('/api/auth', authRouter);
app.use('/api/me', meRouter);

// Obsługa nieistniejących ścieżek (404) - zawsze na końcu
app.use((req, res) => {
  res.status(404).json({ message: 'Podany zasób nie istnieje (404).' });
});

app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
  console.log(`Dokumentacja Swagger dostępna pod adresem: http://localhost:${PORT}/api-docs`);
});