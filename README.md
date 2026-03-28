# Vehicle Rental System (Backend API)

Live Link: https://b6-a2-chi.vercel.app

## What this project does

This is a backend API for a vehicle rental system.

Main parts:

- Users (admin, customer)
- Vehicles
- Bookings
- Login with JWT

## Features

- Sign up and sign in (JWT)
- Admin can add/update/delete vehicles
- Anyone can view vehicles
- Admin can see all users and update users
- Customer can update only own profile (cannot change role)
- Customer/Admin can create bookings
- Booking price is calculated automatically
- Vehicle status changes to `booked` when a booking is created
- Vehicle becomes `available` when booking is cancelled/returned
- User/Vehicle cannot be deleted if there is an active booking

## Technology Stack

- Node.js
- TypeScript
- Express.js
- PostgreSQL
- bcryptjs
- jsonwebtoken

## Setup & Usage (Local)

### Requirements

- Node.js (LTS)
- PostgreSQL

### Install

```bash
npm install
```

### Environment variables

Create a `.env` file in the project root:

```env
PORT=5000
DB_URL=postgresql://USER:PASSWORD@HOST:PORT/DB_NAME
JWT_SECRET=your_jwt_secret
```

### Run (dev)

```bash
npm run dev
```

### Build and run

```bash
npm run build
npm start
```
