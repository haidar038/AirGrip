import { Server } from 'ws';

const connectedDevices = new Map();

export default function handler(req, res) {
    if (!res.socket.server.ws) {
        const wss = new Server({ noServer: true });

        wss.on('connection', (ws) => {
            ws.on('message', (message) => {
                const data = JSON.parse(message);

                if (data.type === 'device-announcement') {
                    connectedDevices.set(ws, { id: data.deviceId, name: data.deviceName });
                    broadcastDevices(wss);
                }
            });

            ws.on('close', () => {
                connectedDevices.delete(ws);
                broadcastDevices(wss);
            });
        });

        res.socket.server.ws = wss;
    }

    res.socket.server.ws.handleUpgrade(req, req.socket, Buffer.alloc(0), (ws) => {
        res.socket.server.ws.emit('connection', ws);
    });
}

function broadcastDevices(wss) {
    const devices = Array.from(connectedDevices.values());
    wss.clients.forEach((client) => {
        client.send(JSON.stringify({ type: 'devices-update', devices }));
    });
}
