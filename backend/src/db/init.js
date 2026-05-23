import db from './database.js';

export function initDatabase() {
    // Create sensor_readings table
    db.exec(`
        CREATE TABLE IF NOT EXISTS sensor_readings (
            id               INTEGER PRIMARY KEY AUTOINCREMENT,
            device_id        TEXT    NOT NULL,
            received_at      INTEGER NOT NULL,
            device_uptime_ms INTEGER,
            temperature_c    REAL,
            humidity         REAL,
            gas_ppm          REAL,
            mq2_voltage_v    REAL,
            mq2_rs_kohm      REAL,
            mq2_ratio        REAL,
            is_valid         INTEGER NOT NULL DEFAULT 0
        );
    `);

    // Create index on received_at for efficient time-range queries
    db.exec(`
        CREATE INDEX IF NOT EXISTS idx_received_at ON sensor_readings(received_at);
    `);

    console.log('[DB] Database initialized successfully');
}
