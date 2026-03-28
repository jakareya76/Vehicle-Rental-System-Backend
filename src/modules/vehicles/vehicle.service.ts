import { pool } from "../../config/db.js";

const AddVehicle = async (payload: Record<string, unknown>) => {
  const {
    vehicle_name,
    type,
    registration_number,
    daily_rent_price,
    availability_status,
  } = payload;

  const result = await pool.query(
    `INSERT INTO vehicles(vehicle_name, type, registration_number, daily_rent_price, availability_status) VALUES($1, $2, $3, $4, $5) RETURNING *`,
    [
      vehicle_name,
      type,
      registration_number,
      daily_rent_price,
      availability_status,
    ],
  );

  return result;
};

const GetAllVehicles = async () => {
  const result = await pool.query(`SELECT * FROM vehicles`);
  return result;
};

const GetSingleVehicle = async (id: string) => {
  const result = await pool.query(`SELECT * FROM vehicles WHERE id=$1`, [id]);
  return result;
};

const UpdateVehicle = async (
  id: string,
  vehicle_name: string,
  type: string,
  registration_number: string,
  daily_rent_price: string,
  availability_status: string,
) => {
  const result = await pool.query(
    `UPDATE vehicles SET vehicle_name = COALESCE($1, vehicle_name), type = COALESCE($2, type), registration_number = COALESCE($3, registration_number), daily_rent_price = COALESCE($4, daily_rent_price), availability_status = COALESCE($5, availability_status) WHERE id = $6 RETURNING *
    `,
    [
      vehicle_name,
      type,
      registration_number,
      daily_rent_price,
      availability_status,
      id,
    ],
  );

  return result;
};

const DeleteNonActiveBookings = async (vehicleId: string) => {
  const result = await pool.query(
    `DELETE FROM bookings WHERE vehicle_id = $1 AND status IN ('cancelled', 'returned')`,
    [vehicleId],
  );
  return result;
};

const DeleteVehicle = async (id: string) => {
  const result = await pool.query(`DELETE FROM vehicles WHERE id=$1`, [id]);
  return result;
};

const HasActiveBookings = async (vehicleId: string) => {
  const result = await pool.query(
    `SELECT 1 FROM bookings WHERE vehicle_id = $1 AND status = 'active' LIMIT 1`,
    [vehicleId],
  );
  return result;
};

export const vehicleService = {
  AddVehicle,
  GetAllVehicles,
  GetSingleVehicle,
  UpdateVehicle,
  HasActiveBookings,
  DeleteNonActiveBookings,
  DeleteVehicle,
};
