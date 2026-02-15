import { Pool } from "pg";
import config from "./index.js";

export const pool = new Pool({
  connectionString: config.DB_URL,
});

const initDB = async () => {
  await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(150) UNIQUE NOT NULL CHECK (email = LOWER(email)),
            password TEXT NOT NULL,
            phone TEXT NOT NULL,
            role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'customer'))
        )
    `);

  await pool.query(`
            CREATE TABLE IF NOT EXISTS vehicles (
                id SERIAL PRIMARY KEY,
                vehicle_name VARCHAR(150) NOT NULL,
                type VARCHAR(20) NOT NULL CHECK (type IN ('car', 'bike', 'van', 'SUV')),
                registration_number VARCHAR(50) UNIQUE NOT NULL,
                daily_rent_price NUMERIC(10,2) NOT NULL CHECK (daily_rent_price > 0),
                availability_status VARCHAR(20) NOT NULL CHECK (availability_status IN ('available', 'booked'))
            )
        `);

  await pool.query(`
            CREATE TABLE IF NOT EXISTS bookings (
                id SERIAL PRIMARY KEY,
                customer_id INTEGER NOT NULL,
                vehicle_id INTEGER NOT NULL,
                rent_start_date DATE NOT NULL,
                rent_end_date DATE NOT NULL,
                total_price NUMERIC(10,2) NOT NULL CHECK (total_price > 0),
                status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'cancelled', 'returned')),

                CONSTRAINT fk_customer
                    FOREIGN KEY (customer_id)
                    REFERENCES users(id)
                    ON DELETE RESTRICT,

                CONSTRAINT fk_vehicle
                    FOREIGN KEY (vehicle_id)
                    REFERENCES vehicles(id)
                    ON DELETE RESTRICT,

                CONSTRAINT valid_rent_dates
                    CHECK (rent_end_date > rent_start_date)
            )
        `);
};

export default initDB;
