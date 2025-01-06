import { create } from 'zustand';
import { DeviceRole, FileTransfer, Peer } from '../types';

interface AppState {
  role: DeviceRole | null;
  peers: Peer[];
  transfers: FileTransfer[];
  isDarkMode: boolean;
  setRole: (role: DeviceRole) => void;
  addPeer: (peer: Peer) => void;
  removePeer: (id: string) => void;
  addTransfer: (transfer: FileTransfer) => void;
  updateTransfer: (id: string, updates: Partial<FileTransfer>) => void;
  toggleDarkMode: () => void;
}

export const useStore = create<AppState>((set) => ({
  role: null,
  peers: [],
  transfers: [],
  isDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
  
  setRole: (role) => set({ role }),
  
  addPeer: (peer) => 
    set((state) => ({ peers: [...state.peers, peer] })),
  
  removePeer: (id) =>
    set((state) => ({ peers: state.peers.filter((p) => p.id !== id) })),
  
  addTransfer: (transfer) =>
    set((state) => ({ transfers: [...state.transfers, transfer] })),
  
  updateTransfer: (id, updates) =>
    set((state) => ({
      transfers: state.transfers.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    })),
  
  toggleDarkMode: () =>
    set((state) => ({ isDarkMode: !state.isDarkMode })),
}));