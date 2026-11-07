const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// 1. GET /api/events - Pobieranie wszystkich wydarzeń
app.get('/api/events', (req, res) => {
  const sql = 'SELECT * FROM events';
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// 2. GET /api/events/:id - Pobieranie jednego wydarzenia po ID
app.get('/api/events/:id', (req, res) => {
  const sql = 'SELECT * FROM events WHERE id = ?';
  db.get(sql, [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ message: 'Nie znaleziono wydarzenia' });
    }
    res.json(row);
  });
});

// 3. POST /api/events - Dodawanie nowego wydarzenia
app.post('/api/events', (req, res) => {
  const { title, sport_type, date_time, location_name, max_players, skill_level, description } = req.body;

  if (!title || !sport_type || !date_time || !location_name || !max_players) {
    return res.status(400).json({ message: 'Uzupełnij wszystkie wymagane pola!' });
  }

  const sql = `
    INSERT INTO events (title, sport_type, date_time, location_name, max_players, skill_level, description)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [title, sport_type, date_time, location_name, max_players, skill_level, description];

  db.run(sql, params, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({
      message: 'Wydarzenie zostało dodane',
      id: this.lastID
    });
  });
});

// 4. PUT /api/events/:id - Edycja wydarzenia
app.put('/api/events/:id', (req, res) => {
  const { title, sport_type, date_time, location_name, max_players, skill_level, description } = req.body;

  const sql = `
    UPDATE events 
    SET title = ?, sport_type = ?, date_time = ?, location_name = ?, max_players = ?, skill_level = ?, description = ?
    WHERE id = ?
  `;
  const params = [title, sport_type, date_time, location_name, max_players, skill_level, description, req.params.id];

  db.run(sql, params, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Nie znaleziono wydarzenia do edycji' });
    }
    res.json({ message: 'Wydarzenie zaktualizowane' });
  });
});

// 5. DELETE /api/events/:id - Usuwanie wydarzenia
app.delete('/api/events/:id', (req, res) => {
  const sql = 'DELETE FROM events WHERE id = ?';
  db.run(sql, [req.params.id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Nie znaleziono wydarzenia do usunięcia' });
    }
    res.json({ message: 'Wydarzenie usunięte' });
  });
});

// Uruchomienie serwera
app.listen(PORT, () => {
  console.log(`Serwer działa na adresie: http://localhost:${PORT}`);
});