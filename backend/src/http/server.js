import http from 'http';
import { sendWifiPortalOpen, sendWifiPortalClose, sendCommand } from '../mqtt/publisher.js';

/**
 * Create HTTP control server for sending commands to the device
 * Binds only to localhost (127.0.0.1) — local control interface only
 */
export function createHttpServer(port = 3000) {
    const server = http.createServer(async (req, res) => {
        // Only accept POST requests
        if (req.method !== 'POST') {
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

    if (path === '/wifi/open') {
        const result = await sendWifiPortalOpen();
        res.writeHead(result.ok ? 200 : 500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
        return;
    }

    if (path === '/wifi/close') {
        const result = await sendWifiPortalClose();
        res.writeHead(result.ok ? 200 : 500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
        return;
    }

    if (path === '/command') {
        let payload;
        try {
            const json = JSON.parse(body);
            payload = json.payload;
        } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid JSON body. Expected { "payload": "..." }' }));
            return;
        }

        if (!payload) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'payload field is required' }));
            return;
        }

        const result = await sendCommand('FSIOT_WD1M_001', payload);
        res.writeHead(result.ok ? 200 : 500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
        return;
    }

    // 404
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
}
