const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'ZagrajmyBIA API',
    version: '1.0.0',
    description: 'Dokumentacja REST API platformy do organizacji lokalnych wydarzeń sportowych.'
  },
  servers: [
    { url: 'http://localhost:3000', description: 'Serwer lokalny' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  paths: {
    '/api/events': {
      get: {
        summary: 'Pobierz listę wydarzeń z filtrowaniem, wyszukiwaniem i sortowaniem',
        tags: ['Wydarzenia'],
        parameters: [
          { name: 'sport', in: 'query', schema: { type: 'string' }, description: 'Filtr dyscypliny (np. Piłka nożna)' },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Szukana fraza w tytule lub lokalizacji' },
          { name: 'sort', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] }, description: 'Kierunek sortowania' }
        ],
        responses: {
          200: { description: 'Lista wydarzeń sportowych' }
        }
      },
      post: {
        summary: 'Utwórz nowe wydarzenie',
        tags: ['Wydarzenia'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'sport_type', 'date_time', 'location_name', 'max_players'],
                properties: {
                  title: { type: 'string', example: 'Mecz 5x5 na Orliku' },
                  sport_type: { type: 'string', example: 'Piłka nożna' },
                  date_time: { type: 'string', example: '20.11.2026, 18:00' },
                  location_name: { type: 'string', example: 'Białystok, Wiejska 45A' },
                  max_players: { type: 'integer', example: 10 },
                  skill_level: { type: 'string', example: 'Średniozaawansowany' },
                  description: { type: 'string', example: 'Gramy po 45 minut' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Wydarzenie utworzone' },
          400: { description: 'Błąd walidacji danych' },
          401: { description: 'Brak lub nieprawidłowy token JWT' }
        }
      }
    },
    '/api/events/{id}/join': {
      post: {
        summary: 'Dołącz lub wypisz się z wydarzenia',
        tags: ['Wydarzenia'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: { description: 'Zmieniono status uczestnictwa' },
          400: { description: 'Brak wolnych miejsc' },
          401: { description: 'Nieautoryzowany' },
          404: { description: 'Wydarzenie nie istnieje' }
        }
      }
    },
    '/api/auth/register': {
      post: {
        summary: 'Rejestracja nowego użytkownika',
        tags: ['Autoryzacja'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['username', 'email', 'password'],
                properties: {
                  username: { type: 'string', example: 'JanKowalski' },
                  email: { type: 'string', example: 'jan@example.com' },
                  password: { type: 'string', example: 'tajneHaslo123' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Użytkownik utworzony' },
          400: { description: 'Email lub nazwa użytkownika już zajęta' }
        }
      }
    },
    '/api/auth/login': {
      post: {
        summary: 'Logowanie i pobranie tokena JWT',
        tags: ['Autoryzacja'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'jan@example.com' },
                  password: { type: 'string', example: 'tajneHaslo123' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Zwraca token JWT' },
          400: { description: 'Błędny email lub hasło' }
        }
      }
    },
    '/api/me': {
      get: {
        summary: 'Pobierz profil zalogowanego użytkownika',
        tags: ['Autoryzacja'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Dane użytkownika' },
          401: { description: 'Brak autoryzacji' }
        }
      }
    }
  }
};

module.exports = swaggerDocument;