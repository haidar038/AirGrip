import React, { useEffect, useState } from 'react';
import { Laptop2, RefreshCw } from 'lucide-react';
import { useStore } from '../../store';
import { PeerConnection } from '../../services/webrtc/peerConnection';
import { SignalingService } from '../../services/webrtc/signaling';

export function DeviceDiscovery() {
  const [isSearching, setIsSearching] = useState(false);
  const { role, peers, addPeer, removePeer } = useStore();
  const [signaling, setSignaling] = useState<SignalingService | null>(null);

  useEffect(() => {
    if (!role) return;
    
    const signalingService = new SignalingService(role);
    setSignaling(signalingService);
    startDiscovery(signalingService);

    return () => stopDiscovery();
  }, [role]);

  const startDiscovery = async (signalingService: SignalingService) => {
    if (!role) return;

    setIsSearching(true);
    try {
      const peer = new PeerConnection(role === 'sender');
      
      signalingService.onMessage(async (message) => {
        if (message.type === 'offer' && role === 'receiver') {
          await peer.signal(message.data);
          const answer = await peer.getSignalData();
          signalingService.sendSignal('answer', answer);
        } else if (message.type === 'answer' && role === 'sender') {
          await peer.signal(message.data);
        }
      });

      if (role === 'sender') {
        const offer = await peer.getSignalData();
        signalingService.sendSignal('offer', offer);
      }

      peer.onPeer((peerId, peerRole) => {
        addPeer({
          id: peerId,
          role: peerRole,
          connection: peer.getRTCConnection()
        });
        setIsSearching(false);
      });
    } catch (error) {
      console.error('Failed to start discovery:', error);
      setIsSearching(false);
    }
  };

  const stopDiscovery = () => {
    setIsSearching(false);
    peers.forEach(peer => {
      peer.connection.close();
      removePeer(peer.id);
    });
  };

  const refreshDiscovery = () => {
    if (signaling) {
      stopDiscovery();
      startDiscovery(signaling);
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Available Devices
        </h3>
        <button
          onClick={refreshDiscovery}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          title="Refresh devices"
        >
          <RefreshCw className={`w-5 h-5 ${isSearching ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-2">
        {peers.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {isSearching ? (
              <p>Searching for devices...</p>
            ) : (
              <p>No devices found. Make sure other devices are on the same network and browser tab is open.</p>
            )}
          </div>
        ) : (
          peers.map((peer) => (
            <div
              key={peer.id}
              className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-3">
                <Laptop2 className="w-6 h-6 text-gray-400 dark:text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {peer.role === 'sender' ? 'Sender Device' : 'Receiver Device'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Connected
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}