import db from './database.js';

const RETENTION_DAYS = 30;

/**
 * Delete sensor readings older than 30 days where is_valid = 0
 * Run periodically to prevent database bloat
 */
export function cleanupInvalidReadings() {
    const thirtyDaysAgo = Date.now() - (RETENTION_DAYS * 24 * 60 * 60 * 1000);
    
    try {
        const result = db.prepare(`
            DELETE FROM sensor_readings 
            WHERE is_valid = 0 AND received_at < ?
        `).run(thirtyDaysAgo);
        
        if (result.changes > 0) {
            console.log(`[DB] Cleanup: Deleted ${result.changes} invalid readings older than ${RETENTION_DAYS} days`);
        }
    } catch (err) {
        console.error('[DB] Cleanup failed:', err.message);
    }
}

/**
 * Start periodic cleanup job (runs every 24 hours)
 */
export function startMaintenanceJob() {
    // Run cleanup immediately on startup
    cleanupInvalidReadings();
    
    // Then run every 24 hours
    const interval = setInterval(() => {
        cleanupInvalidReadings();
    }, 24 * 60 * 60 * 1000);
    
    console.log(`[DB] Maintenance job started (cleanup every 24 hours)`);
    
    return interval;
}
