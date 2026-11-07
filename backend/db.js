const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Ścieżka do pliku bazy danych
const dbPath = path.resolve(__dirname, 'database.sqlite');

// Połączenie z bazą danych (jeśli plik nie istnieje, SQLite go utworzy)
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Błąd połączenia z bazą danych SQLite:', err.message);
  } else {
    console.log('Połączono z bazą danych SQLite.');
  }
});

// Tworzenie tabeli dla wydarzeń sportowych
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      sport_type TEXT NOT NULL,
      date_time TEXT NOT NULL,
      location_name TEXT NOT NULL,
      max_players INTEGER NOT NULL,
      skill_level TEXT,
      description TEXT
    )
  `, (err) => {
    if (err) {
      console.error('Błąd podczas tworzenia tabeli:', err.message);
    } else {
      console.log('Tabela "events" jest gotowa.');
    }
  });
});

module.exports = db;