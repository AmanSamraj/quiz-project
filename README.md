# QuizFlow — Online Assessment Platform

A React/Vite and Express/Prisma monorepo for secure, timed online quizzes. It has JWT authentication, ADMIN/STUDENT authorization, published-quiz discovery, secure server-timed attempts, backend scoring, review, dashboards, analytics, and leaderboard endpoints.

## Run locally

1. Copy `.env.example` to `server/.env` and set a PostgreSQL `DATABASE_URL` and strong `JWT_SECRET`.
2. Run `npm install` from the repository root.
3. Run `npm run prisma:migrate -w server -- --name init`, then `npm run seed`.
4. Run `npm run dev`; client is at `http://localhost:5173`, API at `http://localhost:5000`.

Development admin: `admin@example.com` / `Admin123!` (override with `ADMIN_PASSWORD` before seeding).

## Core API

`/api/auth`, `/api/categories`, `/api/quizzes`, `/api/quizzes/:quizId/questions`, `/api/attempts`, `/api/admin/analytics`, and `/api/leaderboard` implement the primary flow. The backend derives expiry, scoring, pass/fail, ownership and role checks from server/database data; correct options are withheld from active attempts.
