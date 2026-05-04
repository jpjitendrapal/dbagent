import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export interface ColumnSchema {
  columnName: string;
  dataType: string;
}

export interface TableSchema {
  tableName: string;
  columns: ColumnSchema[];
}

/**
 * Executes a raw SQL query safely.
 */
export async function executeQuery(sql: string, values?: any[]): Promise<any> {
  try {
    const [rows] = await pool.query(sql, values);
    return rows;
  } catch (error) {
    console.error('Database query failed:', error);
    throw error;
  }
}

/**
 * Extracts the complete schema (tables and their columns) of the current database.
 * This is used to feed the Vector Database for RAG.
 */
export async function extractDatabaseSchema(): Promise<TableSchema[]> {
  const dbName = process.env.DB_NAME;
  if (!dbName) throw new Error('DB_NAME environment variable is not set');

  const tablesQuery = `
    SELECT TABLE_NAME 
    FROM information_schema.tables 
    WHERE table_schema = ?;
  `;
  
  const tables = await executeQuery(tablesQuery, [dbName]) as { TABLE_NAME: string }[];
  
  const schema: TableSchema[] = [];

  for (const t of tables) {
    const tableName = t.TABLE_NAME;
    const columnsQuery = `
      SELECT COLUMN_NAME, DATA_TYPE 
      FROM information_schema.columns 
      WHERE table_schema = ? AND table_name = ?;
    `;
    const cols = await executeQuery(columnsQuery, [dbName, tableName]) as { COLUMN_NAME: string, DATA_TYPE: string }[];
    
    schema.push({
      tableName,
      columns: cols.map(c => ({
        columnName: c.COLUMN_NAME,
        dataType: c.DATA_TYPE
      }))
    });
  }

  return schema;
}

export default pool;
