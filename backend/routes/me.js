const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const db = require('../db');

// GET /api/me - Zwraca dane zalogowanego użytkownika
router.get('/', authMiddleware, (req, res) => {
  const sql = 'SELECT id, username, email, created_at FROM users WHERE id = ?';
  db.get(sql, [req.user.id], (err, user) => {
    if (err || !user) {
      return res.status(404).json({ message: 'Nie znaleziono użytkownika.' });
    }
    res.json(user);
  });
});

module.exports = router;