class DeviceDiscovery {
    constructor() {
        this.devices = new Map();
        this.selectedDevice = null;
    }

    async startBroadcast() {
        // Generate unique device ID
        this.deviceId = crypto.randomUUID();

        // Setup WebSocket connection for device discovery
        this.ws = new WebSocket('ws://' + window.location.hostname + ':8080');

        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);

            if (message.type === 'device-announcement') {
                this.addDevice(message.deviceId, message.deviceName);
            } else if (message.type === 'device-removal') {
                this.removeDevice(message.deviceId);
            }
        };

        // Broadcast device presence
        setInterval(() => {
            this.ws.send(
                JSON.stringify({
                    type: 'device-announcement',
                    deviceId: this.deviceId,
                    deviceName: this.getDeviceName(),
                })
            );
        }, 1000);
    }

    getDeviceName() {
        return navigator.platform + ' - ' + navigator.userAgent.split(' ')[0];
    }

    addDevice(deviceId, deviceName) {
        if (deviceId !== this.deviceId && !this.devices.has(deviceId)) {
            this.devices.set(deviceId, deviceName);
            this.updateDeviceList();
        }
    }

    removeDevice(deviceId) {
        if (this.devices.has(deviceId)) {
            this.devices.delete(deviceId);
            this.updateDeviceList();
        }
    }

    updateDeviceList() {
        const deviceList = document.getElementById('deviceList');
        deviceList.innerHTML = '<h2>Nearby Devices</h2>';

        this.devices.forEach((name, id) => {
            const deviceElement = document.createElement('div');
            deviceElement.className = 'device-item';
            if (this.selectedDevice === id) {
                deviceElement.classList.add('selected');
            }

            deviceElement.textContent = name;
            deviceElement.onclick = () => this.selectDevice(id);

            deviceList.appendChild(deviceElement);
        });
    }

    selectDevice(deviceId) {
        this.selectedDevice = deviceId;
        this.updateDeviceList();
        updateStatus('Ready to send files. Make a grab gesture to select files.');
    }
}
