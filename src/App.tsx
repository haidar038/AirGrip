import React from 'react';
import { Send, Download, Moon, Sun } from 'lucide-react';
import { useStore } from './store';
import { GestureDetector } from './components/gesture/GestureDetector';
import { FileTransfer } from './components/transfer/FileTransfer';

function App() {
  const { role, isDarkMode, setRole, toggleDarkMode } = useStore();

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-100'}`}>
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Gesture File Transfer
          </h1>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {isDarkMode ? (
              <Sun className="w-6 h-6 text-white" />
            ) : (
              <Moon className="w-6 h-6 text-gray-900" />
            )}
          </button>
        </header>

        {!role ? (
          <div className="flex flex-col items-center justify-center space-y-8">
            <h2 className={`text-2xl ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Choose your role
            </h2>
            <div className="flex space-x-4">
              <button
                onClick={() => setRole('sender')}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Send className="w-5 h-5" />
                <span>Sender</span>
              </button>
              <button
                onClick={() => setRole('receiver')}
                className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Download className="w-5 h-5" />
                <span>Receiver</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
              <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Gesture Detection
              </h2>
              <GestureDetector />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
              <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {role === 'sender' ? 'Send Files' : 'Receive Files'}
              </h2>
              <FileTransfer />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;