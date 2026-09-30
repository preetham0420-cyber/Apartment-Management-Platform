import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

/**
 * MySQL 8.0+ Connection Pool Configuration
 * Uses parameterized queries and native connection pooling.
 * Credentials loaded strictly from environment variables.
 */
export const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306", 10),
  database: process.env.DB_NAME || "apartment_management_dev",
  user: process.env.DB_USER || "app_user",
  password: process.env.DB_PASSWORD || "",
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || "10", 10),
  waitForConnections: true,
  queueLimit: 0,
  charset: "utf8mb4"
});

/**
 * Test database connectivity safely without logging credentials.
 */
export async function testDatabaseConnection(): Promise<{ connected: boolean; message: string }> {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    return { connected: true, message: "MySQL 8.0+ connected successfully." };
  } catch (error) {
    const err = error as Error;
    return {
      connected: false,
      message: `Database connection unavailable: ${err.message}`
    };
  }
}
