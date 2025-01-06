import SimplePeer from 'simple-peer';
import { DeviceRole } from '../../types';

// Type definitions for browser WebRTC APIs
declare global {
    interface Window {
        RTCPeerConnection: RTCPeerConnection;
        mozRTCPeerConnection: RTCPeerConnection;
        webkitRTCPeerConnection: RTCPeerConnection;
        RTCSessionDescription: RTCSessionDescription;
        RTCIceCandidate: RTCIceCandidate;
    }
}

export class PeerConnection {
    private peer: SimplePeer.Instance | null = null;
    private onPeerCallback?: (peerId: string, role: DeviceRole) => void;
    private onDataCallback?: (data: ArrayBuffer) => void;
    private chunkSize = 16384; // 16KB chunks

    constructor(initiator: boolean) {
        try {
            // Check if we're in a browser environment with WebRTC support
            if (typeof window === 'undefined') {
                throw new Error('WebRTC is only supported in browser environments');
            }

            const options: SimplePeer.Options = {
                initiator,
                trickle: false,
                config: {
                    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:global.stun.twilio.com:3478' }],
                },
            };

            // Create the peer instance
            this.peer = new SimplePeer(options);

            if (!this.peer) {
                throw new Error('Failed to create SimplePeer instance');
            }

            this.setupListeners();
        } catch (error) {
            console.error('Error initializing PeerConnection:', error);
            throw error;
        }
    }

    private setupListeners() {
        if (!this.peer) {
            throw new Error('Peer instance not initialized');
        }

        this.peer.on('error', this.handleError);
        this.peer.on('data', this.handleData);
        this.peer.on('connect', this.handleConnect);
        this.peer.on('signal', this.handleSignal);

        // Debug listeners
        this.peer.on('close', () => console.log('Peer connection closed'));
        this.peer.on('end', () => console.log('Peer connection ended'));
    }

    private handleError = (err: Error) => {
        console.error('Peer connection error:', err);
        this.destroy();
    };

    private handleData = (data: string | ArrayBuffer | Uint8Array) => {
        try {
            if (!this.peer) return;

            if (typeof data === 'string') {
                const message = JSON.parse(data);
                if (message.type === 'peer-info' && this.onPeerCallback) {
                    this.onPeerCallback(message.peerId, message.role);
                }
            } else if (data instanceof ArrayBuffer || data instanceof Uint8Array) {
                if (this.onDataCallback) {
                    this.onDataCallback(data instanceof Uint8Array ? data.buffer : data);
                }
            }
        } catch (err) {
            console.error('Error handling peer data:', err);
        }
    };

    private handleConnect = () => {
        console.log('Peer connection established');
    };

    private handleSignal = (data: SimplePeer.SignalData) => {
        console.log('Signal data generated:', JSON.stringify(data, null, 2));
    };

    public getRTCConnection(): RTCPeerConnection | null {
        if (!this.peer) return null;
        return (this.peer as SimplePeer.Instance & { _pc: RTCPeerConnection })._pc;
    }

    public onPeer(callback: (peerId: string, role: DeviceRole) => void) {
        this.onPeerCallback = callback;
    }

    public onData(callback: (data: ArrayBuffer) => void) {
        this.onDataCallback = callback;
    }

    public async signal(data: SimplePeer.SignalData): Promise<void> {
        if (!this.peer) throw new Error('Peer not initialized');

        try {
            this.peer.signal(data);
        } catch (err) {
            console.error('Error signaling peer:', err);
            throw err;
        }
    }

    public getSignalData(): Promise<SimplePeer.SignalData> {
        if (!this.peer) throw new Error('Peer not initialized');

        return new Promise((resolve, reject) => {
            try {
                const handleSignal = (data: SimplePeer.SignalData) => {
                    this.peer?.removeListener('signal', handleSignal);
                    resolve(data);
                };

                this.peer?.on('signal', handleSignal);
            } catch (err) {
                reject(err);
            }
        });
    }

    public sendData(data: string | ArrayBuffer) {
        if (!this.peer) throw new Error('Peer not initialized');

        try {
            this.peer.send(data);
        } catch (err) {
            console.error('Error sending data:', err);
            throw err;
        }
    }

    public async sendFile(file: File) {
        if (!this.peer) throw new Error('Peer not initialized');

        try {
            const metadata = {
                type: 'file-metadata',
                name: file.name,
                size: file.size,
                mimeType: file.type,
            };
            this.sendData(JSON.stringify(metadata));

            const buffer = await file.arrayBuffer();
            for (let offset = 0; offset < buffer.byteLength; offset += this.chunkSize) {
                const chunk = buffer.slice(offset, offset + this.chunkSize);
                this.sendData(chunk);
                // Rate limiting to prevent overwhelming the connection
                await new Promise((resolve) => setTimeout(resolve, 10));
            }
        } catch (err) {
            console.error('Error sending file:', err);
            throw err;
        }
    }

    public destroy() {
        try {
            if (this.peer) {
                this.peer.destroy();
                this.peer = null;
            }
        } catch (err) {
            console.error('Error destroying peer:', err);
        }
    }
}
