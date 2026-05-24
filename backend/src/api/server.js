import http from 'http';
import { sendWifiConfig, sendCommand } from '../mqtt/publisher.js';

/**
 * Create HTTP control server for sending commands to the device
 * Binds only to localhost (127.0.0.1) — local control interface only
 */
export function createHttpServer(port = 3000) {
    const server = http.createServer(async (req, res) => {
        // Allow GET /health and POST for control endpoints
        if (req.method !== 'POST' && req.method !== 'GET') {
            res.writeHead(405, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Method not allowed' }));
            return;
        }

        // Collect request body
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('error', (err) => {
            console.error('[HTTP] Request error:', err.message);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Bad request' }));
        });

        req.on('end', async () => {
            try {
                await handleRequest(req, res, body);
            } catch (err) {
                console.error('[HTTP] Handler error:', err.message);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Internal server error' }));
            }
        });
    });

    return server;
}

async function handleRequest(req, res, body) {
    const url = new URL(req.url, 'http://localhost');
    const path = url.pathname;

    // Health check endpoint
    if (req.method === 'GET' && path === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok' }));
        return;
    }

    if (path === '/wifi/open') {
        let deviceId;
        try {
            const json = JSON.parse(body);
            deviceId = json.deviceId;
        } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid JSON body. Expected { "deviceId": "..." }' }));
            return;
        }
        const result = await sendWifiConfig(deviceId, 'open');
        res.writeHead(result.ok ? 200 : 500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
        return;
    }

    if (path === '/wifi/close') {
        let deviceId;
        try {
            const json = JSON.parse(body);
            deviceId = json.deviceId;
        } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid JSON body. Expected { "deviceId": "..." }' }));
            return;
        }
        const result = await sendWifiConfig(deviceId, 'close');
        res.writeHead(result.ok ? 200 : 500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
        return;
    }

    if (path === '/command') {
        let payload, deviceId;
        try {
            const json = JSON.parse(body);
            payload = json.payload;
            deviceId = json.deviceId;
        } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid JSON body. Expected { "payload": "...", "deviceId": "..." }' }));
            return;
        }

        if (!payload || !deviceId) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'payload and deviceId fields are required' }));
            return;
        }

        const result = await sendCommand(deviceId, payload);
        res.writeHead(result.ok ? 200 : 500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
        return;
    }

    // 404
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
}
