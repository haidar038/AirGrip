let mode = null;
let gestureDetector;
let fileTransfer;
let videoElement;
let gestureCanvas;
let ctx;
let videoStream;
let deviceDiscovery;

async function initialize() {
    videoElement = document.getElementById('videoElement');
    gestureCanvas = document.getElementById('gestureCanvas');
    ctx = gestureCanvas.getContext('2d');

    gestureDetector = new GestureDetector();
    await gestureDetector.initialize();

    fileTransfer = new FileTransfer();

    deviceDiscovery = new DeviceDiscovery();
    await deviceDiscovery.startBroadcast();

    updateStatus('Select a device to begin transfer');
}

function updateStatus(message) {
    document.getElementById('status').textContent = message;
}

function showLoading(show) {
    document.getElementById('loading').classList.toggle('active', show);
}

function updateProgress(percent) {
    document.getElementById('progress').textContent = `${Math.round(percent)}%`;
}

async function setMode(newMode) {
    mode = newMode;
    document.getElementById('status').textContent = `Mode: ${mode}`;

    if (!videoStream) {
        videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoElement.srcObject = videoStream;
    }

    if (mode === 'sender') {
        document.getElementById('fileInput').style.display = 'block';
        startGestureDetection();
    }
}

async function startGestureDetection() {
    const detectFrame = async () => {
        const gesture = await gestureDetector.detectGestures(videoElement);

        if (gesture === 'grab') {
            document.getElementById('fileInput').click();
        } else if (gesture === 'release') {
            const files = document.getElementById('fileInput').files;
            if (files.length) {
                await fileTransfer.sendFiles(Array.from(files));
            }
        }

        requestAnimationFrame(detectFrame);
    };

    requestAnimationFrame(detectFrame);
}

initialize();
