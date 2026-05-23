import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'data/fsiot.db');

const db = new Database(dbPath);

// Get row count
const countResult = db.prepare('SELECT COUNT(*) as total_rows FROM sensor_readings').get();
console.log('\n=== Database Statistics ===');
console.log(`Total rows: ${countResult.total_rows}`);

// Get first 5 rows
const rows = db.prepare('SELECT * FROM sensor_readings LIMIT 5').all();
console.log('\n=== First 5 Rows ===');
rows.forEach((row, index) => {
    console.log(`\nRow ${index + 1}:`);
    console.log(`  ID: ${row.id}`);
    console.log(`  Device: ${row.device_id}`);
    console.log(`  Timestamp: ${new Date(row.received_at).toISOString()}`);
    console.log(`  Temp: ${row.temperature_c}°C | Humidity: ${row.humidity}%`);
    console.log(`  Gas PPM: ${row.gas_ppm} | MQ2 V: ${row.mq2_voltage_v}V`);
    console.log(`  Valid: ${row.is_valid ? 'YES' : 'NO'}`);
});

// Get validity distribution
const validityStats = db.prepare(`
    SELECT 
        is_valid, 
        COUNT(*) as count 
    FROM sensor_readings 
    GROUP BY is_valid
`).all();

console.log('\n=== Validity Distribution ===');
validityStats.forEach(stat => {
    console.log(`  Valid=${stat.is_valid}: ${stat.count} rows`);
});

db.close();
