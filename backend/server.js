import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3000;

// Włączenie obsługi formatu JSON oraz połączeń z innych stron (CORS)
app.use(cors());
app.use(express.json());

// Tymczasowe dane przechowywane w pamięci podręcznej (lista meczów)
let events = [
  {
    id: 1,
    title: 'Mecz 5x5 na Orliku',
    sport_type: 'Piłka nożna',
    date_time: '2026-10-28 18:00',
    location_name: 'Orlik BOSiR, ul. Zwierzyniecka',
    max_players: 10,
    skill_level: 'Średniozaawansowany',
    description: 'Szukamy 2 osób do uzupełnienia składu.'
  },
  {
    id: 2,
    title: 'Siatkówka rekreacyjna',
    sport_type: 'Siatkówka',
    date_time: '2026-10-29 19:30',
    location_name: 'Hala VI LO',
    max_players: 12,
    skill_level: 'Amator',
    description: 'Gra towarzyska, każdy mile widziany.'
  }
];

// 1. Pobieranie wszystkich wydarzeń
app.get('/api/events', function (req, res) {
  res.status(200).json(events);
});

// 2. Pobieranie jednego wydarzenia po numerze ID
app.get('/api/events/:id', function (req, res) {
  const eventId = Number(req.params.id);
  const foundEvent = events.find(function (event) {
    return event.id === eventId;
  });

  if (!foundEvent) {
    res.status(404).json({ message: 'Nie znaleziono wydarzenia.' });
  } else {
    res.status(200).json(foundEvent);
  }
});

// 3. Dodawanie nowego wydarzenia
app.post('/api/events', function (req, res) {
  const title = req.body.title;
  const sport_type = req.body.sport_type;
  const date_time = req.body.date_time;
  const location_name = req.body.location_name;
  const max_players = req.body.max_players;
  const skill_level = req.body.skill_level;
  const description = req.body.description;

  // Sprawdzanie czy podano najważniejsze dane
  if (!title || !sport_type || !date_time || !location_name || !max_players) {
    res.status(400).json({ message: 'Wypełnij wszystkie wymagane pola!' });
    return;
  }

  // Obliczanie nowego ID
  let newId = 1;
  if (events.length > 0) {
    newId = events[events.length - 1].id + 1;
  }

  const newEvent = {
    id: newId,
    title: title,
    sport_type: sport_type,
    date_time: date_time,
    location_name: location_name,
    max_players: Number(max_players),
    skill_level: skill_level || 'Amator',
    description: description || ''
  };

  events.push(newEvent);
  res.status(201).json({ message: 'Dodano nowe wydarzenie!', event: newEvent });
});

// 4. Usuwanie wydarzenia po ID
app.delete('/api/events/:id', function (req, res) {
  const eventId = Number(req.params.id);
  const index = events.findIndex(function (event) {
    return event.id === eventId;
  });

  if (index === -1) {
    res.status(404).json({ message: 'Nie znaleziono wydarzenia do usunięcia.' });
  } else {
    events.splice(index, 1);
    res.status(200).json({ message: 'Wydarzenie zostało usunięte.' });
  }
});

// Uruchomienie serwera na porcie 3000
app.listen(PORT, function () {
  console.log('Serwer działa na adresie: http://localhost:' + PORT);
});