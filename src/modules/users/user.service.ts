import { pool } from "../../config/db.js";

const GetAllUsers = async () => {
  const result = await pool.query(
    `SELECT id, name, email, phone, role FROM users`,
  );
  return result;
};

const GetSingleUser = async (id: string) => {
  const result = await pool.query(`SELECT email FROM users WHERE id=$1`, [id]);
  return result;
};

const UpdateUser = async (
  id: string,
  name: string,
  email: string,
  phone: string,
  role: string,
) => {
  const result = await pool.query(
    `UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email), phone = COALESCE($3, phone), role = COALESCE($4, role) WHERE id = $5 RETURNING id, name, email, phone, role`,
    [name, email, phone, role, id],
  );

  return result;
};

const DeleteNonActiveBookings = async (userId: string) => {
  const result = await pool.query(
    `DELETE FROM bookings WHERE customer_id = $1 AND status IN ('cancelled', 'returned')`,
    [userId],
  );
  return result;
};

const DeleteUser = async (id: string) => {
  const result = await pool.query("DELETE FROM users WHERE id = $1", [id]);
  return result;
};

const HasActiveBookings = async (customerId: string) => {
  const result = await pool.query(
    `SELECT 1 FROM bookings WHERE customer_id = $1 AND status = 'active' LIMIT 1`,
    [customerId],
  );
  return result;
};

export const userService = {
  GetAllUsers,
  GetSingleUser,
  UpdateUser,
  HasActiveBookings,
  DeleteNonActiveBookings,
  DeleteUser,
};
