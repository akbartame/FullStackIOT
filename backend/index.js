import { initDatabase } from './src/db/init.js';
import { closeDatabase } from './src/db/database.js';
import { startMaintenanceJob } from './src/db/maintenance.js';
import { createMqttClient, getMqttClient } from './src/mqtt/client.js';
import { registerSubscriber } from './src/mqtt/subscriber.js';
import { createHttpServer } from './src/http/server.js';
import { SERVER } from './src/config/index.js';

let mqttClient = null;
let httpServer = null;
let maintenanceInterval = null;

console.log('[APP] Starting FullStackIOT Backend...');

// Initialize database on startup
try {
    initDatabase();
} catch (err) {
    console.error('[APP] Fatal: Database initialization failed:', err.message);
    process.exit(1);
}

// Create and configure MQTT client
try {
    mqttClient = createMqttClient();
    registerSubscriber(mqttClient);
} catch (err) {
    console.error('[APP] Fatal: MQTT client initialization failed:', err.message);
    closeDatabase();
    process.exit(1);
}

// Start HTTP control server (localhost only)
try {
    httpServer = createHttpServer(SERVER.port);
    httpServer.listen(SERVER.port, '127.0.0.1', () => {
        console.log(`[HTTP] Control server listening on http://127.0.0.1:${SERVER.port}`);
    });
} catch (err) {
    console.error('[APP] Fatal: HTTP server initialization failed:', err.message);
    closeDatabase();
    mqttClient.end();
    process.exit(1);
}

// Start database maintenance job (cleanup old invalid records)
try {
    maintenanceInterval = startMaintenanceJob();
} catch (err) {
    console.error('[APP] Warning: Maintenance job failed to start:', err.message);
}

console.log('[APP] Backend initialization complete');

// ── Graceful Shutdown ──────────────────────────────────────────
function gracefulShutdown(signal) {
    console.log(`\n[APP] Received ${signal}, shutting down gracefully...`);

    // Stop accepting new connections
    if (httpServer) {
        httpServer.close(() => {
            console.log('[HTTP] Server closed');
        });
    }

    // Cleanup maintenance job
    if (maintenanceInterval) {
        clearInterval(maintenanceInterval);
        console.log('[DB] Maintenance job stopped');
    }

    // Close MQTT connection
    if (mqttClient) {
        mqttClient.end(false, () => {
            console.log('[MQTT] Client disconnected');
        });
    }

    // Close database connection
    closeDatabase();

    // Exit after a reasonable timeout
    setTimeout(() => {
        console.log('[APP] Shutdown timeout exceeded, forcing exit');
        process.exit(1);
    }, 5000);
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// ── Unhandled Error Handlers ──────────────────────────────────
process.on('uncaughtException', (err) => {
    console.error('[APP] Uncaught exception:', err);
    gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('[APP] Unhandled rejection at', promise, ':', reason);
});
