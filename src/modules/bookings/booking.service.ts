import { pool } from "../../config/db.js";

const AutoReturnExpiredBookings = async () => {
  // Mark expired active bookings as returned and free vehicles
  const result = await pool.query(`
    WITH returned AS (
      UPDATE bookings
      SET status = 'returned'
      WHERE status = 'active' AND rent_end_date < CURRENT_DATE
      RETURNING vehicle_id
    )
    UPDATE vehicles
    SET availability_status = 'available'
    WHERE id IN (SELECT DISTINCT vehicle_id FROM returned)
    RETURNING id
  `);

  return result;
};

const GetVehicle = async (vehicleId: string) => {
  const result = await pool.query(`SELECT * FROM vehicles WHERE id=$1`, [
    vehicleId,
  ]);
  return result;
};

const CreateBooking = async (
  customer_id: number,
  vehicle_id: number,
  rent_start_date: string,
  rent_end_date: string,
  total_price: number,
) => {
  const result = await pool.query(
    `
      WITH v AS (
        UPDATE vehicles
        SET availability_status = 'booked'
        WHERE id = $2 AND availability_status = 'available'
        RETURNING id
      ),
      b AS (
        INSERT INTO bookings(customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status)
        SELECT $1, $2, $3, $4, $5, 'active'
        WHERE EXISTS (SELECT 1 FROM v)
        RETURNING id, customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status
      )
      SELECT * FROM b
    `,
    [customer_id, vehicle_id, rent_start_date, rent_end_date, total_price],
  );

  return result;
};

const GetAllBookingsForAdmin = async () => {
  const result = await pool.query(
    `SELECT
        b.id,
        b.customer_id,
        b.vehicle_id,
        b.rent_start_date,
        b.rent_end_date,
        b.total_price,
        b.status,
        json_build_object('name', u.name, 'email', u.email) as customer,
        json_build_object('vehicle_name', v.vehicle_name, 'registration_number', v.registration_number) as vehicle
     FROM bookings b
     JOIN users u ON u.id = b.customer_id
     JOIN vehicles v ON v.id = b.vehicle_id
     ORDER BY b.id DESC`,
  );
  return result;
};

const GetAllBookingsForCustomer = async (customerId: number) => {
  const result = await pool.query(
    `SELECT
        b.id,
        b.vehicle_id,
        b.rent_start_date,
        b.rent_end_date,
        b.total_price,
        b.status,
        json_build_object(
          'vehicle_name', v.vehicle_name,
          'registration_number', v.registration_number,
          'type', v.type
        ) as vehicle
     FROM bookings b
     JOIN vehicles v ON v.id = b.vehicle_id
     WHERE b.customer_id = $1
     ORDER BY b.id DESC`,
    [customerId],
  );
  return result;
};

const GetBookingById = async (bookingId: string) => {
  const result = await pool.query(`SELECT * FROM bookings WHERE id=$1`, [
    bookingId,
  ]);
  return result;
};

const UpdateBookingStatus = async (
  bookingId: string,
  status: string,
  vehicleId: number,
) => {
  const result = await pool.query(
    `
      WITH b AS (
        UPDATE bookings
        SET status = $1
        WHERE id = $2
        RETURNING id, customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status
      ),
      v AS (
        UPDATE vehicles
        SET availability_status = 'available'
        WHERE id = $3 AND $1 IN ('returned', 'cancelled')
        RETURNING id
      )
      SELECT * FROM b
    `,
    [status, bookingId, vehicleId],
  );

  return result;
};

export const bookingService = {
  AutoReturnExpiredBookings,
  GetVehicle,
  CreateBooking,
  GetAllBookingsForAdmin,
  GetAllBookingsForCustomer,
  GetBookingById,
  UpdateBookingStatus,
};

