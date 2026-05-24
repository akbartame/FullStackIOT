import express from 'express';
import { sendWifiConfig, sendCommand } from '../mqtt/publisher.js';

/**
 * Create an Express-based HTTP control server for device commands.
 */
export function createHttpServer(port = 3000) {
    const app = express();

    app.use(express.json());

    app.get('/health', (req, res) => {
        res.status(200).json({ status: 'ok' });
    });

    app.post('/wifi/open', async (req, res) => {
        const { deviceId } = req.body || {};
        if (!deviceId) {
            return res.status(400).json({ error: 'deviceId is required' });
        }

        try {
            const result = await sendWifiConfig(deviceId, 'open');
            return res.status(result.ok ? 200 : 500).json(result);
        } catch (err) {
            console.error('[API] /wifi/open error:', err.message);
            return res.status(500).json({ error: 'Failed to send wifi open command' });
        }
    });

    app.post('/wifi/close', async (req, res) => {
        const { deviceId } = req.body || {};
        if (!deviceId) {
            return res.status(400).json({ error: 'deviceId is required' });
        }

        try {
            const result = await sendWifiConfig(deviceId, 'close');
            return res.status(result.ok ? 200 : 500).json(result);
        } catch (err) {
            console.error('[API] /wifi/close error:', err.message);
            return res.status(500).json({ error: 'Failed to send wifi close command' });
        }
    });

    app.post('/command', async (req, res) => {
        const { deviceId, payload } = req.body || {};
        if (!deviceId || !payload) {
            return res.status(400).json({ error: 'deviceId and payload are required' });
        }

        try {
            const result = await sendCommand(deviceId, payload);
            return res.status(result.ok ? 200 : 500).json(result);
        } catch (err) {
            console.error('[API] /command error:', err.message);
            return res.status(500).json({ error: 'Failed to send command' });
        }
    });

    app.use((req, res) => {
        res.status(404).json({ error: 'Not found' });
    });

    return app;
}
