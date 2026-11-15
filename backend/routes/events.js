const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/auth');

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
    errors.push('Data i godzina wydarzenia są wymagane.');
  }
  if (!location_name || typeof location_name !== 'string' || location_name.trim() === '') {
    errors.push('Lokalizacja jest wymagana.');
  }
  if (max_players === undefined || typeof max_players !== 'number' || !Number.isInteger(max_players) || max_players <= 0) {
    errors.push('Maksymalna liczba graczy musi być liczbą całkowitą większą od 0.');
  }

  return errors;
}

// GET /api/events?sport=...&search=...&sort=desc
router.get('/', (req, res) => {
  const { sport, search, sort } = req.query;

  let sql = `
    SELECT e.*, GROUP_CONCAT(ep.user_id) AS participant_ids
    FROM events e
    LEFT JOIN event_participants ep ON e.id = ep.event_id
  `;
  const conditions = [];
  const params = [];

  if (sport && sport !== 'all') {
    conditions.push('LOWER(e.sport_type) LIKE ?');
    params.push(`%${sport.toLowerCase()}%`);
  }

  if (search && search.trim() !== '') {
    conditions.push('(LOWER(e.title) LIKE ? OR LOWER(e.location_name) LIKE ?)');
    const term = `%${search.trim().toLowerCase()}%`;
    params.push(term, term);
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  const orderDir = sort === 'asc' ? 'ASC' : 'DESC';
  sql += ` GROUP BY e.id ORDER BY e.id ${orderDir}`;

  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Błąd pobierania wydarzeń z bazy danych.' });
    }
    const events = rows.map(row => {
      const participants = row.participant_ids
        ? row.participant_ids.split(',').map(Number)
        : [];
      return {
        ...row,
        participants,
        current_players: participants.length
      };
    });
    res.json(events);
  });
});

// GET /api/events/:id
router.get('/:id', (req, res) => {
  db.get('SELECT * FROM events WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Błąd bazy danych.' });
    }
    if (!row) {
      return res.status(404).json({ message: 'Nie znaleziono wydarzenia o podanym ID.' });
    }
    res.json(row);
  });
});

// POST /api/events - Tworzenie wydarzenia (tylko dla zalogowanych)
router.post('/', authMiddleware, (req, res) => {
  const errors = validateEventData(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
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
      return res.status(500).json({ error: 'Nie udało się zapisać wydarzenia w bazie danych.' });
    }
    res.status(201).json({
      id: this.lastID,
      message: 'Wydarzenie zostało pomyślnie dodane!'
    });
  });
});

// PUT /api/events/:id - Edycja wydarzenia
router.put('/:id', authMiddleware, (req, res) => {
  const errors = validateEventData(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
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
      return res.status(500).json({ error: 'Błąd aktualizacji wydarzenia.' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Nie znaleziono wydarzenia o podanym ID.' });
    }
    res.json({ message: 'Wydarzenie zostało zaktualizowane.' });
  });
});

// DELETE /api/events/:id - Usunięcie wydarzenia
router.delete('/:id', authMiddleware, (req, res) => {
  db.run('DELETE FROM events WHERE id = ?', [req.params.id], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Błąd podczas usuwania wydarzenia.' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Nie znaleziono wydarzenia o podanym ID.' });
    }
    res.json({ message: 'Wydarzenie zostało usunięte.' });
  });
});

// POST /api/events/:id/join - Dołącz lub wypisz się z wydarzenia
router.post('/:id/join', authMiddleware, (req, res) => {
  const eventId = req.params.id;
  const userId = req.user.id;

  db.get('SELECT * FROM events WHERE id = ?', [eventId], (err, event) => {
    if (err) return res.status(500).json({ message: 'Błąd bazy danych.' });
    if (!event) return res.status(404).json({ message: 'Wydarzenie nie istnieje.' });

    db.get('SELECT * FROM event_participants WHERE event_id = ? AND user_id = ?', [eventId, userId], (err, row) => {
      if (err) return res.status(500).json({ message: 'Błąd bazy danych.' });

      if (row) {
        db.run('DELETE FROM event_participants WHERE event_id = ? AND user_id = ?', [eventId, userId], (err) => {
          if (err) return res.status(500).json({ message: 'Nie udało się wypisać z wydarzenia.' });
          res.json({ joined: false, message: 'Wypisano z wydarzenia.' });
        });
      } else {
        db.get('SELECT COUNT(*) AS count FROM event_participants WHERE event_id = ?', [eventId], (err, countRow) => {
          if (err) return res.status(500).json({ message: 'Błąd bazy danych.' });
          if (countRow.count >= event.max_players) {
            return res.status(400).json({ message: 'Brak wolnych miejsc na to wydarzenie.' });
          }

          db.run('INSERT INTO event_participants (event_id, user_id) VALUES (?, ?)', [eventId, userId], (err) => {
            if (err) return res.status(500).json({ message: 'Nie udało się dołączyć.' });
            res.json({ joined: true, message: 'Dołączono do wydarzenia!' });
          });
        });
      }
    });
  });
});

module.exports = router;