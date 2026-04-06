# TCL Server (Backend)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bun](https://img.shields.io/badge/Runtime-Bun-black.svg?logo=bun&logoColor=white)](https://bun.sh)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Drizzle](https://img.shields.io/badge/ORM-Drizzle-C5F74F.svg?logo=drizzle&logoColor=black)](https://orm.drizzle.team/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791.svg?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Cache-Redis-DC382D.svg?logo=redis&logoColor=white)](https://redis.io/)
[![AWS IoT](https://img.shields.io/badge/IoT-AWS%20IoT-FF9900.svg?logo=amazon-aws&logoColor=white)](https://aws.amazon.com/iot-core/)

The **TCL Server** is a high-performance, modern backend designed to interact with TCL Air Conditioning systems. It integrates with the unofficial TCL Home cloud API and uses AWS IoT Core for real-time device state synchronization.

---

## 🚀 Key Features

-   🔐 **Authentication**: Secure login and session management for TCL Home services.
-   📡 **AWS IoT Core Integration**: Real-time updates and synchronization for device states (WorkMode, WindSpeed, Temperature, etc.).
-   📊 **Drizzle ORM & Postgres**: Efficient database management and migrations for device and user data.
-   ⚡ **Redis Caching**: High-performance session and state caching.
-   📘 **Interactive API Docs**: Fully interactive API reference powered by **Scalar** (accessible at `/scalar`).
-   🏗️ **Modern Tech Stack**: Built with Express v5 and optimized for the Bun runtime.

---

## 🛠️ Prerequisites

-   [Bun](https://bun.sh) (latest version)
-   [Docker](https://www.docker.com/) (for PostgreSQL and Redis)
-   TypeScript 5.0+

---

## 🏁 Getting Started

### 1. Clone & Install
```bash
git clone <repository-url>
cd tcl-server/backend
bun install
```

### 2. Infrastructure Setup
Use the provided `docker-compose.yml` to spin up the database and cache:
```bash
docker compose up -d
```

### 3. Environment Configuration
Copy the template and fill in your TCL and AWS credentials:
```bash
cp .env.example .env
```

| Variable | Description |
| :--- | :--- |
| `TCL_USERNAME` | Your TCL Home account username (email). |
| `TCL_PASSWORD` | Your TCL Home account password. |
| `DATABASE_URL` | PostgreSQL connection string. |
| `REDIS_URL` | Redis connection string. |
| `JWT_SECRET` | Secret key for signing authentication tokens. |

### 4. Database Initialization
Generate and apply migrations using Drizzle:
```bash
bun run db:generate
bun run db:migrate
```

### 5. Start the Server
```bash
# Development mode (with hot-reload)
bun run dev

# Production mode
bun run start
```

---

## 📖 API Documentation

The server includes built-in interactive documentation using [Scalar](https://scalar.com/). 

-   **Interactive UI**: [http://localhost:3000/scalar](http://localhost:3000/scalar)
-   **OpenAPI Spec**: [http://localhost:3000/swagger.json](http://localhost:3000/swagger.json)

> [!NOTE]
> API documentation is only available when `NODE_ENV` is set to `development`.

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── configs/       # App configurations (Logger, ENV, Swagger, etc.)
│   ├── database/      # Drizzle schema, migrations, and seeds
│   ├── services/      # Core business logic (TCL instance, AWS IoT)
│   ├── routes/        # API endpoint definitions and swagger definitions
│   └── types/         # TypeScript definitions
├── docker-compose.yml # Postgres and Redis setup
├── drizzle.config.ts  # Database migration config
└── package.json       # Dependencies and scripts
```

---

## 📜 Scripts

| Command | Description |
| :--- | :--- |
| `bun run dev` | Starts the server in watch mode. |
| `bun run start` | Starts the server in production mode. |
| `bun run db:generate` | Generates a new database migration. |
| `bun run db:migrate` | Applies pending migrations to the database. |
| `bun run db:push` | Directly pushes schema changes (for development). |
| `bun run db:studio` | Opens the Drizzle Studio database explorer. |

---

## ⚖️ License

Built by [iddhi-sulakshana](https://github.com/iddhi-sulakshana). Licensed under the MIT License.

---

## ⚠️ Disclaimer

This project is an unofficial integration and is NOT affiliated with TCL. Use it responsibly and ensure compliance with TCL's terms of service.

