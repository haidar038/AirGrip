class FileTransfer {
    constructor() {
        this.peerConnection = null;
        this.dataChannel = null;
        this.files = [];
        this.chunks = [];
        this.isReceiving = false;
    }

    async initializeSender() {
        this.peerConnection = new RTCPeerConnection();
        this.dataChannel = this.peerConnection.createDataChannel('fileTransfer');
        this.setupDataChannel();

        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);
        return offer;
    }

    async initializeReceiver(offer) {
        this.peerConnection = new RTCPeerConnection();
        this.peerConnection.ondatachannel = (event) => {
            this.dataChannel = event.channel;
            this.setupDataChannel();
        };

        await this.peerConnection.setRemoteDescription(offer);
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);
        return answer;
    }

    setupDataChannel() {
        this.dataChannel.binaryType = 'arraybuffer';

        this.dataChannel.onmessage = async (event) => {
            if (typeof event.data === 'string') {
                const metadata = JSON.parse(event.data);
                if (metadata.type === 'start') {
                    this.isReceiving = true;
                    this.chunks = [];
                } else if (metadata.type === 'end') {
                    this.isReceiving = false;
                    const blob = new Blob(this.chunks);
                    const url = URL.createObjectURL(blob);
                    this.downloadFile(url, metadata.filename);
                }
            } else {
                this.chunks.push(event.data);
            }
        };
    }

    async sendFiles(files) {
        showLoading(true);
        updateProgress(0);

        for (const file of files) {
            const totalChunks = Math.ceil(file.size / this.chunkSize);
            let sentChunks = 0;

            this.dataChannel.send(
                JSON.stringify({
                    type: 'start',
                    filename: file.name,
                    size: file.size,
                })
            );

            const chunkSize = 16384;
            const reader = new FileReader();
            let offset = 0;

            while (offset < file.size) {
                const chunk = file.slice(offset, offset + chunkSize);
                const buffer = await new Promise((resolve) => {
                    reader.onload = (e) => resolve(e.target.result);
                    reader.readAsArrayBuffer(chunk);
                });

                this.dataChannel.send(buffer);
                offset += chunkSize;
            }

            this.dataChannel.send(JSON.stringify({ type: 'end', filename: file.name }));

            sentChunks++;
            const progress = (sentChunks / totalChunks) * 100;
            updateProgress(progress);
        }

        showLoading(false);
        updateStatus('Files sent successfully!');
    }

    downloadFile(url, filename) {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}
