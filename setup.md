# Comanda — Restaurant POS — Setup Guide

A full-stack restaurant point-of-sale system: table management, menu management,
order taking (dine-in / takeaway / delivery), a kitchen status flow, and checkout
with tax + discount calculation.

**Stack**
- Backend: Spring Boot 3.3 (Java 17), Spring Security + JWT, Spring Data JPA
- Frontend: React 18 + TypeScript (Vite), Tailwind CSS
- Database: MySQL 8.4
- Orchestration: Docker Compose (backend, frontend + nginx, MySQL)

---

## 1. Project structure

```
restaurant-pos/
├── backend/                 Spring Boot API (Java 17, Maven)
│   ├── src/main/java/com/bsctf/pos/
│   │   ├── entity/          JPA entities
│   │   ├── repository/      Spring Data repositories
│   │   ├── dto/              Request/response DTOs
│   │   ├── service/          Business logic (orders, menu, tables, auth)
│   │   ├── controller/       REST controllers
│   │   ├── security/         JWT filter + service
│   │   ├── config/           Security, CORS, seed data
│   │   └── exception/        Global error handling
│   ├── src/main/resources/application.yml
│   └── Dockerfile
├── frontend/                 React + TypeScript (Vite)
│   ├── src/
│   │   ├── pages/            Login, Dashboard, Tables, POS, Orders, Menu
│   │   ├── components/       Layout, route guard, status pill
│   │   ├── api/               Axios client + typed resource calls
│   │   ├── context/           Auth context (JWT storage)
│   │   └── types/              Shared TypeScript types
│   ├── nginx.conf             Serves the SPA + proxies /api to the backend
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
└── setup.md                   You are here
```

---

## 2. Quick start with Docker (recommended)

This is the fastest way to run the entire stack — MySQL, backend, and frontend —
with a single command.

**Prerequisites:** Docker and Docker Compose installed.

```bash
# 1. Unzip the project and move into it
cd restaurant-pos

# 2. Copy the env template (defaults work out of the box for local use)
cp .env.example .env

# 3. Build and start everything
docker compose up --build
```

Once the containers are healthy:

- Frontend (web app): **http://localhost:3000**
- Backend API: **http://localhost:8080/api**
- MySQL: **localhost:3306** (user/password from `.env`)

The backend automatically creates its tables on first boot (`ddl-auto: update`)
and seeds:
- Two staff logins (see [Section 5](#5-demo-logins))
- 4 menu categories with 8 sample dishes
- 10 tables

To stop everything: `Ctrl+C`, then `docker compose down` (add `-v` to also wipe
the MySQL volume and reseed from scratch next time).

### Rebuilding after code changes

```bash
docker compose up --build backend    # rebuild just the backend
docker compose up --build frontend   # rebuild just the frontend
```

---

## 3. Running the backend locally (without Docker)

**Prerequisites:** Java 17, Maven 3.9+, a running MySQL 8 instance.

```bash
# 1. Create the database and a user (in a MySQL shell)
CREATE DATABASE restaurant_pos;
CREATE USER 'pos_user'@'%' IDENTIFIED BY 'pos_password';
GRANT ALL PRIVILEGES ON restaurant_pos.* TO 'pos_user'@'%';
FLUSH PRIVILEGES;
```

```bash
# 2. From backend/, run with your local MySQL connection details
cd backend
DB_HOST=localhost DB_PORT=3306 DB_NAME=restaurant_pos \
DB_USERNAME=pos_user DB_PASSWORD=pos_password \
JWT_SECRET=any-long-random-string-at-least-32-characters \
mvn spring-boot:run
```

The API will be live at `http://localhost:8080/api`. All configurable values
(DB host/port/name/credentials, JWT secret, JWT expiry) are read from
environment variables — see `backend/src/main/resources/application.yml` for
the full list and their defaults.

---

## 4. Running the frontend locally (without Docker)

**Prerequisites:** Node.js 20+.

```bash
cd frontend
cp .env.example .env          # sets VITE_API_URL=http://localhost:8080/api
npm install
npm run dev
```

The dev server runs at `http://localhost:5173` and talks directly to the
backend at the URL in `.env` (no nginx proxy needed in dev mode).

To build a production bundle: `npm run build` (output in `frontend/dist/`).

---

## 5. Demo logins

Seeded automatically on first backend startup:

| Username  | Password    | Role    |
|-----------|-------------|---------|
| admin     | admin123    | ADMIN   |
| cashier   | cashier123  | CASHIER |

Change or remove these in `backend/.../config/DataSeeder.java` before any
real deployment, and set a strong, unique `JWT_SECRET`.

---

## 6. How the app is organized (feature tour)

- **Dashboard** — today's revenue, order count, active tickets, and table
  occupancy at a glance.
- **Tables** — floor plan grid. Tap an available/reserved table to start an
  order there; occupied tables free up automatically once their order is
  paid (they move to "needs cleaning" until manually reset).
- **New Order (POS)** — menu grid with category tabs and search, a live cart
  with running subtotal/tax/total, and support for dine-in (table required),
  takeaway, and delivery order types.
- **Orders** — list of tickets (active / today / all) with a detail panel to
  advance kitchen status (Open → In Kitchen → Ready → Served), checkout with
  cash/card/UPI, or cancel.
- **Menu** — manage categories and dishes, edit prices/descriptions, and
  toggle a dish's availability (86 it) without deleting it.

## 7. Core business rules

- Tax is a flat 5% applied to `subtotal − discount`.
- An order's table is marked `OCCUPIED` when the order is created and
  `NEEDS_CLEANING` once it's paid; reset it to `AVAILABLE` from the Tables
  screen.
- Orders can't be modified once `PAID` or `CANCELLED`.
- Unavailable ("86'd") dishes can't be added to new or existing orders.

---

## 8. Troubleshooting

- **Backend can't connect to MySQL in Docker**: make sure the `mysql`
  service is healthy first — `docker compose ps` should show it as
  `healthy` before the backend finishes starting; Compose already waits
  for this via `depends_on.condition: service_healthy`.
- **Frontend shows network errors**: confirm `VITE_API_URL` (local dev) or
  the nginx `/api` proxy (Docker) points at a reachable backend, and that
  the backend is actually up on port 8080.
- **401 errors after login**: the JWT is stored in `localStorage` under
  `pos_token`. Clearing site data or logging out (which clears it too) will
  force a fresh login.
- **Port already in use**: change `MYSQL_PORT`, `BACKEND_PORT`, or
  `FRONTEND_PORT` in `.env` and re-run `docker compose up --build`.
