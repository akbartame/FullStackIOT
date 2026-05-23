import Database from 'better-sqlite3';

const db = new Database('data/fsiot.db');

const indexes = db.prepare(`
    SELECT name, tbl_name, sql 
    FROM sqlite_master 
    WHERE type='index' AND tbl_name='sensor_readings'
`).all();

console.log('\n=== Indexes on sensor_readings ===');
indexes.forEach(idx => {
    console.log(`Index: ${idx.name}`);
    console.log(`SQL: ${idx.sql}`);
    console.log('');
});

// Also verify schema
const schema = db.prepare(`PRAGMA table_info(sensor_readings)`).all();
console.log('=== Table Schema ===');
schema.forEach(col => {
    console.log(`  ${col.name}: ${col.type}${col.notnull ? ' NOT NULL' : ''}`);
});

db.close();
