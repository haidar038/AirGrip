export type DeviceRole = 'sender' | 'receiver';

export interface FileTransfer {
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: 'pending' | 'transferring' | 'completed' | 'failed';
}

export interface Peer {
  id: string;
  role: DeviceRole;
  connection: RTCPeerConnection;
}