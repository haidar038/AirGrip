class DeviceDiscovery {
    constructor() {
        this.devices = new Map();
        this.deviceId = crypto.randomUUID();
    }

    async startBroadcast() {
        this.ws = new WebSocket(`wss://${window.location.hostname}/api/websocket`);
        console.log(`Attempting WebSocket connection to: wss://${window.location.hostname}/api/websocket`);

        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'devices-update') {
                this.updateDevices(message.devices);
            }
        };

        this.ws.onopen = () => {
            this.sendAnnouncement();
            setInterval(() => this.sendAnnouncement(), 5000);
        };
    }

    sendAnnouncement() {
        this.ws.send(
            JSON.stringify({
                type: 'device-announcement',
                deviceId: this.deviceId,
                deviceName: this.getDeviceName(),
            })
        );
    }
}

console.log(`Attempting WebSocket connection to: wss://${window.location.hostname}/api/websocket`);
