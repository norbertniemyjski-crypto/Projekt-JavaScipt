# Projekt-JavaScipt

ZagrajmyBIA. Serwis do organizacji gier i wydarzeń sportowych. 

Opis projektu.

Aplikacja internetowa skierowana do mieszkańców Białegostoku i okolic, ułatwiająca umawianie się na wspólne rozgrywki w  różnych sportach np  piłka nożna, koszykówka, siatkówka, tenis . System rozwiązuje problem braku kompletnych składów na mecze  oraz pomaga osobom nowym w mieście znaleźć partnerów do gry. 

Wymagania funkcjonalne: 

1.Uwierzytelnianie i profil użytkownika. 

Rejestracja i logowanie użytkowników. 

Dedykowany panel profilu z listą zorganizowanych rozgrywek oraz meczów, do których użytkownik dołączył. 

2.Zarządzanie ogłoszeniami. 

Tworzenie ogłoszenia: wybór dyscypliny, daty i godziny, dokładnej lokalizacji w Białymstoku np. nazwa Orlika lub hali, limitu graczy oraz poziomu zaawansowania. 

Edycja i usuwanie własnych ogłoszeń przez autora. 

Automatyczna zmiana statusu wydarzenia np. Planowane, Brak miejsc, Zakończone.. 

3.Przeglądanie, filtrowanie i interaktywna mapa: 

Lista ogłoszeń z możliwością filtrowania po dyscyplinie, dacie, poziomie trudności i sortowania najbliższe mecze. 

Widok mapy Białegostoku z zaznaczonymi punktami zbiórek lub obiektów sportowych. 

4.System zapisów i obsługa limitów: 

Dołączanie do meczu oraz rezygnacja z udziału jednym kliknięciem. 

Licznik wolnych miejsc na żywo oraz podgląd listy zapisanych uczestników.

Model Danych Encje i Relacje 

Główne encje 

1. User Użytkownik 

id (PK) 

username STRING 

email STRING, UNIQUE 

password_hash STRING 

created_at DATETIME 

2. Event Mecz  lubOgłoszenie 

id PK 

title STRING 

sport_type STRING 

date_time DATETIME 

location_name STRING 

latitude FLOAT 

longitude FLOAT 

max_players INTEGER 

skill_level STRING 

description TEXT 

status STRING 

author_id FK  User.id 

3. EventParticipant Uczestnik  tabela łącząca 

id PK 

event_id FK  Event.id 

user_id FK  User.id 

joined_at DATETIME 

Relacje między tabelami 

User  Event 1 do wielu Użytkownik może utworzyć wiele ogłoszeń. 

User  Event wiele do wielu poprzez EventParticipant: Użytkownik może brać udział w wielu meczach, a mecz skupia wielu graczy. 

 Specyfikacja REST API 

Autoryzacja /api/auth 

POST /api/auth/register  Rejestracja nowego konta 

POST /api/auth/login  Logowanie i generowanie tokena/sesji 

GET /api/auth/me  Pobranie danych zalogowanego użytkownika 

Wydarzenia /api/events 

GET /api/events  Pobranie listy ogłoszeń  

GET /api/events/:id  Pobranie szczegółów ogłoszenia wraz z listą uczestników 

POST /api/events  Dodanie nowego ogłoszenia wymaga zalogowania 

PUT /api/events/:id  Edycja ogłoszenia tylko autor 

DELETE /api/events/:id Usunięcie ogłoszenia tylko autor 

Udział w Wydarzeniach /api/events/:id/participants 

POST /api/events/:id/join – Rezerwacja miejsca w meczu 

DELETE /api/events/:id/leave – Rezygnacja z udziału 

 Podział Zadań w Zespole 

Jeszczedo ustalenia 
