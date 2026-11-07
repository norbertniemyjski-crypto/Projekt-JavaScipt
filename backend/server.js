const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Helper do walidacji danych wydarzenia
function validateEventData(body) {
  const { title, sport_type, date_time, location_name, max_players } = body;
  const errors = [];

  if (!title || typeof title !== 'string' || title.trim() === '') {
    errors.push('Tytuł jest wymagany i musi być tekstem.');
  }
  if (!sport_type || typeof sport_type !== 'string' || sport_type.trim() === '') {
    errors.push('Dyscyplina sportowa jest wymagana.');
  }
  if (!date_time || typeof date_time !== 'string' || date_time.trim() === '') {
    errors.push('Data i godzina są wymagane.');
  }
  if (!location_name || typeof location_name !== 'string' || location_name.trim() === '') {
    errors.push('Lokalizacja jest wymagana.');
  }
  if (!max_players || typeof max_players !== 'number' || max_players <= 0) {
    errors.push('Maksymalna liczba graczy musi być liczbą większą od 0.');
  }

  return errors;
}

// 1. GET /api/events - Pobieranie wszystkich wydarzeń
app.get('/api/events', (req, res) => {
  const sql = 'SELECT * FROM events ORDER BY id DESC';
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Błąd bazy danych (GET /api/events):', err.message);
      return res.status(500).json({ error: 'Błąd serwera podczas pobierania wydarzeń.' });
    }
    res.json(rows);
  });
});

// 2. GET /api/events/:id - Pobieranie jednego wydarzenia po ID
app.get('/api/events/:id', (req, res) => {
  const sql = 'SELECT * FROM events WHERE id = ?';
  db.get(sql, [req.params.id], (err, row) => {
    if (err) {
      console.error('Błąd bazy danych (GET /api/events/:id):', err.message);
      return res.status(500).json({ error: 'Błąd serwera podczas pobierania wydarzenia.' });
    }
    if (!row) {
      return res.status(404).json({ message: 'Nie znaleziono wydarzenia o podanym ID.' });
    }
    res.json(row);
  });
});

// 3. POST /api/events - Dodawanie nowego wydarzenia z walidacją
app.post('/api/events', (req, res) => {
  const validationErrors = validateEventData(req.body);
  if (validationErrors.length > 0) {
    return res.status(400).json({ message: 'Błąd walidacji', errors: validationErrors });
  }

  const { title, sport_type, date_time, location_name, max_players, skill_level, description } = req.body;

  const sql = `
    INSERT INTO events (title, sport_type, date_time, location_name, max_players, skill_level, description)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [
    title.trim(),
    sport_type.trim(),
    date_time.trim(),
    location_name.trim(),
    max_players,
    skill_level ? skill_level.trim() : 'Brak wymagań',
    description ? description.trim() : ''
  ];

  db.run(sql, params, function (err) {
    if (err) {
      console.error('Błąd bazy danych (POST /api/events):', err.message);
      return res.status(500).json({ error: 'Nie udało się dodać wydarzenia do bazy.' });
    }
    res.status(201).json({
      message: 'Wydarzenie zostało pomyślnie dodane.',
      id: this.lastID
    });
  });
});

// 4. PUT /api/events/:id - Edycja wydarzenia z walidacją
app.put('/api/events/:id', (req, res) => {
  const validationErrors = validateEventData(req.body);
  if (validationErrors.length > 0) {
    return res.status(400).json({ message: 'Błąd walidacji', errors: validationErrors });
  }

  const { title, sport_type, date_time, location_name, max_players, skill_level, description } = req.body;

  const sql = `
    UPDATE events 
    SET title = ?, sport_type = ?, date_time = ?, location_name = ?, max_players = ?, skill_level = ?, description = ?
    WHERE id = ?
  `;
  const params = [
    title.trim(),
    sport_type.trim(),
    date_time.trim(),
    location_name.trim(),
    max_players,
    skill_level ? skill_level.trim() : 'Brak wymagań',
    description ? description.trim() : '',
    req.params.id
  ];

  db.run(sql, params, function (err) {
    if (err) {
      console.error('Błąd bazy danych (PUT /api/events/:id):', err.message);
      return res.status(500).json({ error: 'Nie udało się zaktualizować wydarzenia.' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Nie znaleziono wydarzenia do edycji.' });
    }
    res.json({ message: 'Wydarzenie zostało zaktualizowane.' });
  });
});

// 5. DELETE /api/events/:id - Usuwanie wydarzenia
app.delete('/api/events/:id', (req, res) => {
  const sql = 'DELETE FROM events WHERE id = ?';
  db.run(sql, [req.params.id], function (err) {
    if (err) {
      console.error('Błąd bazy danych (DELETE /api/events/:id):', err.message);
      return res.status(500).json({ error: 'Błąd podczas usuwania wydarzenia.' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Nie znaleziono wydarzenia o podanym ID.' });
    }
    res.json({ message: 'Wydarzenie zostało usunięte.' });
  });
});

// Obsługa nieistniejących ścieżek
app.use((req, res) => {
  res.status(404).json({ message: 'Podany zasób nie istnieje (404).' });
});

// Uruchomienie serwera
app.listen(PORT, () => {
  console.log(`Serwer działa na adresie: http://localhost:${PORT}`);
});