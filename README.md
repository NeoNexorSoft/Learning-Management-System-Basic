# Learning-Management-System-Basic
A multi-purpose Learning Management System built with NextJs &amp; Node.js — manage courses, users, and learning progress all in one place.
# NeoNexor – Learning Management System

---

## Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- **PostgreSQL** database

---

## Backend (Node.js + Express + Prisma)

### 1. Navigate to the backend directory

```bash
cd backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the `backend/` directory:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME
JWT_SECRET=your_jwt_secret_key
PORT=5001

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 4. Run database migrations

```bash
npx prisma migrate deploy
```

### 5. (Optional) Seed the database

```bash
npm run seed
```

### 6. Start the development server

```bash
npm run dev
```

### 7. Start the worker in dev and prod

```bash
ts-node src/workers/email.worker.ts // dev
node dist/workers/email.worker.js // prod
```

The backend will be running at `http://localhost:5000`

### Build for production

```bash
npm run build
npm start
```

---

## Frontend (Next.js)

### 1. Navigate to the frontend directory

```bash
cd frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the `frontend/` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5001
```

### 4. Start the development server

```bash
npm run dev
```

The frontend will be running at `http://localhost:3000`

### Build for production

```bash
npm run build
npm start
```

---

## Running Both Together

Open two terminal windows:

**Terminal 1 – Backend**
```bash
cd backend
npm run dev
```

**Terminal 2 – Frontend**
```bash
cd frontend
npm run dev
```

Then open `http://localhost:3000` in your browser.
