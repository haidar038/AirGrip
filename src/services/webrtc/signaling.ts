import { DeviceRole } from '../../types';

interface SignalingMessage {
  type: 'offer' | 'answer' | 'candidate';
  data: any;
  from: string;
  role: DeviceRole;
}

export class SignalingService {
  private localId: string;
  private role: DeviceRole;
  private messageCallback?: (message: SignalingMessage) => void;

  constructor(role: DeviceRole) {
    this.localId = crypto.randomUUID();
    this.role = role;
    this.setupBroadcastChannel();
  }

  private setupBroadcastChannel() {
    const channel = new BroadcastChannel('webrtc-signaling');
    
    channel.onmessage = (event) => {
      const message = event.data as SignalingMessage;
      if (message.from !== this.localId) {
        this.messageCallback?.(message);
      }
    };
  }

  public sendSignal(type: SignalingMessage['type'], data: any) {
    const channel = new BroadcastChannel('webrtc-signaling');
    const message: SignalingMessage = {
      type,
      data,
      from: this.localId,
      role: this.role
    };
    channel.postMessage(message);
  }

  public onMessage(callback: (message: SignalingMessage) => void) {
    this.messageCallback = callback;
  }

  public getId() {
    return this.localId;
  }
}