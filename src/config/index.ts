import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const config = {
  DB_URL: process.env.DB_URL,
  port: process.env.PORT,
  JwtSecret: process.env.JWT_SECRET,
};

export default config;
