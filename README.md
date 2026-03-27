# Yukti ERP

Full‑stack ERP project with a **Next.js frontend** and a **Node.js/Express backend**, using a hybrid database setup (PostgreSQL + MongoDB) and optional Redis caching.

> Note: some configs/scripts may still reference the older internal name “OnchainERP”. This README describes the project as **Yukti ERP**.

## Overview

**Yukti ERP** provides an API and supporting infrastructure to manage structured domain data in **PostgreSQL** while using **MongoDB** for **system logs and unstructured documents**. **Redis** is included for optional caching.

## Tech Stack

- **Frontend**: Next.js
- **Backend**: Node.js (>= 18), Express
- **Databases**: PostgreSQL (primary), MongoDB (logs/unstructured)
- **Cache (optional)**: Redis
- **ORM**: Sequelize (PostgreSQL)
- **Docs**: Swagger UI (served by the backend)
- **Dev tooling**: nodemon, eslint, jest

## Services (Docker)

This repo includes a `docker-compose.yml` that starts:

- **PostgreSQL**: `localhost:5432`
- **MongoDB**: `localhost:27017`
- **Redis**: `localhost:6379`
- **pgAdmin**: `http://localhost:8080`
- **Mongo Express**: `http://localhost:8081`

## Getting Started

### Prerequisites

- **Node.js**: 18+
- **Docker** + **Docker Compose**

### 1) Start infrastructure (databases, tools)

From the repo root:

```bash
docker compose up -d
```

### 2) Install backend dependencies

```bash
cd backend
npm install
```

### 3) Configure environment

Copy the example env file and update values as needed:

```bash
cp .env.example .env
```

### 4) Run the backend

Development (recommended):

```bash
npm run dev
```

Production:

```bash
npm start
```

### 5) Run the frontend (optional)

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Database Utilities

Run these from `backend/`:

- **Seed data**

```bash
npm run seed:import
```

- **Delete seeded data**

```bash
npm run seed:delete
```

- **Run migration helper**

```bash
npm run migrate
```

- **Connect databases (smoke check)**

```bash
npm run db:setup
```

- **Reset PostgreSQL schema (destructive)**

```bash
npm run db:reset
```

## Project Structure

```text
.
├── backend/    # Express API (Node.js)
├── frontend/   # Next.js app
└── docker-compose.yml
```

## Additional Docs

- **Backend docs**: `backend/README.md`
- **Frontend docs**: `frontend/README.md`

## Developer

- **Name**: Ansh Bhatt
- **Email**: `anshbhatt140@gmail.com`
- **Portfolio**: `https://www.anshbhatt.space`

