import React, { useCallback, useState } from 'react';
import { FileUp, File as FileIcon } from 'lucide-react';
import { useStore } from '../../store';
import { FileTransfer as FileTransferType } from '../../types';
import { DeviceDiscovery } from './DeviceDiscovery';

export function FileTransfer() {
  const [dragActive, setDragActive] = useState(false);
  const { role, addTransfer, peers } = useStore();
  const isSender = role === 'sender';

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  }, []);

  const handleFiles = (files: FileList) => {
    if (peers.length === 0) {
      alert('Please connect to a receiver device first');
      return;
    }

    Array.from(files).forEach(file => {
      const transfer: FileTransferType = {
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type,
        progress: 0,
        status: 'pending'
      };
      addTransfer(transfer);
      
      // Send file to all connected peers
      peers.forEach(peer => {
        if (peer.connection.connectionState === 'connected') {
          // Send file through the RTCPeerConnection
          const channel = peer.connection.createDataChannel(`file-${transfer.id}`);
          channel.onopen = () => {
            const reader = new FileReader();
            reader.onload = (e) => {
              const data = e.target?.result;
              if (data) {
                channel.send(data);
              }
            };
            reader.readAsArrayBuffer(file);
          };
        }
      });
    });
  };

  return (
    <div className="space-y-6">
      <DeviceDiscovery />
      
      {isSender && (
        <>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors
              ${dragActive 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-gray-300 dark:border-gray-700'}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <FileUp className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Drag and drop files here, or
            </p>
            <label className="inline-block">
              <input
                type="file"
                className="hidden"
                onChange={handleFileInput}
                multiple
              />
              <span className="cursor-pointer inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Select Files
              </span>
            </label>
          </div>

          <div className="space-y-2">
            {useStore.getState().transfers.map((transfer) => (
              <div
                key={transfer.id}
                className="flex items-center space-x-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow"
              >
                <FileIcon className="h-8 w-8 text-gray-400 dark:text-gray-600" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {transfer.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {(transfer.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <div className="w-24">
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div
                      className="h-2 bg-blue-600 rounded-full transition-all duration-300"
                      style={{ width: `${transfer.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}