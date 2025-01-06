export const config = {
    runtime: 'edge',
};

const connectedDevices = new Map();

export default async function handler(req) {
    const { headers } = req;
    const { searchParams } = new URL(req.url);

    if (headers.get('upgrade') !== 'websocket') {
        return new Response('Expected websocket', { status: 426 });
    }

    const { socket, response } = Deno.upgradeWebSocket(req);

    socket.onopen = () => {
        console.log('Client connected');
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'device-announcement') {
            connectedDevices.set(socket, { id: data.deviceId, name: data.deviceName });
            broadcastDevices();
        }
    };

    socket.onclose = () => {
        connectedDevices.delete(socket);
        broadcastDevices();
    };

    function broadcastDevices() {
        const devices = Array.from(connectedDevices.values());
        for (const client of connectedDevices.keys()) {
            client.send(JSON.stringify({ type: 'devices-update', devices }));
        }
    }

    return response;
}
