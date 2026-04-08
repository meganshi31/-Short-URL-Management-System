# Short URL Management System

User-based short URL management system built with the MERN stack.

## Tech Stack

- Backend: Node.js, Express, MongoDB, Mongoose, JWT
- Frontend: React, Vite, Axios

## Features

- Register, login, and logout with JWT authentication
- Create short URLs with title, original URL, start time, and end time
- View only the links created by the logged-in user
- Activate or deactivate links
- Delete links
- Public redirection through `/:shortCode`
- Redirect protection for inactive, scheduled, expired, and invalid links
- Loading states, error handling, and copy short link support

## Project Structure

```text
url-manager-system/
  backend/
  my-app/
```

## Setup Instructions

### 1. Backend

```bash
cd backend
npm install
```

Create a `.env` file using [backend/.env.example](/d:/react-js/url-manager-system/backend/.env.example).

Run the server:

```bash
npm run dev
```

The backend runs on `http://localhost:5000`.

### 2. Frontend

```bash
cd my-app
npm install
```

Create a `.env` file using [my-app/.env.example](/d:/react-js/url-manager-system/my-app/.env.example).

Run the frontend:

```bash
npm run dev
```

The frontend runs on `http://localhost:5173`.

## Environment Variables

### Backend

- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: secret used to sign JWT tokens
- `CLIENT_URL`: allowed frontend origin for CORS
- `PORT`: backend server port
- `USE_FILE_DB`: when `true`, stores users and links in `backend/data/db.json` instead of MongoDB

### Frontend

- `VITE_API_BASE_URL`: backend API base URL
  Leave it unset in local development to use the built-in Vite `/api` proxy.

## API Endpoints

### Auth

- `POST /api/auth/register`
  Request body:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`

### Links

- `GET /api/links`
- `POST /api/links`
  Request body:
  ```json
  {
    "title": "Portfolio",
    "originalUrl": "https://example.com",
    "startTime": "2026-04-08T18:00",
    "endTime": "2026-04-10T18:00"
  }
  ```
- `PATCH /api/links/:id/toggle`
- `DELETE /api/links/:id`

### Public Redirect

- `GET /:shortCode`

## Assumptions

- Logout is handled client-side by removing the JWT token. No token blacklist is stored.
- Short codes are auto-generated and uniqueness is enforced before save and by the MongoDB unique index.
- Start time and end time are optional. If omitted, the link is valid immediately and has no expiry limit.
- Only `http` and `https` URLs are accepted for redirection.

## Without MongoDB

If MongoDB is not running, set `USE_FILE_DB=true` in [backend/.env](/d:/react-js/url-manager-system/backend/.env).  
The backend will then save users and links locally in [db.json](/d:/react-js/url-manager-system/backend/data/db.json), which is useful for assignment demos and local testing.

## Notes

- The frontend keeps the logic intentionally small and readable with one API module, one top-level session owner, and focused UI components.
- The backend uses route-level ownership checks so each user can access only their own links.
